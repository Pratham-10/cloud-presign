/**
 * Supported cloud providers
 */
export enum CloudProvider {
  AWS = 'aws',
  GCP = 'gcp',
  AZURE = 'azure',
  DIGITAL_OCEAN = 'digital_ocean'
}

/**
 * AWS configuration
 */
export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
  [key: string]: string | undefined
}

/**
 * GCP configuration
 */
export interface GcpConfig {
  projectId: string;
  keyFilename: string;
  bucket: string;
  [key: string]: string | undefined
}

/**
 * Azure configuration
 */
export interface AzureConfig {
  accountName: string;
  accountKey: string;
  connectionString: string;
  container: string;
  [key: string]: string | undefined
}

/**
 * Digital Ocean configuration
 */
export interface DigitalOceanConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint: string;
  [key: string]: string | undefined
}

/**
 * Global configuration
 */
export interface Config {
  provider: CloudProvider;
  region: string;
  expiration: number;
  aws?: AwsConfig;
  gcp?: GcpConfig;
  azure?: AzureConfig;
  digitalOcean?: DigitalOceanConfig;
}

/**
 * HTTP method for presigned URL
 */
export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

/**
 * Parameters for generating a presigned URL
 */
export interface PresignParams {

  /**
   * Prefix for the file path (folder in which file is stored)
   */
  prefix?: string;

  /**
   * Key/path of the file in the storage
   */
  key: string;

  /**
   * flag for keeping the file public
   */
  isPublic?: boolean;

  /**
   * HTTP method for the presigned URL
   * GET for download, PUT for upload
   */
  method?: HttpMethod;
  
  /**
   * Content type of the file (for upload)
   */
  contentType?: string;
  
  /**
   * File size in bytes (for upload)
   */
  contentLength?: number;
  
  /**
   * Additional metadata for the file
   */
  metadata?: Record<string, string>;
}

/**
 * Additional options for presigned URL
 */
export interface PresignOptions {
  /**
   * Expiration time in seconds
   * Overrides the global expiration setting
   */
  expiration?: number;
  
  /**
   * Provider-specific options
   */
  [key: string]: any;
}

/**
 * Response from generating a presigned URL
 */
export interface PresignResponse {
  /**
   * Key/name of the file in the storage
   */
  key: string;
  /**
   * The generated presigned URL
   */
  presignedUrl: string;

  /**
   * The URL to access the file
   */
  url?: string;
  
  /**
   * The HTTP method to use with the URL
   */
  method: HttpMethod;
  
  /**
   * When the URL expires (ISO string)
   */
  expiresAt: string;
  
  /**
   * Additional fields to include in the request (for POST uploads)
   */
  fields?: Record<string, string>;
  
  /**
   * Headers to include in the request
   */
  headers: Record<string, string>;
}

/**
 * Provider interface
 */
export interface Provider {
  generatePresignedUrl(params: PresignParams, options?: PresignOptions): Promise<PresignResponse>;
  makeFilePublic(key?: string): Promise<void>;
}