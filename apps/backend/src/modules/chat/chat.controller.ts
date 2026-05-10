import { Body, Controller, Get, Header, Post } from '@nestjs/common';
import type { ChatResponse, Message } from '@chatbot/shared';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('chat/history')
  // Chat history is user-facing and changes frequently; disable caching to avoid stale UI.
  @Header('Cache-Control', 'no-store')
  async getHistory(): Promise<Message[]> {
    return await this.chatService.getMessageHistory();
  }

  @Post('chat')
  async sendMessage(@Body() body: CreateChatDto): Promise<ChatResponse> {
    const responseText = await this.chatService.getResponseForMessage(
      body.message,
    );
    return { response: responseText };
  }
}
