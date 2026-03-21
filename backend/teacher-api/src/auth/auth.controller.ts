import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  getAccessExpiresSeconds,
  getCookieOptions,
} from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard, type RequestWithUser } from './jwt-auth.guard';

function accessCookieMaxAgeMs(): number {
  return getAccessExpiresSeconds() * 1000;
}

function refreshCookieMaxAgeMs(): number {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || '7');
  return days * 24 * 60 * 60 * 1000;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.signup(dto);
    res.cookie(
      AUTH_ACCESS_COOKIE,
      result.accessToken,
      getCookieOptions(accessCookieMaxAgeMs()),
    );
    res.cookie(
      AUTH_REFRESH_COOKIE,
      result.refreshToken,
      getCookieOptions(refreshCookieMaxAgeMs()),
    );
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    res.cookie(
      AUTH_ACCESS_COOKIE,
      result.accessToken,
      getCookieOptions(accessCookieMaxAgeMs()),
    );
    res.cookie(
      AUTH_REFRESH_COOKIE,
      result.refreshToken,
      getCookieOptions(refreshCookieMaxAgeMs()),
    );
    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshRaw = req.cookies?.[AUTH_REFRESH_COOKIE] as string | undefined;
    const result = await this.auth.refresh(refreshRaw);
    res.cookie(
      AUTH_ACCESS_COOKIE,
      result.accessToken,
      getCookieOptions(accessCookieMaxAgeMs()),
    );
    return { ok: true };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshRaw = req.cookies?.[AUTH_REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(refreshRaw);
    res.clearCookie(AUTH_ACCESS_COOKIE, { path: '/' });
    res.clearCookie(AUTH_REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: RequestWithUser) {
    const u = req.user!;
    return { user: { id: u.sub, email: u.email } };
  }
}
