import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type RequestWithUser } from '../auth/jwt-auth.guard';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(private readonly download: DownloadService) {}

  /**
   * GET /download?key=publications/foo.pdf&filename=foo.pdf
   * Requires auth (access_token cookie). Returns a short-lived signed URL.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(
    @Query('key') key: string,
    @Query('filename') filename: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user!.sub;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      undefined;
    const userAgent = req.headers['user-agent'];
    const result = await this.download.issueSignedUrl({
      userId,
      rawKey: key,
      filename,
      ip,
      userAgent,
    });
    return result;
  }
}
