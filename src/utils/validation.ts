import { HttpMethod, PresignParams } from '../types';

/**
 * Validates parameters for generating presigned URL
 * @param params - Parameters to validate
 * @throws Error if validation fails
 */
export function validatePresignParams(params: PresignParams): void {
  // Validate key
  if (!params.key) {
    throw new Error('Key/path is required');
  }
  
  // Validate HTTP method
  if (params.method && !Object.values(HttpMethod).includes(params.method)) {
    throw new Error(`Invalid HTTP method: ${params.method}`);
  }
  
  // Validate content type for uploads
  if (
    (params.method === HttpMethod.PUT || params.method === HttpMethod.POST) &&
    params.contentType === ''
  ) {
    throw new Error('Content type is required for upload operations');
  }
  
  // Validate metadata
  if (params.metadata && typeof params.metadata !== 'object') {
    throw new Error('Metadata must be an object');
  }
}