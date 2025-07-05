import { Inject, Injectable } from '@nestjs/common';
import { MediaStrategy } from './strategies/media-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { createMediaStrategy } from './media-strategy.factory';

@Injectable()
export class MediaService {
  private readonly strategy: MediaStrategy;

  constructor(@Inject() private readonly configService: ConfigService) {
    const config = this.configService.get('config') as Configuration;
    this.strategy = createMediaStrategy(config, 'minio');
  }

  async uploadFile(
    file: Buffer<ArrayBufferLike>,
    fileName: string,
  ): Promise<string> {
    return this.strategy.uploadFile(file, fileName);
  }

  async deleteFile(fileName: string): Promise<void> {
    return this.strategy.deleteFile(fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    return this.strategy.getFileUrl(fileName);
  }
}
