import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function restoreRooms() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Restore the 10 rooms with placeholder Cloudinary images
    const rooms = [
      { room_number: '101', room_type: ['AC', '2BHK', 'WIFI', 'TV'], cost: 996, capacity: 4, description: 'Comfortable room with modern amenities', images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=2000&q=80'] },
      { room_number: '102', room_type: ['NON_AC', '1BHK', 'TV'], cost: 698, capacity: 4, description: 'Cozy room perfect for small families', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=2000&q=80'] },
      { room_number: '103', room_type: ['AC', '4BHK', 'SEA_VIEW', 'BALCONY', 'WIFI', 'TV', 'KITCHEN'], cost: 2959, capacity: 8, description: 'Luxury suite with sea view', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2000&q=80'] },
      { room_number: '104', room_type: ['NON_AC', '2BHK', 'STANDARD', 'TV', 'SMOKING'], cost: 998, capacity: 4, description: 'Standard room with basic amenities', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=2000&q=80'] },
      { room_number: '105', room_type: ['AC', '1BHK', 'PENTHOUSE', 'NON_SMOKING', 'TV'], cost: 1698, capacity: 3, description: 'Premium penthouse room', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=2000&q=80'] },
      { room_number: '106', room_type: ['NON_AC', 'WITH_VENTILATION', '1BHK', 'ECONOMY', 'TV'], cost: 598, capacity: 2, description: 'Budget-friendly economy room', images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=2000&q=80'] },
      { room_number: '107', room_type: ['AC', 'WITHOUT_VENTILATION', '3BHK', 'CITY_VIEW', 'WIFI', 'TV'], cost: 1998, capacity: 6, description: 'Spacious room with city view', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=2000&q=80'] },
      { room_number: '108', room_type: ['AC', '3BHK', 'PREMIUM', 'LUXURY', 'CITY_VIEW', 'WIFI', 'TV', 'POOL_ACCESS'], cost: 4999, capacity: 5, description: 'Premium luxury room with pool access', images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=2000&q=80'] },
      { room_number: '109', room_type: ['AC', '1BHK', 'DELUXE', 'WIFI', 'TV', 'KITCHEN'], cost: 1299, capacity: 3, description: 'Deluxe room with kitchenette', images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=2000&q=80'] },
      { room_number: '110', room_type: ['AC', '2BHK', 'SUITE', 'GARDEN_VIEW', 'BALCONY', 'WIFI', 'TV', 'PARKING'], cost: 1899, capacity: 4, description: 'Suite with garden view and parking', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=2000&q=80'] },
    ];

    console.log('🔄 Restoring rooms...\n');

    for (const room of rooms) {
      await dataSource.query(
        `INSERT INTO rooms (room_number, room_type, cost, capacity, description, images, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [room.room_number, room.room_type, room.cost, room.capacity, room.description, room.images]
      );
      console.log(`✅ Restored Room ${room.room_number}`);
    }

    console.log('\n✅ All rooms restored with HD placeholder images!');
    console.log('\n💡 These are temporary HD images from Unsplash.');
    console.log('   You can now edit each room and upload your own images.');
    console.log('   New uploads will automatically use Cloudinary with HD optimization.\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

restoreRooms();