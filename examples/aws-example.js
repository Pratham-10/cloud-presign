require('dotenv').config();

const { generatePresignedUrl, HttpMethod } = require('cloud-presign');

// AWS environment variables must be set:
// CLOUD_PROVIDER=aws
// AWS_ACCESS_KEY_ID=your-access-key
// AWS_SECRET_ACCESS_KEY=your-secret-key
// AWS_REGION=us-east-1
// AWS_BUCKET_NAME=your-bucket-name

async function example() {
  try {
    // Generate upload URL
    const uploadUrl = await generatePresignedUrl({
      key: 'uploads/example-file.txt',
      method: HttpMethod.PUT,
      contentType: 'text/plain',
      metadata: {
        'x-amz-meta-uploaded-by': 'example-script',
      },
    });
    
    console.log('Upload URL:', uploadUrl.url);
    console.log('Upload URL expires at:', uploadUrl.expiresAt);
    console.log('Required headers:', uploadUrl.headers);
    
    // Upload a file with the presigned URL
    console.log('\nUploading file using the presigned URL...');
    
    const content = 'This is a test file uploaded using a presigned URL.';
    
    // Example using fetch (in Node.js environment, use node-fetch)
    const fetch = require('node-fetch');
    const response = await fetch(uploadUrl.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        ...uploadUrl.headers,
      },
      body: content,
    });
    
    console.log('Upload response status:', response.status);
    
    // Generate download URL for the same file
    const downloadUrl = await generatePresignedUrl({
      key: 'uploads/example-file.txt',
      method: HttpMethod.GET,
    });
    
    console.log('\nDownload URL:', downloadUrl.url);
    console.log('Download URL expires at:', downloadUrl.expiresAt);
    
    // Example: Download the file
    console.log('\nDownloading file using the presigned URL...');
    const downloadResponse = await fetch(downloadUrl.url);
    const downloadedContent = await downloadResponse.text();
    
    console.log('Downloaded content:', downloadedContent);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();