import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { OssService } from './oss.service';

@Module({
  imports: [AuthModule],
  providers: [DownloadService, OssService],
  controllers: [DownloadController],
})
export class DownloadModule {}
