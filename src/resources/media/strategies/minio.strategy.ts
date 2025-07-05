import { Client } from 'minio';
import { MediaStrategy } from './media-strategy.interface';

export class MinioMediaStrategy implements MediaStrategy {
  private readonly minioClient: Client;

  constructor(
    private readonly endpoint: string,
    private readonly port: number,
    private readonly useSSL: boolean,
    private readonly bucket: string,
    private readonly user: string,
    private readonly password: string,
    private readonly mediaUrl: string,
  ) {
    this.minioClient = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.user,
      secretKey: this.password,
    });
  }

  async uploadFile(
    file: Buffer<ArrayBufferLike>,
    fileName: string,
  ): Promise<string> {
    await this.minioClient.putObject(this.bucket, fileName, file);
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucket, fileName);
  }

  getFileUrl(fileName: string): Promise<string> {
    const url = new URL(`${this.mediaUrl}/${this.bucket}/objects/download`);
    url.searchParams.append('preview', 'true');
    url.searchParams.append('prefix', fileName);
    url.searchParams.append('version_id', 'null');

    return Promise.resolve(url.toString());
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucket, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
}
