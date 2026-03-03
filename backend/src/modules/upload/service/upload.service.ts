import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('minio.bucket') || 'cooking-images';
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endPoint') || 'localhost',
      port: this.configService.get<number>('minio.port') || 9000,
      useSSL: this.configService.get<boolean>('minio.useSSL') || false,
      accessKey: this.configService.get<string>('minio.accessKey') || 'minioadmin',
      secretKey: this.configService.get<string>('minio.secretKey') || 'minioadmin',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket "${this.bucket}" created`);
      }
      // Set public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(this.bucket, JSON.stringify(policy));
      this.logger.log(`MinIO connected, bucket: ${this.bucket}`);
    } catch (error) {
      this.logger.error('MinIO initialization failed', error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const metadata = {
      'Content-Type': file.mimetype,
    };

    await this.minioClient.putObject(
      this.bucket,
      filename,
      file.buffer,
      file.size,
      metadata,
    );

    const endPoint = this.configService.get<string>('minio.endPoint');
    const port = this.configService.get<number>('minio.port');
    const useSSL = this.configService.get<boolean>('minio.useSSL');
    const protocol = useSSL ? 'https' : 'http';
    const portStr = (useSSL && port === 443) || (!useSSL && port === 80) ? '' : `:${port}`;

    return `${protocol}://${endPoint}${portStr}/${this.bucket}/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (filename) {
        await this.minioClient.removeObject(this.bucket, filename);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete file: ${url}`, error);
    }
  }
}
