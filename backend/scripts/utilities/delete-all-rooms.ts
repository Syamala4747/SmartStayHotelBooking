import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function deleteAllRooms() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Get count before deletion
    const countBefore = await dataSource.query('SELECT COUNT(*) FROM rooms');
    const bookingsCount = await dataSource.query('SELECT COUNT(*) FROM bookings');
    console.log(`📊 Current rooms: ${countBefore[0].count}`);
    console.log(`📊 Current bookings: ${bookingsCount[0].count}\n`);

    // Delete bookings first (to avoid foreign key constraint)
    console.log('🗑️  Deleting all bookings...');
    await dataSource.query('DELETE FROM bookings');
    console.log('✅ Bookings deleted\n');

    // Delete feedbacks
    console.log('🗑️  Deleting all feedbacks...');
    await dataSource.query('DELETE FROM feedbacks');
    console.log('✅ Feedbacks deleted\n');

    // Delete all rooms
    console.log('🗑️  Deleting all rooms...');
    await dataSource.query('DELETE FROM rooms');
    
    console.log('✅ All rooms deleted!\n');
    console.log('💡 Now you can:');
    console.log('   1. Login as admin');
    console.log('   2. Go to "Manage Rooms"');
    console.log('   3. Create new rooms with HD images');
    console.log('   4. Images will automatically upload to Cloudinary with HD optimization\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAllRooms();