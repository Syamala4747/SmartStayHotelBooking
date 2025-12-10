import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinaryHD(localPath: string): Promise<string> {
  try {
    console.log(`   📤 Uploading: ${path.basename(localPath)}...`);
    
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'hotel-rooms',
      resource_type: 'image',
    });

    // Build HD optimized URL with transformations
    const urlParts = result.secure_url.split('/upload/');
    const optimizedUrl = `${urlParts[0]}/upload/q_auto:best,f_auto,w_2000,c_limit,dpr_auto/${urlParts[1]}`;
    
    console.log(`   ✅ Uploaded successfully!`);
    console.log(`   🎨 HD URL: ${optimizedUrl.substring(0, 80)}...`);
    
    return optimizedUrl;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${localPath}:`, error.message);
    throw error;
  }
}

async function migrateUploadsToCloudinary() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Get all rooms
    const rooms = await dataSource.query('SELECT * FROM rooms ORDER BY id');
    console.log(`📊 Found ${rooms.length} rooms\n`);

    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Create a mapping of local filenames to Cloudinary URLs
    const imageMapping: { [key: string]: string } = {};
    
    // Get all image files from uploads folder
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
    
    console.log(`📁 Found ${files.length} images in uploads folder\n`);
    console.log('🚀 Starting upload to Cloudinary with HD optimization...\n');

    // Upload all images to Cloudinary
    const uploadedFiles: string[] = [];
    for (const file of files) {
      const localPath = path.join(uploadsDir, file);
      try {
        const cloudinaryUrl = await uploadToCloudinaryHD(localPath);
        imageMapping[file] = cloudinaryUrl;
        uploadedFiles.push(localPath);
        console.log('');
      } catch (error) {
        console.error(`   ⚠️  Skipping ${file} due to error\n`);
      }
    }

    console.log(`\n✅ Uploaded ${Object.keys(imageMapping).length} images to Cloudinary\n`);
    console.log('🔄 Updating database with HD Cloudinary URLs...\n');

    let updatedCount = 0;

    // Update rooms with new Cloudinary URLs
    for (const room of rooms) {
      if (room.images) {
        console.log(`🏨 Processing Room ${room.room_number}...`);
        
        // Parse images (could be string or array)
        let imageArray: string[] = [];
        if (typeof room.images === 'string') {
          imageArray = room.images.split(',').map(s => s.trim());
        } else if (Array.isArray(room.images)) {
          imageArray = room.images;
        }

        const newImages: string[] = [];
        let roomUpdated = false;

        for (const img of imageArray) {
          // Check if it's a localhost URL
          if (img.includes('localhost:3000/uploads/')) {
            const filename = img.split('/uploads/')[1];
            
            if (imageMapping[filename]) {
              newImages.push(imageMapping[filename]);
              roomUpdated = true;
              console.log(`   ✅ Replaced ${filename} with HD Cloudinary URL`);
            } else {
              console.log(`   ⚠️  No Cloudinary URL found for ${filename}, keeping original`);
              newImages.push(img);
            }
          } else {
            newImages.push(img);
          }
        }

        if (roomUpdated) {
          await dataSource.query(
            'UPDATE rooms SET images = $1 WHERE id = $2',
            [newImages, room.id]
          );
          updatedCount++;
          console.log(`   ✅ Room ${room.room_number} updated with HD images\n`);
        } else {
          console.log(`   ℹ️  Room ${room.room_number} - no changes needed\n`);
        }
      }
    }

    console.log(`\n\n📊 Migration Summary:`);
    console.log(`   Total images uploaded: ${Object.keys(imageMapping).length}`);
    console.log(`   Total rooms updated: ${updatedCount}`);
    
    // Delete local images after successful upload
    console.log(`\n🗑️  Deleting local images from uploads folder...`);
    let deletedCount = 0;
    for (const localPath of uploadedFiles) {
      try {
        fs.unlinkSync(localPath);
        deletedCount++;
        console.log(`   ✅ Deleted: ${path.basename(localPath)}`);
      } catch (error) {
        console.error(`   ⚠️  Failed to delete: ${path.basename(localPath)}`);
      }
    }
    
    console.log(`\n✅ Deleted ${deletedCount} local images`);
    console.log(`\n✅ Migration complete!`);
    console.log(`\n🎉 All images are now on Cloudinary with HD optimization!`);
    console.log(`   - Quality: auto:best`);
    console.log(`   - Format: auto (WebP/AVIF)`);
    console.log(`   - Width: 2000px (HD)`);
    console.log(`   - DPR: auto (Retina support)`);
    console.log(`\n💡 Refresh your browser to see crystal clear HD images!`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateUploadsToCloudinary();