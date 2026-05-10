import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CHAT_MESSAGE_MAX_LENGTH } from '@chatbot/shared';
import type { Server } from 'http';
import request from 'supertest';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('Chat validation', () => {
  let app: INestApplication<Server>;
  let chatService: {
    getResponseForMessage: jest.Mock;
    getMessageHistory: jest.Mock;
  };

  beforeAll(async () => {
    chatService = {
      getResponseForMessage: jest.fn().mockResolvedValue('ok'),
      getMessageHistory: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: chatService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    chatService.getResponseForMessage.mockClear();
  });

  it('rejects missing message', async () => {
    await request(app.getHttpServer()).post('/chat').send({}).expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });

  it('rejects empty message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: '' })
      .expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only message (trimmed)', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: '   ' })
      .expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });

  it('trims message before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: '  hello  ' })
      .expect(201, { response: 'ok' });

    expect(chatService.getResponseForMessage).toHaveBeenCalledWith('hello');
  });

  it('rejects non-string message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: 123 })
      .expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });

  it('rejects too-long message', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: 'a'.repeat(Number(CHAT_MESSAGE_MAX_LENGTH) + 1) })
      .expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });

  it('rejects unknown body properties', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ message: 'hi', extra: 'nope' })
      .expect(400);
    expect(chatService.getResponseForMessage).not.toHaveBeenCalled();
  });
});
