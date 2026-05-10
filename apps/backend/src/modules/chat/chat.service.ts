import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Message } from '@chatbot/shared';
import { ChatRepository } from './chat.repository';
import { detectResponseFromRules } from './keyword-matcher';

@Injectable()
export class ChatService {
  // Service layer: orchestrates repository calls + chat business logic.
  private readonly fallbackResponseText = "I don't understand your request";

  constructor(private readonly repository: ChatRepository) {}

  private toSharedMessage(message: {
    id: number;
    content: string;
    role: Role;
    createdAt: Date;
  }): Message {
    return {
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private async runOrThrow<T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch {
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async getMessageHistory(): Promise<Message[]> {
    return await this.runOrThrow(async () => {
      const messages = await this.repository.listMessagesByCreatedAtAsc();
      return messages.map((m) => this.toSharedMessage(m));
    }, 'Unable to load message history');
  }

  async getResponseForMessage(message: string): Promise<string> {
    return await this.runOrThrow(async () => {
      await this.repository.createMessage(message, Role.USER);

      const rules = await this.repository.listRulesByIdAsc();
      const detectedResponseText = detectResponseFromRules(message, rules);
      const responseText = detectedResponseText ?? this.fallbackResponseText;

      await this.repository.createMessage(responseText, Role.BOT);
      return responseText;
    }, 'Unable to process chat message');
  }
}
