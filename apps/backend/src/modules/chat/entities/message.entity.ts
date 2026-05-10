export type MessageEntity = {
  id: number;
  content: string;
  role: 'USER' | 'BOT';
  createdAt: Date;
};
