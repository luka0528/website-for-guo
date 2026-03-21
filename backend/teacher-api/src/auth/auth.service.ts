import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { getAccessExpiresSeconds } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private hashRefresh(raw: string) {
    return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  private async issueTokens(userId: string, email: string) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not set');
    }
    const expiresInSec = getAccessExpiresSeconds();
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      { secret, expiresIn: expiresInSec },
    );

    const refreshRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashRefresh(refreshRaw);
    const days = Number(process.env.REFRESH_TOKEN_DAYS || '7');
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshRaw };
  }

  async signup(dto: SignupDto) {
    const { email, password } = dto;
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const user = await this.users.create(email, passwordHash);
      const tokens = await this.issueTokens(user.id, user.email);
      return {
        user: { id: user.id, email: user.email },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.issueTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshRaw: string | undefined) {
    if (!refreshRaw) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokenHash = this.hashRefresh(refreshRaw);
    const row = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    if (!row) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not set');
    }
    const expiresInSec = getAccessExpiresSeconds();
    const accessToken = await this.jwt.signAsync(
      { sub: row.user.id, email: row.user.email },
      { secret, expiresIn: expiresInSec },
    );
    return { accessToken };
  }

  async logout(refreshRaw: string | undefined) {
    if (!refreshRaw) {
      return;
    }
    const tokenHash = this.hashRefresh(refreshRaw);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
