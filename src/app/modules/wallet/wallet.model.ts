import { model, Model, Schema } from 'mongoose';
import {
  IImageOrVideo,
  IImageVideo,
  IText,
  IVoice,
  IWallet,
} from './wallet.interface';

// Schemas
const textSchema = new Schema<IText>({
  title: { type: String },
  description: { type: String },
});

const voiceSchema = new Schema<IVoice>({
  title: { type: String },
  voiceLink: { id: { type: String }, url: { type: String } },
});

const imageVideoSchema = new Schema<IImageVideo>({
  title: { type: String },
  description: { type: String },
  images: [
    {
      id: { type: String },
      url: { type: String },
    },
  ],
  videos: [
    {
      id: { type: String },
      url: { type: String },
    },
  ],
});

const aiGenerateSchema = new Schema<IImageOrVideo>({
  id: { type: String },
  url: { type: String },
});

// Main Wallet Schema
const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'voice', 'image_video', 'ai_generate'],
      required: true,
    },
    text: textSchema,
    voice: voiceSchema,
    imageVideo: imageVideoSchema,
    aiGenerate: aiGenerateSchema,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Model
const Wallet: Model<IWallet> = model<IWallet>('Wallet', walletSchema);

export default Wallet;
