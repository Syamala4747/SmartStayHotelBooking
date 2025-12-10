// Quick test to verify Cloudinary configuration
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🧪 Testing Cloudinary Configuration...\n');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📋 Configuration:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('');

// Test connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary Connection: SUCCESS');
    console.log('   Status:', result.status);
    console.log('');
    console.log('🎉 Cloudinary is configured correctly!');
    console.log('');
    console.log('📸 Test HD URL generation:');
    const testUrl = cloudinary.url('sample', {
      quality: 'auto:best',
      fetch_format: 'auto',
      width: 2000,
      crop: 'limit',
      secure: true,
      dpr: 'auto',
    });
    console.log('   ' + testUrl);
    console.log('');
    console.log('✅ Your images will be optimized with:');
    console.log('   - q_auto:best (intelligent quality)');
    console.log('   - f_auto (WebP/AVIF format)');
    console.log('   - w_2000 (HD width)');
    console.log('   - dpr_auto (retina support)');
    console.log('');
    console.log('🚀 Ready to upload HD images!');
  })
  .catch(error => {
    console.log('❌ Cloudinary Connection: FAILED');
    console.log('   Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your .env file has correct credentials');
    console.log('   2. Verify your Cloudinary account is active');
    console.log('   3. Check internet connection');
    console.log('   4. Visit https://cloudinary.com/console to verify credentials');
  });