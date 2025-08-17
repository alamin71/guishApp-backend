import { Types } from 'mongoose';

export type WalletType = 'text' | 'voice' | 'image_video' | 'ai_generate';

export interface IImageOrVideo {
  id: string | number;
  url: string;
}
export interface voiceLink {
  id: string;
  url: string;
}

export interface IText {
  title?: string;
  description?: string;
}

export interface IVoice {
  title?: string;
  voiceLink?: voiceLink;
}

export interface IImageVideo {
  title?: string;
  description?: string;
  images?: IImageOrVideo[];
  videos?: IImageOrVideo[];
}

export interface IWallet {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  type: WalletType;
  text?: IText;
  voice?: IVoice;
  imageVideo?: IImageVideo;
  aiGenerate?: IImageOrVideo;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
