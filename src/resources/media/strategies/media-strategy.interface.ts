export interface MediaStrategy {
  uploadFile(file: Buffer<ArrayBufferLike>, fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
  getFileUrl(fileName: string): Promise<string>;
}
