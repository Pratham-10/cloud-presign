import { Storage } from '@google-cloud/storage';
import {
  GcpConfig,
  HttpMethod,
  PresignOptions,
  PresignParams,
  PresignResponse,
  Provider,
} from '../types';
import { Common } from './common';

export class GcpProvider implements Provider {
  private storage: Storage;
  private bucket: string;
  private common = new Common(); 
  private defaultExpiration: number;

  constructor(config: GcpConfig, defaultExpiration: number) {
    this.bucket = config.bucket;
    this.defaultExpiration = defaultExpiration;
    
    const storageOptions: any = {
      projectId: config.projectId,
    };
    
    // Use key file if provided
    if (config.keyFilename) {
      storageOptions.keyFilename = config.keyFilename;
    }
    
    this.storage = new Storage(storageOptions);
  }

  async generatePresignedUrl(
    params: PresignParams,
    options?: PresignOptions
  ): Promise<PresignResponse> {
    const expiration = options?.expiration || this.defaultExpiration;
    const method = params.method || HttpMethod.GET;
    let fileName = params.key;
    let key = params.key;
    // Convert HTTP method to GCP action
    let action: 'read' | 'write' | 'delete';
    switch (method) {
      case HttpMethod.GET:
        action = 'read';
        break;
      case HttpMethod.PUT:
      case HttpMethod.POST:
        fileName = await this.common.generateFileUniqueName(params.key);
        key = `${params.prefix}/${fileName}`;
        action = 'write';
        break;
      case HttpMethod.DELETE:
        action = 'delete';
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    // Get the bucket
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(key);
    
    // Generate signed URL
    const [presignedUrl] = await file.getSignedUrl({
      version: 'v4',
      action,
      expires: Date.now() + expiration * 1000,
      contentType: params.contentType,
      extensionHeaders: params.metadata,
    });
    
    // Calculate expiration date
    const expiresAt = new Date(Date.now() + expiration * 1000).toISOString();
    const url = presignedUrl.split('?')[0];
    
    // Build response
    const response: PresignResponse = {
      key,
      presignedUrl,
      url : params.isPublic ? url : "",
      method,
      expiresAt,
      headers: {},
    };
    
    // Add content type header for upload requests
    if ((method === HttpMethod.PUT || method === HttpMethod.POST) && params.contentType) {
      response.headers['Content-Type'] = params.contentType;
    }
    return response;
  }

  async makeFilePublic(key: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucket);
    const file = bucket.file(key);
    await file.makePublic();
  }
}