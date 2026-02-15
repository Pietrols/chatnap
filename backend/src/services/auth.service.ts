import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../types';

export class AuthService {
  async register(input: RegisterInput) {
    const { username, password } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    const token = generateToken({ id: user.id, username: user.username });

    return { user, token };
  }

  async login(input: LoginInput) {
    const { username, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}

export const authService = new AuthService();
