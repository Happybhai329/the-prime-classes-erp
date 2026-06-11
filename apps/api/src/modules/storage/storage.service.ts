import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuid } from 'uuid';

/**
 * MinIO storage service — handles file upload, download, and presigned URL generation.
 * Used by Document Center and any future file-upload features.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: String(this.configService.get('MINIO_USE_SSL', false)) === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'prime_minio'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'prime_minio_2025'),
    });

    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'prime-erp');
    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created MinIO bucket: ${this.bucket}`);
      }
    } catch (error) {
      this.logger.warn(`MinIO bucket check failed (service may not be running): ${error}`);
    }
  }

  /**
   * Upload a file buffer to MinIO.
   * Returns the object key (path) stored in MinIO.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string; size: number }> {
    const ext = file.originalname.split('.').pop() || 'bin';
    const key = `${folder}/${uuid()}.${ext}`;

    await this.client.putObject(
      this.bucket,
      key,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    this.logger.log(`Uploaded file: ${key} (${file.size} bytes)`);

    return { key, size: file.size };
  }

  /**
   * Generate a presigned download URL (valid for 1 hour by default).
   */
  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }

  /**
   * Delete a file from MinIO.
   */
  async deleteFile(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
    this.logger.log(`Deleted file: ${key}`);
  }
}
