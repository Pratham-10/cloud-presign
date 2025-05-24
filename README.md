# Cloud Presign

A unified presigned URL generator for multiple cloud platforms including AWS S3, Google Cloud Storage, Azure Blob Storage, and Digital Ocean Spaces.

## Features

- Generate presigned URLs for upload and download operations
- Support for multiple cloud providers:
  - AWS S3
  - Google Cloud Storage
  - Azure Blob Storage
  - Digital Ocean Spaces
- Consistent API across all providers
- Customizable URL expiration times
- Comprehensive error handling
- TypeScript support

## Installation

```bash
npm install cloud-presign
```

## Configuration

Configuration is loaded from environment variables. Create a `.env` file in your project root (see `.env.example` for reference):

```env
# Cloud Provider (aws, gcp, azure, digital_ocean)
CLOUD_PROVIDER=aws
CLOUD_REGION=us-east-1
PRESIGN_EXPIRATION=3600

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

## Usage

### Basic Usage

```typescript
import { generatePresignedUrl, HttpMethod, makeFilePublic } from 'cloud-presign';

async function getUploadUrl() {
  const presignedData = await generatePresignedUrl({
    prefix: 'folder',
    key: 'filename.jpg',
    isPublic: true   // if want to make publically accessible
    method: HttpMethod.PUT,
    contentType: 'image/jpeg',
  });
  
  console.log('Upload URL:', presignedData.presignedUrl);
  console.log('Expires at:', presignedData.expiresAt);
  console.log('Headers:', presignedData.headers);
  
  return presignedUrl;
}

async function getDownloadUrl() {
  const presignedData = await generatePresignedUrl({
    key: 'path/to/file.jpg',
    method: HttpMethod.GET,
  });
  
  console.log('Download URL:', presignedData.presignedUrl);
  
  return presignedData;
}
```

### Custom Expiration

```typescript
const presignedData = await generatePresignedUrl(
  {
    key: 'path/to/file.jpg',
    method: HttpMethod.GET,
  },
  {
    expiration: 7200, // 2 hours in seconds
  }
);
```

### With Metadata

```typescript
const presignedData = await generatePresignedUrl({
  prefix: 'folder',
  key: 'filename.jpg',
  isPublic: true   // if want to make publically accessible
  method: HttpMethod.PUT,
  contentType: 'image/jpeg',
  metadata: {
    'x-amz-meta-original-filename': 'vacation-photo.jpg',
    'x-amz-meta-user-id': '12345',
  },
});
```

## Provider-Specific Usage

### AWS S3

```typescript
// Set environment variables
// CLOUD_PROVIDER=aws
// AWS_ACCESS_KEY_ID=your-access-key
// AWS_SECRET_ACCESS_KEY=your-secret-key
// AWS_REGION=us-east-1
// AWS_BUCKET_NAME=your-bucket-name

const presignedData = await generatePresignedUrl({
  prefix: 'folder',
  key: 'filename.jpg',
  isPublic: true   // if want to make publically accessible
  method: HttpMethod.PUT,
  contentType: 'image/jpeg',
});

// give access of acl to public read
await makeFilePublic(key);
```

### Google Cloud Storage

```typescript
// Set environment variables
// CLOUD_PROVIDER=gcp
// GCP_PROJECT_ID=your-project-id
// GCP_KEY_FILENAME=/path/to/service-account-key.json
// GCP_BUCKET_NAME=your-bucket-name

const presignedData = await generatePresignedUrl({
  prefix: 'folder',
  key: 'filename.jpg',
  isPublic: true   // if want to make publically accessible
  method: HttpMethod.PUT,
  contentType: 'image/jpeg',
});

// give access of acl to public read
await makeFilePublic(key);
```

### Azure Blob Storage

```typescript
// Set environment variables
// CLOUD_PROVIDER=azure
// AZURE_STORAGE_ACCOUNT_NAME=your-account-name
// AZURE_STORAGE_ACCOUNT_KEY=your-account-key
// AZURE_STORAGE_CONTAINER_NAME=your-container-name

const presignedData = await generatePresignedUrl({
  prefix: 'folder',
  key: 'filename.jpg',
  isPublic: true   // if want to make publically accessible
  method: HttpMethod.PUT,
  contentType: 'image/jpeg',
});

// give access of acl to public read for complete container. 
// Note: this gives public access to all blobs in container as Azure does not support individual blob-level public ACLs.
await makeFilePublic(key);
```

### Digital Ocean Spaces

```typescript
// Set environment variables
// CLOUD_PROVIDER=digital_ocean
// DO_SPACES_ACCESS_KEY_ID=your-access-key
// DO_SPACES_SECRET_ACCESS_KEY=your-secret-key
// DO_SPACES_REGION=nyc3
// DO_SPACES_BUCKET_NAME=your-bucket-name
// DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

const presignedData = await generatePresignedUrl({
  prefix: 'folder',
  key: 'filename.jpg',
  isPublic: true   // if want to make publically accessible
  method: HttpMethod.PUT,
  contentType: 'image/jpeg',
});

// give access of acl to public read
await makeFilePublic(key);
```

## API Reference

### generatePresignedUrl(params, options?)

Generates a presigned URL for uploading or downloading files.

#### Parameters

- `params`: Object - Required parameters for generating the presigned URL
  - `key`: string - Key/path of the file in storage
  - `method`: HttpMethod - HTTP method (GET, PUT, POST, DELETE)
  - `contentType`: string - Content type of the file (for upload)
  - `contentLength`: number - Size of the file in bytes (for upload)
  - `metadata`: Object - Additional metadata to store with the file

- `options`: Object - Optional parameters
  - `expiration`: number - Expiration time in seconds

#### Returns

Promise resolving to an object with:
- `url`: string - The presigned URL
- `method`: HttpMethod - The HTTP method to use
- `expiresAt`: string - ISO timestamp when the URL expires
- `headers`: Object - Headers to include with the request
- `fields`: Object - Fields to include with the request (for POST upload)

## License

MIT