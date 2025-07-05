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
  ) {
    this.minioClient = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.user,
      secretKey: this.password,
    });
  }

  async uploadFile() {}
}
