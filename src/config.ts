import dotenv from 'dotenv';
import { CloudProvider, Config } from './types';

// Load environment variables
dotenv.config();

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<Config> = {
  provider: CloudProvider.AWS,
  expiration: 3600, // 1 hour in seconds
};

/**
 * Loads and validates configuration from environment variables
 * @returns Validated configuration
 */
export function loadConfig(): Config {
  const provider = (process.env.CLOUD_PROVIDER || DEFAULT_CONFIG.provider) as CloudProvider;
  
  // Validate provider
  if (!Object.values(CloudProvider).includes(provider)) {
    throw new Error(`Invalid cloud provider: ${provider}. Supported providers are: ${Object.values(CloudProvider).join(', ')}`);
  }
  
  // Basic configuration for all providers
  const config: Config = {
    provider,
    expiration: Number(process.env.PRESIGN_EXPIRATION) || DEFAULT_CONFIG.expiration as number,
    region: process.env.CLOUD_REGION || '',
  };
  
  // Provider-specific configuration
  switch (provider) {
    case CloudProvider.AWS:
      config.aws = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || config.region,
        bucket: process.env.AWS_BUCKET_NAME || '',
      };
      validateProviderConfig(config.aws, 'AWS');
      break;
      
    case CloudProvider.GCP:
      config.gcp = {
        projectId: process.env.GCP_PROJECT_ID || '',
        keyFilename: process.env.GCP_KEY_FILENAME || '',
        bucket: process.env.GCP_BUCKET_NAME || '',
      };
      validateProviderConfig(config.gcp, 'GCP');
      break;
      
    case CloudProvider.AZURE:
      config.azure = {
        accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
        accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
        container: process.env.AZURE_STORAGE_CONTAINER_NAME || '',
      };
      validateProviderConfig(config.azure, 'Azure');
      break;
      
    case CloudProvider.DIGITAL_OCEAN:
      config.digitalOcean = {
        accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY || '',
        region: process.env.DO_SPACES_REGION || config.region,
        bucket: process.env.DO_SPACES_BUCKET_NAME || '',
        endpoint: process.env.DO_SPACES_ENDPOINT || '',
      };
      validateProviderConfig(config.digitalOcean, 'Digital Ocean');
      break;
  }
  
  return config;
}

/**
 * Validates provider-specific configuration
 * @param config - Provider configuration
 * @param providerName - Provider name for error messages
 */
function validateProviderConfig(config: Record<string, string | undefined>, providerName: string): void {
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
    
  if (missingKeys.length > 0) {
    throw new Error(`Missing ${providerName} configuration: ${missingKeys.join(', ')}`);
  }
}