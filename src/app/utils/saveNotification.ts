import { Notification } from '../modules/notification/notification.model';
import { sendUserNotification } from '../../socketIo';
import { io } from '../../server';
import mongoose from 'mongoose';

interface SaveNotificationProps {
  userId: string;
  userType: 'User' | 'Admin';
  title: string;
  message: string;
  type?: 'welcome' | 'profile' | 'payment' | 'admin' | 'custom';
}

export const saveNotification = async ({
  userId,
  userType,
  title,
  message,
  type = 'custom',
}: SaveNotificationProps) => {
  try {
    // 🛑 Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId:', userId);
      return;
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // ✅ Save to DB
    const notification = await Notification.create({
      userId: objectUserId,
      userType,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date(),
    });

    console.log('✅ Notification saved to DB:', notification);

    // 📢 Real-time Socket Notification
    sendUserNotification(io, userId, {
      _id: notification._id,
      userId,
      title,
      message,
      type,
      isRead: false,
    });

    console.log(`📤 Real-time notification sent to user ${userId}`);

    return notification;
  } catch (error) {
    console.error('❌ Error in saveNotification:', error);
    throw error;
  }
};
