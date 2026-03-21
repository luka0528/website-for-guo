import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.prisma.user.findUnique({ where: { email: normalized } });
  }

  create(email: string, passwordHash: string) {
    const normalized = email.trim().toLowerCase();
    return this.prisma.user.create({
      data: { email: normalized, passwordHash },
    });
  }
}
