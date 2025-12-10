const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'omen',
});

async function checkImages() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const result = await client.query('SELECT id, room_number, images FROM rooms ORDER BY id');
    
    console.log('📋 Rooms in database:\n');
    result.rows.forEach(room => {
      console.log(`Room ${room.room_number} (ID: ${room.id}):`);
      console.log(`  Images: ${room.images}`);
      console.log(`  Type: ${typeof room.images}`);
      console.log(`  Value: ${JSON.stringify(room.images)}`);
      console.log('');
    });
    
    console.log(`Total rooms: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkImages();