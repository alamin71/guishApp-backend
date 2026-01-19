// export default initializeSocketIO;
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

// Common: Add date and time to any notification
const enrichNotification = (notification: any) => {
  const now = new Date();
  return {
    ...notification,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  };
};

// Helper: Send notification to a specific user
export const sendUserNotification = (
  io: Server,
  userId: string,
  notification: any,
) => {
  const enrichedNotification = enrichNotification(notification);
  io.to(userId).emit('notification', enrichedNotification);
};

// Helper: Send notification to all admins
export const sendAdminNotification = (io: Server, notification: any) => {
  const enrichedNotification = enrichNotification(notification);
  io.to('admin').emit('notification', enrichedNotification);
};

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  const onlineUser = new Set<string>();

  io.on('connection', (socket: any) => {
    console.log('✅ Connected:', socket.id);

    try {
      const userId = socket.handshake.auth?.userId || socket.id;
      const isAdmin = socket.handshake.auth?.isAdmin || false;

      socket.join(userId);
      if (isAdmin) {
        socket.join('admin');
      }

      onlineUser.add(userId);
      io.emit('onlineUser', Array.from(onlineUser));

      socket.on('disconnect', () => {
        onlineUser.delete(userId);
        io.emit('onlineUser', Array.from(onlineUser));
        console.log('❌ Disconnected:', socket.id);
      });

      // ✅ Listen for manual room join emits from Flutter
      socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        console.log(`📦 [joinRoom] User joined room: ${roomId}`);
      });

      socket.on('join', (roomId: string) => {
        socket.join(roomId);
        console.log(`📦 [join] User joined room: ${roomId}`);
      });

      socket.on('joinUserRoom', (roomId: string) => {
        socket.join(roomId);
        console.log(`📦 [joinUserRoom] User joined room: ${roomId}`);
      });

      // Example: Listen for test notification
      socket.on('test-notification', (data: any) => {
        sendUserNotification(io, userId, {
          title: 'Test Notification',
          message: data?.message || 'Hello!',
          type: 'info',
        });

        sendAdminNotification(io, {
          title: 'User sent a test notification',
          message: `User ${userId} says: ${data?.message}`,
          type: 'info',
        });
      });
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });

  return io;
};

export default initializeSocketIO;
