# 🚀 Beginner Setup Guide

This guide will help you set up the Hotel Booking System step by step.

## 📋 What You Need

1. **Node.js** - Download from [nodejs.org](https://nodejs.org/)
2. **Code Editor** - VS Code recommended
3. **Database** - We'll use free Neon PostgreSQL
4. **Image Storage** - We'll use free Cloudinary

## 🎯 Step-by-Step Setup

### Step 1: Download the Project
```bash
# Download and extract the project
# Or clone if you have Git:
git clone <your-repo-url>
cd hotel-booking-system
```

### Step 2: Setup Database (Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### Step 3: Setup Image Storage (Free)
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free
3. Go to Dashboard
4. Copy these 3 values:
   - Cloud Name
   - API Key  
   - API Secret

### Step 4: Setup Backend
```bash
# Go to backend folder
cd backend

# Install packages
npm install

# Create environment file
copy .env.example .env
# On Mac/Linux: cp .env.example .env
```

Edit `backend/.env` file:
```env
DATABASE_URL=your_neon_connection_string_here
JWT_SECRET=any_random_text_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start backend:
```bash
npm run start:dev
```

### Step 5: Create Admin User
Open a new terminal:
```bash
cd backend
npx ts-node scripts/database/create-admin.sql
```

Copy the SQL output and run it in your Neon database console.

### Step 6: Setup Frontend
Open a new terminal:
```bash
# Go to frontend folder
cd frontend

# Install packages
npm install

# Start frontend
npm run dev
```

## 🎉 You're Done!

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Admin Login**: hotel@gmail.com / 1234567890

## 🔧 Common Issues

### "npm not found"
- Install Node.js from nodejs.org

### "Database connection failed"
- Check your DATABASE_URL in backend/.env
- Make sure Neon database is running

### "Images not uploading"
- Check Cloudinary credentials in backend/.env
- Make sure all 3 values are correct

### "Port already in use"
- Close other applications using ports 3000 or 5173
- Or change ports in the code

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Look at the error messages in the terminal
3. Make sure all environment variables are set correctly
4. Restart both backend and frontend servers

## 🎯 Quick Test

1. Go to http://localhost:5173
2. Click "Sign Up" and create an account
3. Browse rooms and make a booking
4. Login as admin (hotel@gmail.com / 1234567890)
5. Check the admin dashboard

That's it! You now have a fully working hotel booking system! 🏨✨