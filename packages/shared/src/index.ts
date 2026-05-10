export type MessageRole = 'USER' | 'BOT';

export type Message = {
  id: number;
  content: string;
  role: MessageRole;
  createdAt: string;
};

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  response: string;
};

export const CHAT_MESSAGE_MAX_LENGTH = 500;
