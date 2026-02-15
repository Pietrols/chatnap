import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/database';
import { verifyToken } from './utils/jwt';
import { userService } from './services/user.service';
import { messageService } from './services/message.service';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// REST API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io user mapping: userId -> socketId
const userSocketMap = new Map<string, string>();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', async (token: string) => {
    try {
      const decoded = verifyToken(token);
      const userId = decoded.id;

      // Store socket mapping
      userSocketMap.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.username = decoded.username;

      // Update user online status in database
      await userService.updateOnlineStatus(userId, true);

      // Notify all clients about user going online
      io.emit('user_online', { userId, isOnline: true });

      console.log(`User ${decoded.username} (${userId}) authenticated on socket ${socket.id}`);

      // Send confirmation to client
      socket.emit('authenticated', { success: true, userId });
    } catch (error) {
      console.error('Socket authentication failed:', error);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Handle sending messages
  socket.on('send_message', async (data: { receiverId: string; content: string }) => {
    try {
      const senderId = socket.data.userId;
      
      if (!senderId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { receiverId, content } = data;

      // Save message to database
      const message = await messageService.createMessage(senderId, { receiverId, content });

      // Prepare message payload
      const messagePayload = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
      };

      // Send to receiver if online
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', messagePayload);
      }

      // Send confirmation back to sender
      socket.emit('message_sent', messagePayload);

      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: { receiverId: string; isTyping: boolean }) => {
    const senderId = socket.data.userId;
    
    if (!senderId) return;

    const receiverSocketId = userSocketMap.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: senderId,
        isTyping: data.isTyping,
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    const userId = socket.data.userId;
    if (userId) {
      // Remove from socket map
      userSocketMap.delete(userId);

      // Update user offline status in database
      await userService.updateOnlineStatus(userId, false);

      // Notify all clients about user going offline
      io.emit('user_offline', { userId, isOnline: false });

      console.log(`User ${socket.data.username} (${userId}) went offline`);
    }
  });
});

// Start server
const PORT = parseInt(env.PORT, 10);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Close all socket connections
  io.close(() => {
    console.log('Socket.io server closed');
  });

  // Disconnect from database
  await prisma.$disconnect();
  console.log('Database connection closed');

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  io.close(() => {
    console.log('Socket.io server closed');
  });

  await prisma.$disconnect();
  console.log('Database connection closed');

  process.exit(0);
});
