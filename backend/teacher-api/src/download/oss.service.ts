import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import OSS from 'ali-oss';

/**
 * Thin wrapper around ali-oss for signed GET URLs.
 * Credentials come from env and are read lazily so the app can boot
 * without OSS configured (only /download will fail).
 */
@Injectable()
export class OssService {
  private readonly logger = new Logger(OssService.name);
  private client: OSS | null = null;

  private getClient(): OSS {
    if (this.client) return this.client;
    const region = process.env.OSS_REGION;
    const bucket = process.env.OSS_BUCKET;
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
    if (!region || !bucket || !accessKeyId || !accessKeySecret) {
      this.logger.error(
        'OSS env missing: require OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET',
      );
      throw new InternalServerErrorException('OSS not configured');
    }
    this.client = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret,
      secure: true,
    });
    return this.client;
  }

  /**
   * Generate a short-lived signed GET URL for an object.
   * `filename` sets Content-Disposition so browsers save with a friendly name.
   */
  signedUrl(objectKey: string, ttlSeconds: number, filename?: string): string {
    const client = this.getClient();
    const response: Record<string, string> = {};
    if (filename) {
      const safe = encodeURIComponent(filename);
      response['content-disposition'] = `attachment; filename*=UTF-8''${safe}`;
    }
    return client.signatureUrl(objectKey, {
      expires: ttlSeconds,
      method: 'GET',
      response,
    });
  }
}
