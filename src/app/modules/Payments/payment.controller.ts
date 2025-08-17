import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import stripe from '../../config/stripe';
import config from '../../config/index';
import { PaymentService } from './payment.service';
import { sendEmail } from '../../utils/mailSender';
import { TUser } from '../user/user.interface';
import { v4 as uuidv4 } from 'uuid';
import mongoose, { Types } from 'mongoose';
import { io } from '../../../server';
import { saveNotification } from '../../utils/saveNotification';
// import { sendUserNotification, sendAdminNotification } from '../../../socketIo';
import { Subscription } from '../Dashboard/Subscription/subscription.model';
import User from '../user/user.model';
import { Admin } from '../Dashboard/admin/admin.model';

// Helper to generate invoiceId if none from Stripe
const generateInvoiceId = (): string => {
  return `INV-${uuidv4()}`;
};

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  let { amount } = req.body;
  const userId = req.user?.id;

  if (!amount || isNaN(Number(amount))) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Amount is required and must be a valid number',
    });
  }

  amount = Number(amount);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    await saveNotification({
      userId,
      userType: 'User',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      type: 'payment',
    });

    const allAdmins = await Admin.find();
    for (const admin of allAdmins) {
      await saveNotification({
        userId: (admin._id as Types.ObjectId).toString(),
        userType: 'Admin',
        title: 'Payment Failed',
        message: `User ${userId} attempted a payment but it failed.`,
        type: 'payment',
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error instanceof Error ? error.message : error,
    });
  }
});

const savePayment = catchAsync(async (req: Request, res: Response) => {
  const {
    subscriptionId,
    amount,
    transactionId,
    invoiceId: clientInvoiceId,
    status,
  } = req.body;
  const userId = req.user?.id;

  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
  const stripeInvoiceId = paymentIntent.invoice || null;
  const finalInvoiceId =
    clientInvoiceId || stripeInvoiceId || generateInvoiceId();

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Subscription plan not found');
  }

  const now = new Date();
  let validTill = new Date(now);
  if (subscription.billingCycle === 'monthly') {
    validTill.setMonth(validTill.getMonth() + 1);
  } else if (subscription.billingCycle === 'yearly') {
    validTill.setFullYear(validTill.getFullYear() + 1);
  }

  const result = await PaymentService.savePaymentDetails({
    user: userId,
    subscriptionId,
    amount,
    transactionId,
    invoiceId: finalInvoiceId,
    status,
    paymentDate: new Date(),
  });

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to save payment!');
  }

  await User.findByIdAndUpdate(userId, {
    subscription: {
      plan: subscription._id,
      startsAt: now,
      expiresAt: validTill,
      status: 'active',
    },
  });

  await saveNotification({
    userId,
    userType: 'User',
    title: 'Payment Successful',
    message: `Your payment of $${amount} was successful!`,
    type: 'payment',
  });

  const allAdmins = await Admin.find();
  for (const admin of allAdmins) {
    await saveNotification({
      userId: (admin._id as Types.ObjectId).toString(),
      userType: 'Admin',
      title: 'New Payment',
      message: `User ${userId} made a payment of $${amount}.`,
      type: 'payment',
    });
  }

  const userEmail = (result.user as TUser).email;
  if (userEmail) {
    await sendEmail(
      userEmail,
      'Payment Successful',
      `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment of <strong>$${amount}</strong>.</p>
      <p>Transaction ID: ${transactionId}</p>
      <p>Invoice ID: ${finalInvoiceId}</p>
      <p>Status: ${status}</p>
      <p>Thank you for your subscription!</p>
      `,
    );
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment saved successfully',
    data: result,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = config.stripe_webhook_secret;

  if (!sig || !webhookSecret) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('Missing signature or webhook secret');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      webhookSecret,
    );
  } catch (err: any) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      await PaymentService.updatePaymentStatus(paymentIntent.id, 'succeeded');

      const payment = await PaymentService.findByTransactionId(
        paymentIntent.id,
      );
      if (payment) {
        await saveNotification({
          userId: payment.user.toString(),
          userType: 'User',
          title: 'Payment Successful',
          message: `Your payment of $${payment.amount} was successful!`,
          type: 'payment',
        });

        const allAdmins = await Admin.find();
        for (const admin of allAdmins) {
          await saveNotification({
            userId: (admin._id as Types.ObjectId).toString(),
            userType: 'Admin',
            title: 'New Payment',
            message: `User ${payment.user} made a payment of $${payment.amount}.`,
            type: 'payment',
          });
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      await PaymentService.updatePaymentStatus(paymentIntent.id, 'failed');
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(StatusCodes.OK).json({ received: true });
};

// Other existing controller functions below unchanged...

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PaymentService.getSinglePayment(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

const getTotalEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTotalEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Total earnings fetched successfully',
    data: total,
  });
});

const getTodaysEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTodaysEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Today's earnings fetched successfully",
    data: total,
  });
});

const getMonthlyEarningsStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.getMonthlyEarningsStats();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly earnings stats fetched successfully',
      data: result,
    });
  },
);

const getEarningsOverview = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const result = await PaymentService.get12MonthGrowthPercentage(year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: '12-month earnings overview fetched successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  savePayment,
  getAllPayments,
  getSinglePayment,
  getTotalEarnings,
  getTodaysEarnings,
  getMonthlyEarningsStats,
  getEarningsOverview,
  stripeWebhook,
};
