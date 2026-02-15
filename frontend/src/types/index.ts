export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
  };
}

export interface Conversation {
  partnerId: string;
  partner: User;
  lastMessage: Message;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
}

export interface SendMessageInput {
  receiverId: string;
  content: string;
}

export interface TypingEvent {
  receiverId: string;
  isTyping: boolean;
}
