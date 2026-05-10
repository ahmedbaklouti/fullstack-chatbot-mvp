import { Transform } from 'class-transformer';
import { CHAT_MESSAGE_MAX_LENGTH } from '@chatbot/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateChatDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(Number(CHAT_MESSAGE_MAX_LENGTH))
  message!: string;
}
