import { Config, CloudProvider, Provider } from '../types';
import { AwsProvider } from './aws';
import { GcpProvider } from './gcp';
import { AzureProvider } from './azure';
import { DigitalOceanProvider } from './digital-ocean';

/**
 * Get the appropriate provider implementation based on configuration
 * @param config - The loaded configuration
 * @returns Provider implementation
 */
export function getProvider(config: Config): Provider {
  switch (config.provider) {
    case CloudProvider.AWS:
      if (!config.aws) {
        throw new Error('AWS configuration is missing');
      }
      return new AwsProvider(config.aws, config.expiration);
      
    case CloudProvider.GCP:
      if (!config.gcp) {
        throw new Error('GCP configuration is missing');
      }
      return new GcpProvider(config.gcp, config.expiration);
      
    case CloudProvider.AZURE:
      if (!config.azure) {
        throw new Error('Azure configuration is missing');
      }
      return new AzureProvider(config.azure, config.expiration);
      
    case CloudProvider.DIGITAL_OCEAN:
      if (!config.digitalOcean) {
        throw new Error('Digital Ocean configuration is missing');
      }
      return new DigitalOceanProvider(config.digitalOcean, config.expiration);
      
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}