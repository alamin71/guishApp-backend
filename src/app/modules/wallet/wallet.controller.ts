import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadManyToS3, uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import walletService from './wallet.service';
import { generateAIImage } from '../../utils/aiImageGenerator';
import { uploadFromUrlToS3 } from '../../utils/uploadFromUrlToS3';

const insertTextToWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const result = await walletService.insertTextToWallet({
    text: {
      title: req.body.title,
      description: req.body.description,
    },
    user: userId,
    type: 'text',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Note added successfully',
    data: result,
  });
});

const insertAudioToWallet = catchAsync(async (req: Request, res: Response) => {
  const { title } = req.body;
  const { userId } = req.user;

  let voiceLink;

  if (req?.file) {
    voiceLink = await uploadToS3(req.file, 'voice/');
    console.log('Uploaded Voice File:', voiceLink);
  }

  const result = await walletService.insertAudioToWallet({
    user: userId,
    type: 'voice',
    voice: {
      title,
      voiceLink,
      file: req.file,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Voice added successfully',
    data: result,
  });
});

const generateAiImage = catchAsync(async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Prompt is required',
      data: null,
    });
  }

  const openaiImageUrl = await generateAIImage(prompt);
  const s3Image = await uploadFromUrlToS3(openaiImageUrl, 'wallet/aiImage/');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI image generated successfully',
    data: {
      prompt,
      openaiImageUrl,
      s3ImageUrl: s3Image.url,
      s3ImageId: s3Image.id,
    },
  });
});

const saveAiImageToWallet = catchAsync(async (req: Request, res: Response) => {
  const { prompt, s3ImageUrl, s3ImageId } = req.body;
  const { userId } = req.user;

  if (!prompt || !s3ImageUrl || !s3ImageId) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Required fields missing',
      data: null,
    });
  }

  const result = await walletService.saveAiImageToWallet({
    user: userId,
    type: 'ai_generate',
    prompt,
    aiGenerate: {
      id: s3ImageId,
      url: s3ImageUrl,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI image saved successfully',
    data: result,
  });
});
const insertVideosOrImagesToWallet = catchAsync(
  async (req: Request, res: Response) => {
    let images: { url: string; id: string }[] = [];
    let videos: { url: string; id: string }[] = [];

    if (req?.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.images) {
        images = await uploadManyToS3(
          files.images.map((file) => ({
            file,
            path: 'wallet/images/',
          })),
        );
      }

      if (files?.videos) {
        videos = await uploadManyToS3(
          files.videos.map((file) => ({
            file,
            path: 'wallet/videos/',
          })),
        );
      }
    }

    const { userId } = req.user; // Get user ID from auth middleware

    const payload: any = {
      user: userId,
      type: 'image_video', //REQUIRED, matches Mongoose schema
      imageVideo: {
        title: req.body.title,
        description: req.body.description,
        images,
        videos,
      },
    };

    const result = await walletService.insertVideosOrImagesToWallet(payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Data inserted successfully',
      data: result,
    });
  },
);

const getMyWalletData = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const result = await walletService.getMyWalletData({
    ...req.query,
    user: userId,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wallet data retrieved successfully',
    data: result.data,
    meta: result?.meta,
  });
});
// const deleteWalletData = catchAsync(async (req: Request, res: Response) => {
//   const result = await walletService.deleteWalletData(req.params.id);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Wallet data deleted successfully',
//     data: result,
//   });
// });
const deleteWalletData = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await walletService.deleteWalletData(req.params.id, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wallet data deleted successfully',
    data: result,
  });
});

const walletController = {
  insertTextToWallet,
  insertAudioToWallet,
  generateAiImage,
  saveAiImageToWallet,
  insertVideosOrImagesToWallet,
  getMyWalletData,
  deleteWalletData,
};

export default walletController;
