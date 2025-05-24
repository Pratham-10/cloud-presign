import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutObjectAclCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AwsConfig,
  HttpMethod,
  PresignOptions,
  PresignParams,
  PresignResponse,
  Provider,
} from '../types';
import { Common } from './common';

export class AwsProvider implements Provider {
  private client: S3Client;
  private config: AwsConfig;
  private defaultExpiration: number;
  private common = new Common(); 

  constructor(config: AwsConfig, defaultExpiration: number) {
    this.config = config;
    this.defaultExpiration = defaultExpiration;
    
    const clientConfig: any = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    };
    
    // Add endpoint for compatible services like MinIO, Digital Ocean, etc.
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true;
    }
    
    this.client = new S3Client(clientConfig);
  }

  async generatePresignedUrl(
    params: PresignParams,
    options?: PresignOptions
  ): Promise<PresignResponse> {
    const expiration = options?.expiration || this.defaultExpiration;
    const method = params.method || HttpMethod.GET;
    const fileName = await this.common.generateFileUniqueName(params.key)
    const key = `${params.prefix}/${fileName}`;
    // Define command based on HTTP method
    let command;
    switch (method) {
      case HttpMethod.GET:
        command = new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: params.key,
        });
        break;
      case HttpMethod.PUT:
        command = new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          ContentType: params.contentType,
          Metadata: params.metadata,
        });
        break;
      case HttpMethod.DELETE:
        command = new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: params.key,
        });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    // Generate the signed URL
    const presignedUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiration,
    });
    const url = presignedUrl.split('?')[0];
    
    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiration * 1000).toISOString();
    
    // Build response
    const response: PresignResponse = {
      key,
      presignedUrl,
      url: params.isPublic ? url : '',
      method,
      expiresAt,
      headers: {},
    };
    
    // Add content type header for PUT requests
    if (method === HttpMethod.PUT && params.contentType) {
      response.headers['Content-Type'] = params.contentType;
    }
    
    return response;
  }
  async makeFilePublic(key: string): Promise<void> {
    const command = new PutObjectAclCommand({
      Bucket: this.config.bucket,
      Key: key,
      ACL: "public-read",
    });
    await this.client.send(command);
  }
}