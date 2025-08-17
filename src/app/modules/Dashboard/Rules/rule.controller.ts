import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { RuleService } from './rule.service';
import AppError from '../../../error/AppError';

//privacy policy
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const { ...privacyData } = req.body;
  const result = await RuleService.createPrivacyPolicyToDB(privacyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy created successfully',
    data: result,
  });
});

const getPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await RuleService.getPrivacyPolicyFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy retrieved successfully',
    data: result,
  });
});

//terms and conditions
const createTermsAndCondition = catchAsync(
  async (req: Request, res: Response) => {
    const { ...termsData } = req.body;
    const result = await RuleService.createTermsAndConditionToDB(termsData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Terms and conditions created successfully',
      data: result,
    });
  },
);

const getTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
  const result = await RuleService.getTermsAndConditionFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms and conditions retrieved successfully',
    data: result,
  });
});

//about
const createAbout = catchAsync(async (req: Request, res: Response) => {
  const { ...aboutData } = req.body;
  const result = await RuleService.createAboutToDB(aboutData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About created successfully',
    data: result,
  });
});

const getAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await RuleService.getAboutFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About retrieved successfully',
    data: result,
  });
});
//update rule
const updateRuleContent = catchAsync(async (req: Request, res: Response) => {
  const { type, content } = req.body;

  if (!type || !content) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'type and content are required',
    );
  }

  const updated = await RuleService.updateRuleContentToDB(type, content);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: `${type} updated successfully`,
    data: updated,
  });
});

export const RuleController = {
  createPrivacyPolicy,
  getPrivacyPolicy,
  createTermsAndCondition,
  getTermsAndCondition,
  createAbout,
  getAbout,
  updateRuleContent,
};
