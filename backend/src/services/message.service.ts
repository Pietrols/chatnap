import { prisma } from '../config/database';
import { MessageInput } from '../types';

export class MessageService {
  async createMessage(senderId: string, input: MessageInput) {
    const { receiverId, content } = input;

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return message;
  }

  async getConversation(userId1: string, userId2: string) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId1,
            receiverId: userId2,
          },
          {
            senderId: userId2,
            receiverId: userId1,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async getRecentConversations(userId: string) {
    // Get the most recent message from each conversation
    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group by conversation partner
    const conversations = new Map();
    
    for (const message of recentMessages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partner: message.senderId === userId ? message.receiver : message.sender,
          lastMessage: message,
        });
      }
    }

    return Array.from(conversations.values());
  }
}

export const messageService = new MessageService();
