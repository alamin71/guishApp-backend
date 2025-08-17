import QueryBuilder from '../../builder/QueryBuilder';
import Wallet from './wallet.model';
import AppError from '../../error/AppError';

const insertTextToWallet = async (payload: any) => {
  console.log('🔥 Payload saving to DB:', JSON.stringify(payload, null, 2));
  const result = await Wallet.create(payload);
  return result;
};
const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024;

const insertAudioToWallet = async (payload: any) => {
  const audioFile = payload?.voice?.file;

  if (!audioFile) {
    throw new AppError(400, 'Audio file is missing');
  }

  if (audioFile.size > MAX_AUDIO_FILE_SIZE) {
    throw new AppError(400, 'Audio file size exceeds 50MB limit');
  }

  const result = await Wallet.create(payload);
  return result;
};
const saveAiImageToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};
const insertVideosOrImagesToWallet = async (payload: any) => {
  const result = await Wallet.create(payload);
  return result;
};

const getMyWalletData = async (query: Record<string, any>) => {
  const walletModel = new QueryBuilder(Wallet.find({ isDeleted: false }), query)
    .search([
      'text.title',
      'text.description',
      'voice.title',
      'imageVideo.title',
    ])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await walletModel.modelQuery;
  const meta = await walletModel.countTotal();
  return {
    data,
    meta,
  };
};

const deleteWalletData = async (id: string, userId: string) => {
  const wallet = await Wallet.findOne({
    _id: id,
    user: userId,
    isDeleted: false,
  });

  if (!wallet) {
    throw new AppError(404, 'Wallet data not found or already deleted');
  }

  wallet.isDeleted = true;
  await wallet.save();

  return wallet;
};

const walletService = {
  insertTextToWallet,
  insertAudioToWallet,
  saveAiImageToWallet,
  insertVideosOrImagesToWallet,
  getMyWalletData,
  deleteWalletData,
};
export default walletService;
