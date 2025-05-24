import { AwsProvider } from './aws';
import { AwsConfig, DigitalOceanConfig } from '../types';

export class DigitalOceanProvider extends AwsProvider {
  constructor(config: DigitalOceanConfig, defaultExpiration: number) {
    // Digital Ocean Spaces uses the S3 compatible API
    // Convert DigitalOcean config to AWS config
    const awsConfig: AwsConfig = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      bucket: config.bucket,
      endpoint: config.endpoint || `https://${config.region}.digitaloceanspaces.com`,
    };
    
    super(awsConfig, defaultExpiration);
  }
}