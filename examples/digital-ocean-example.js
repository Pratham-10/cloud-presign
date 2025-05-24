require('dotenv').config();

const { generatePresignedUrl, HttpMethod } = require('cloud-presign');

// Digital Ocean environment variables must be set:
// CLOUD_PROVIDER=digital_ocean
// DO_SPACES_ACCESS_KEY_ID=your-access-key
// DO_SPACES_SECRET_ACCESS_KEY=your-secret-key
// DO_SPACES_REGION=nyc3
// DO_SPACES_BUCKET_NAME=your-bucket-name
// DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

async function example() {
  try {
    // Generate upload URL
    const uploadUrl = await generatePresignedUrl({
      key: 'uploads/example-file.txt',
      method: HttpMethod.PUT,
      contentType: 'text/plain',
    });
    
    console.log('Upload URL:', uploadUrl.url);
    console.log('Upload URL expires at:', uploadUrl.expiresAt);
    console.log('Required headers:', uploadUrl.headers);
    
    // Upload a file with the presigned URL
    console.log('\nUploading file using the presigned URL...');
    
    const content = 'This is a test file uploaded to Digital Ocean Spaces using a presigned URL.';
    
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