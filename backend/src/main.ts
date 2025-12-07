import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Ensure uploads directory exists
    const uploadsDir = join(__dirname, '..', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory:', uploadsDir);
    }
    
    // Serve static files from uploads directory with HD quality settings
    app.useStaticAssets(uploadsDir, {
      prefix: '/uploads/',
      maxAge: '1d',
      setHeaders: (res, path) => {
        // Ensure images are served without compression
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Content-Type', 'image/*');
        // Prevent any quality degradation
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    });
    console.log('📁 Serving static files from:', uploadsDir);
    
    app.enableCors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:3001',
        'https://smartstayhotelbooking.vercel.app'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    
    // Check database connection
    try {
      const dataSource = app.get(DataSource);
      console.log('\n🔍 Checking database connection...');
      
      if (dataSource.isInitialized) {
        const dbType = dataSource.options.type;
        const dbName = dataSource.options.database;
        
        // Check if using Neon
        const isNeon = process.env.DATABASE_URL?.includes('neon.tech') || false;
        
        // Safely get host (only exists for postgres/mysql types)
        const options = dataSource.options as any;
        const host = options.host || options.url || 'unknown';
        
        console.log('✅ Database connected successfully!');
        console.log(`📊 Database Type: ${dbType}`);
        console.log(`📦 Database Name: ${dbName}`);
        console.log(`🌐 Host: ${host}`);
        
        if (isNeon) {
          console.log('☁️  Provider: Neon PostgreSQL (Cloud)');
          console.log('🔒 SSL: Enabled');
        } else {
          console.log('💻 Provider: Local PostgreSQL');
        }
        
        // Test query
        const result = await dataSource.query('SELECT NOW() as current_time');
        console.log(`⏰ Database Time: ${result[0].current_time}`);
        console.log('');
      } else {
        console.log('❌ Database not initialized');
        console.log('');
      }
    } catch (err) {
      console.log('❌ Database connection error:', err.message);
      console.log('💡 Check your DATABASE_URL in .env file');
      console.log('');
    }
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
