import { loadConfig } from './config';
import { getProvider } from './providers';
import { validatePresignParams } from './utils/validation';
import { PresignOptions, PresignParams, PresignResponse } from './types';

/**
 * Generates a presigned URL for uploading or downloading a file.
 * @param params - Parameters for generating presigned URL
 * @param options - Additional options for the presigned URL
 * @returns Promise resolving to a presigned URL
 */
export async function generatePresignedUrl(
  params: PresignParams,
  options?: PresignOptions
): Promise<PresignResponse> {
  try {
    // Validate required parameters
    validatePresignParams(params);

    // Load configuration
    const config = loadConfig();
    
    // Get provider implementation
    const provider = getProvider(config);
    
    // Generate presigned URL using the provider
    return await provider.generatePresignedUrl(params, options);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to generate presigned URL: ${error}`);
  }
}

export async function makeFilePublic(fileName:string) {
  try{
        // Load configuration
        const config = loadConfig();
        
        // Get provider implementation
        const provider = getProvider(config);

        // Make file publically available
        return await provider.makeFilePublic(fileName);
  }catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to make file public: ${error}`);
  }
}

// Re-export types for better TypeScript experience
export * from './types';