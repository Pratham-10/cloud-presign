import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters } from '@azure/storage-blob';
import {
  AzureConfig,
  HttpMethod,
  PresignOptions,
  PresignParams,
  PresignResponse,
  Provider,
} from '../types';
import { Common } from './common';

export class AzureProvider implements Provider {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;
  private defaultExpiration: number;
  private common = new Common()

  constructor(config: AzureConfig, defaultExpiration: number) {
    this.containerName = config.container;
    this.accountName = config.accountName;
    this.accountKey = config.accountKey;
    this.defaultExpiration = defaultExpiration;
    
    // Create the BlobServiceClient
    if (config.connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    } else {
      const credential = new StorageSharedKeyCredential(config.accountName, config.accountKey);
      const blobServiceUri = `https://${config.accountName}.blob.core.windows.net`;
      this.blobServiceClient = new BlobServiceClient(blobServiceUri, credential);
    }
  }

  async generatePresignedUrl(
    params: PresignParams,
    options?: PresignOptions
  ): Promise<PresignResponse> {
    const expiration = options?.expiration || this.defaultExpiration;
    const method = params.method || HttpMethod.GET;
    let fileName = params.key;
    let key = params.key;
    
    // Create permissions based on HTTP method
    const permissions = new BlobSASPermissions();
    switch (method) {
      case HttpMethod.GET:
        permissions.read = true;
        break;
      case HttpMethod.PUT:
      case HttpMethod.POST:
        permissions.create = true;
        permissions.write = true;
        fileName = await this.common.generateFileUniqueName(params.key);
        key = `${params.prefix}/${fileName}`;
        break;
      case HttpMethod.DELETE:
        permissions.delete = true;
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    // Set start and expiry time
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setSeconds(startDate.getSeconds() + expiration);
    
    // Define SAS parameters
    const sasOptions = {
      containerName: this.containerName,
      blobName: params.key,
      permissions,
      startsOn: startDate,
      expiresOn: expiryDate,
    };
    
    // Create the shared key credential
    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey
    );
    
    // Generate the SAS token
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();
    
    // Construct the full URL
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlobClient(fileName);
    const presignedUrl = `${blobClient.url}?${sasToken}`;
    const url = blobClient.url.split('?')[0];
    
    // Calculate expiration date
    const expiresAt = expiryDate.toISOString();
    
    // Build response
    const response: PresignResponse = {
      key,
      presignedUrl,
      url: params.isPublic ? url : '',
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

  async makeFilePublic(): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

    // Check current access level
    const properties = await containerClient.getProperties();
    if (properties.blobPublicAccess !== 'blob') {
      // Set container access level to 'blob' (public read access to blobs)
      await containerClient.setAccessPolicy('blob');
    }
  }
}