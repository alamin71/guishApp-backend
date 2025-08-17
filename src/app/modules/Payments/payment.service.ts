import { Payment } from './payment.model';
import { IPayment } from './payment.interface';
import { subMonths, startOfMonth } from 'date-fns';
import QueryBuilder from '../../builder/QueryBuilder';

const savePaymentDetails = async (payload: IPayment) => {
  const created = await Payment.create(payload);
  return await Payment.findById(created._id)
    .populate('user')
    .populate('subscriptionId');
};
const findByTransactionId = async (transactionId: string) => {
  return await Payment.findOne({ transactionId })
    .populate('user')
    .populate('subscriptionId');
};

const getSinglePayment = async (id: string) => {
  return await Payment.findById(id).populate('user').populate('subscriptionId');
};

const getAllPayments = async (query: Record<string, any>) => {
  const { year, month } = query;

  // Optional date range filter
  if (year) {
    const y = parseInt(year);
    const m = month ? parseInt(month) : undefined;

    if (!isNaN(y)) {
      const startDate = new Date(y, m ? m - 1 : 0, 1);
      const endDate = m ? new Date(y, m, 0, 23, 59, 59) : new Date(y + 1, 0, 1);

      query.paymentDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  }

  const builder = new QueryBuilder(Payment.find(), query)
    .search(['transactionId', 'status'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await builder.modelQuery
    .populate('user')
    .populate('subscriptionId');

  const meta = await builder.countTotal();

  return {
    data,
    meta,
  };
};

const getTotalEarnings = async (): Promise<number> => {
  const result = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

//Today's Earnings
const getTodaysEarnings = async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const result = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        paymentDate: { $gte: today, $lt: tomorrow },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};
const getMonthlyEarningsStats = async () => {
  const startOfCurrentMonth = new Date();
  startOfCurrentMonth.setDate(1);
  startOfCurrentMonth.setHours(0, 0, 0, 0);

  const startOfPreviousMonth = new Date(startOfCurrentMonth);
  startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);

  const endOfPreviousMonth = new Date(startOfCurrentMonth);

  const currentMonthEarningsResult = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        paymentDate: { $gte: startOfCurrentMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const previousMonthEarningsResult = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        paymentDate: {
          $gte: startOfPreviousMonth,
          $lt: startOfCurrentMonth,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  const currentEarnings = currentMonthEarningsResult[0]?.total || 0;
  const previousEarnings = previousMonthEarningsResult[0]?.total || 0;

  const difference = currentEarnings - previousEarnings;
  const percentageChange =
    previousEarnings > 0
      ? (difference / previousEarnings) * 100
      : currentEarnings > 0
        ? 100
        : 0;

  return {
    currentEarnings,
    previousEarnings,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    trend: percentageChange >= 0 ? 'up' : 'down',
  };
};

const getEarningsLast12Months = async (year?: number) => {
  const now = new Date();
  const baseDate = year ? new Date(year, 11, 31) : now;
  const start = startOfMonth(subMonths(baseDate, 11));

  const earnings = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        paymentDate: { $gte: start, $lte: baseDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  const data: { month: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(baseDate, i);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const found = earnings.find(
      (e) => e._id.year === year && e._id.month === date.getMonth() + 1,
    );

    data.push({ month, total: found?.total || 0 });
  }

  return data;
};

const get12MonthGrowthPercentage = async (year?: number) => {
  const earnings = await getEarningsLast12Months(year);
  const first = earnings[0]?.total || 0;
  const last = earnings[11]?.total || 0;

  const difference = last - first;
  const percentageChange =
    first > 0 ? (difference / first) * 100 : last > 0 ? 100 : 0;

  return {
    earnings,
    growthPercentage: parseFloat(percentageChange.toFixed(2)),
    trend: percentageChange >= 0 ? 'up' : 'down',
  };
};
const updatePaymentStatus = async (transactionId: string, status: string) => {
  return await Payment.findOneAndUpdate(
    { transactionId },
    { status },
    { new: true },
  );
};

export const PaymentService = {
  savePaymentDetails,
  getSinglePayment,
  findByTransactionId,
  getAllPayments,
  getTotalEarnings,
  getTodaysEarnings,
  getMonthlyEarningsStats,
  getEarningsLast12Months,
  get12MonthGrowthPercentage,
  updatePaymentStatus,
};
