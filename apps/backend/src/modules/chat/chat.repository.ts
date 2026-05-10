import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Repository layer keeps all Prisma queries in one place.
  // This keeps the service focused on orchestration and domain decisions.
  async createMessage(content: string, role: Role) {
    return this.prismaService.message.create({
      data: {
        content,
        role,
      },
    });
  }

  async listMessagesByCreatedAtAsc() {
    return this.prismaService.message.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async listRulesByIdAsc() {
    return this.prismaService.rule.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
}
