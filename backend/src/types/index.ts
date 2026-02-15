import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export interface UserPayload {
  id: string;
  username: string;
}

export interface RegisterInput {
  username: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface MessageInput {
  receiverId: string;
  content: string;
}

export interface MessagePayload {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  sender?: {
    id: string;
    username: string;
  };
}

export interface TypingPayload {
  receiverId: string;
  isTyping: boolean;
}
