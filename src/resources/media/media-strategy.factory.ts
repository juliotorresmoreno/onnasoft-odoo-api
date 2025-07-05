import { Configuration } from '@/types/configuration';
import { MediaStrategy } from './strategies/media-strategy.interface';
import { MinioMediaStrategy } from './strategies/minio.strategy';

type MediaStrategyType = 'minio';

export function createMediaStrategy(
  config: Configuration,
  strategy: MediaStrategyType = 'minio',
): MediaStrategy {
  if (strategy === 'minio') {
    return new MinioMediaStrategy(
      config.minio?.endpoint ?? 'localhost',
      config.minio?.port ?? 9000,
      config.minio?.useSSL ?? false,
      config.minio?.bucket ?? '',
      config.minio?.user ?? '',
      config.minio?.password ?? '',
      config.mediaUrl,
    );
  }

  throw new Error(`Unsupported media strategy: ${String(strategy)}`);
}
