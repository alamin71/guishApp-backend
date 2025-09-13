/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import config from '../../config';
import { TUser, UserModel, UserRole } from './user.interface';
import { Types } from 'mongoose';

// Define the schema for Verification
const VerificationSchema = new Schema({
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },

  status: {
    type: Boolean,
    required: true,
  },
});
const imageSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});
const profileSchema = new Schema({
  height: String,
  shirtSize: String,
  tShirtSize: String,
  neckSize: String,
  sleeveLength: String,
  bottomSize: String,
  formalShoeSize: String,
  sportsShoeSize: String,
});

// Define the schema for the User model
const UserSchema = new Schema<TUser, UserModel>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    image: imageSchema,
    fullName: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
      default: '',
      select: false,
    },

    needsPasswordChange: {
      type: Boolean, 
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    accountType: {
      type: String,
      enum: ['custom', 'google', 'facebook'],
      default: 'custom',
    },
    profileData: { type: profileSchema, default: {} },

    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.user,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verification: {
      type: VerificationSchema,
      required: false,
    },
  },
  {
    timestamps: true, 
  },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password as string,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
UserSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

// Check if a user exists by email
UserSchema.statics.isUserExist = async function (
  email: string,
): Promise<TUser | null> {
  return this.findOne({ email }).select('+password');
};

UserSchema.statics.IsUserExistbyId = async function (
  id: string,
): Promise<Pick<TUser, '_id' | 'email' | 'role' | 'password'> | null> {
  return this.findOne({
    _id: new Types.ObjectId(id),
    isDeleted: { $ne: true },
  }).select('+password');
};

// Compare plain text password with hashed password
UserSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

// filter out deleted documents
UserSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
// Create and export the User model
const User = model<TUser, UserModel>('User', UserSchema);

export default User;
