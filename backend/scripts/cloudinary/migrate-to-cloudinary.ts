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
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'hotel-rooms',
      resource_type: 'image',
    });

    // Build HD optimized URL
    const urlParts = result.secure_url.split('/upload/');
    const optimizedUrl = `${urlParts[0]}/upload/q_auto:best,f_auto,w_2000,c_limit,dpr_auto/${urlParts[1]}`;
    
    console.log(`   ✅ Uploaded: ${path.basename(localPath)}`);
    console.log(`   🎨 HD URL: ${optimizedUrl}`);
    
    return optimizedUrl;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${localPath}:`, error.message);
    throw error;
  }
}

async function migrateImages() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Get all rooms
    const rooms = await dataSource.query('SELECT * FROM rooms');
    console.log(`📊 Found ${rooms.length} rooms\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const room of rooms) {
      if (room.images) {
        console.log(`\n🏨 Processing Room ${room.room_number}...`);
        
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
            const localPath = path.join(__dirname, '..', 'uploads', filename);

            if (fs.existsSync(localPath)) {
              try {
                const cloudinaryUrl = await uploadToCloudinaryHD(localPath);
                newImages.push(cloudinaryUrl);
                roomUpdated = true;
              } catch (error) {
                console.error(`   ⚠️  Keeping original URL due to error`);
                newImages.push(img);
                errorCount++;
              }
            } else {
              console.log(`   ⚠️  File not found: ${filename} - keeping original URL`);
              newImages.push(img);
            }
          } else if (img.includes('res.cloudinary.com')) {
            // Already on Cloudinary - add HD transformations if missing
            if (!img.includes('q_auto')) {
              const urlParts = img.split('/upload/');
              const hdUrl = `${urlParts[0]}/upload/q_auto:best,f_auto,w_2000,c_limit,dpr_auto/${urlParts[1]}`;
              console.log(`   🔧 Adding HD transformations to existing Cloudinary image`);
              newImages.push(hdUrl);
              roomUpdated = true;
            } else {
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
          migratedCount++;
          console.log(`   ✅ Room ${room.room_number} updated with HD images`);
        } else {
          console.log(`   ℹ️  Room ${room.room_number} - no changes needed`);
        }
      }
    }

    console.log(`\n\n📊 Migration Summary:`);
    console.log(`   Total rooms: ${rooms.length}`);
    console.log(`   Migrated to HD: ${migratedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`\n✅ Migration complete!`);
    console.log(`\n💡 Refresh your browser to see HD images!`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateImages();