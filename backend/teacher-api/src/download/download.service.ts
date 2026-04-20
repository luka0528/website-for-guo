import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DOWNLOAD_ALLOWED_PREFIXES,
  getSignedUrlTtlSeconds,
} from './download.constants';
import { OssService } from './oss.service';

@Injectable()
export class DownloadService {
  constructor(
    private readonly oss: OssService,
    private readonly prisma: PrismaService,
  ) {}

  private validateKey(rawKey: string): string {
    const key = rawKey.trim();
    if (!key) {
      throw new BadRequestException('key is required');
    }
    if (key.length > 512) {
      throw new BadRequestException('key too long');
    }
    if (key.includes('..') || key.includes('\\') || key.startsWith('/')) {
      throw new BadRequestException('invalid key');
    }
    if (!DOWNLOAD_ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
      throw new ForbiddenException(
        `key must start with one of: ${DOWNLOAD_ALLOWED_PREFIXES.join(', ')}`,
      );
    }
    return key;
  }

  async issueSignedUrl(params: {
    userId: string;
    rawKey: string;
    filename?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ url: string; expiresIn: number; key: string }> {
    const key = this.validateKey(params.rawKey);
    const expiresIn = getSignedUrlTtlSeconds();

    let url: string;
    try {
      url = this.oss.signedUrl(key, expiresIn, params.filename);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw e;
    }

    await this.prisma.downloadLog.create({
      data: {
        userId: params.userId,
        objectKey: key,
        ip: params.ip?.slice(0, 64),
        userAgent: params.userAgent?.slice(0, 512),
      },
    });

    return { url, expiresIn, key };
  }
}
