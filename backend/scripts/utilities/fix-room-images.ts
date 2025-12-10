import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fixRoomImages() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Get all images from Cloudinary
    console.log('📸 Fetching images from Cloudinary...\n');
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'hotel-rooms/',
      max_results: 500,
    });

    console.log(`✅ Found ${result.resources.length} images on Cloudinary\n`);

    // Build HD URLs for all images
    const cloudinaryImages = result.resources.map(resource => {
      const urlParts = resource.secure_url.split('/upload/');
      return `${urlParts[0]}/upload/q_auto:best,f_auto,w_2000,c_limit,dpr_auto/${urlParts[1]}`;
    });

    console.log('🎨 Sample HD URLs:');
    cloudinaryImages.slice(0, 3).forEach(url => {
      console.log(`   ${url.substring(0, 80)}...`);
    });
    console.log('');

    // Get all rooms
    const rooms = await dataSource.query('SELECT * FROM rooms ORDER BY id');
    console.log(`📊 Found ${rooms.length} rooms\n`);

    // Distribute images to rooms (roughly equal distribution)
    const imagesPerRoom = Math.floor(cloudinaryImages.length / rooms.length);
    const remainder = cloudinaryImages.length % rooms.length;

    console.log(`📦 Distributing ${cloudinaryImages.length} images across ${rooms.length} rooms`);
    console.log(`   ~${imagesPerRoom} images per room\n`);

    let imageIndex = 0;
    let updatedCount = 0;

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const numImages = imagesPerRoom + (i < remainder ? 1 : 0);
      const roomImages = cloudinaryImages.slice(imageIndex, imageIndex + numImages);
      imageIndex += numImages;

      if (roomImages.length > 0) {
        await dataSource.query(
          'UPDATE rooms SET images = $1 WHERE id = $2',
          [roomImages, room.id]
        );
        updatedCount++;
        console.log(`✅ Room ${room.room_number}: ${roomImages.length} HD images assigned`);
      }
    }

    console.log(`\n\n📊 Update Summary:`);
    console.log(`   Total rooms updated: ${updatedCount}`);
    console.log(`   Total images distributed: ${cloudinaryImages.length}`);
    console.log(`\n✅ All rooms now have HD Cloudinary images!`);
    console.log(`\n💡 Refresh your browser to see the images!`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixRoomImages();