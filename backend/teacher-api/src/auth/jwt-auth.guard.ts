import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AUTH_ACCESS_COOKIE } from './auth.constants';

export type JwtPayload = { sub: string; email: string };
export type RequestWithUser = Request & { user?: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const token = req.cookies?.[AUTH_ACCESS_COOKIE] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Server misconfigured');
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { secret });
      if (!payload?.sub || !payload?.email) {
        throw new UnauthorizedException('Invalid token');
      }
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
