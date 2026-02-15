import { prisma } from '../config/database';

export class UserService {
  async getAllUsers(currentUserId: string) {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeen: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return users;
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    return user;
  }

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    return user;
  }
}

export const userService = new UserService();
