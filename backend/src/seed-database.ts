import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedAdmin() {
  // Database configuration
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.error('💡 Please add DATABASE_URL to your .env file');
    console.error('   Example: DATABASE_URL=postgresql://user:pass@host:5432/database');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  console.log('🌐 Provider:', databaseUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL');

  // Create data source
  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech') ? {
      rejectUnauthorized: false
    } : false,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database successfully!');

    // Get admin credentials from environment
    const adminName = process.env.ADMIN_NAME || 'Hotel Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'hotel@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '1234567890';

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 8);

    // Check if admin already exists
    const existingAdmin = await dataSource.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', adminEmail);
      console.log('');
      console.log('To update the admin password, delete the existing user first:');
      console.log(`DELETE FROM users WHERE email = '${adminEmail}';`);
    } else {
      // Insert admin user
      console.log('👤 Creating admin user...');
      await dataSource.query(
        `INSERT INTO users (name, email, password, role, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [adminName, adminEmail, hashedPassword, 'ADMIN']
      );

      console.log('');
      console.log('='.repeat(60));
      console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log('📧 Email:    ', adminEmail);
      console.log('🔑 Password: ', adminPassword);
      console.log('👤 Name:     ', adminName);
      console.log('🎭 Role:     ', 'ADMIN');
      console.log('='.repeat(60));
      console.log('');
      console.log('🌐 You can now login at: http://localhost:5173/login');
      console.log('');
    }

    // Close connection
    await dataSource.destroy();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL in .env file');
    console.error('   2. Make sure your database is running');
    console.error('   3. Verify your database credentials');
    console.error('   4. Check if the database exists');
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();