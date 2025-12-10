# 🏨 SmartStay Hotel Booking System

Modern full-stack hotel booking application with admin dashboard, AI chatbot, and HD image optimization.

## ✨ Features

**User Experience:** Registration, room browsing, booking management, feedback system, AI assistance  
**Admin Dashboard:** Room management, booking oversight, statistics, HD image upload via Cloudinary  
**AI Chatbot:** Groq-powered assistant for room recommendations and pricing queries  
**Mobile Responsive:** Touch-friendly interface optimized for all devices

## 🛠️ Tech Stack

**Backend:** NestJS, TypeScript, PostgreSQL (Neon), TypeORM, JWT, bcrypt, Cloudinary, Groq AI  
**Frontend:** React 18, TypeScript, Vite, React Router v6, Axios  
**Security:** JWT authentication, RBAC, input validation, CORS, SQL injection prevention

## 📁 Project Structure

```
├── backend/src/
│   ├── auth/              # JWT authentication & user management
│   ├── bookings/          # Booking system with conflict detection
│   ├── rooms/             # Room CRUD operations
│   ├── feedback/          # Rating and review system
│   ├── ai/                # Groq AI chatbot integration
│   ├── cloudinary/        # HD image upload & optimization
│   └── entities/          # TypeORM database models
└── frontend/src/
    ├── pages/             # React pages (Login, Rooms, Admin panels)
    ├── components/        # Reusable UI components (Navbar, Chatbot)
    ├── api/               # Axios API client & services
    └── context/           # Authentication context
```

## 🚀 Quick Start

**Prerequisites:** Node.js v18+, PostgreSQL/Neon account, Cloudinary account, Groq API key

### 1. Setup Backend
```bash
git clone <repository-url>
cd hotel-booking-system/backend
npm install
```

**Environment Variables** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run start:dev  # Runs on http://localhost:3000
npm run seed       # Creates admin user
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
```

**Environment Variables** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

```bash
npm run dev        # Runs on http://localhost:5173
```

**Default Admin:** hotel@gmail.com / 1234567890

## 📊 Database Schema

**Users:** id, name, email (unique), password (hashed), role (ADMIN/USER), created_at  
**Rooms:** id, room_number (unique), room_type[], cost, capacity, description, images[], is_active  
**Bookings:** id, room_id, user_id, start_time, end_time, total_cost, status (CONFIRMED/CANCELLED)  
**Feedbacks:** id, room_id, user_id, rating (1-5), comment, created_at

## 📸 HD Image Optimization

**Cloudinary Integration:** Automatic HD optimization (up to 20MB), WebP/AVIF conversion, CDN delivery  
**Performance:** 70-90% file size reduction, 10x faster loading, real-time optimization  
**Setup:** Get free credentials at [cloudinary.com](https://cloudinary.com/users/register/free)

## 🔌 API Endpoints

**Auth:** `POST /auth/signup`, `POST /auth/login`  
**Rooms:** `GET|POST|PATCH|DELETE /rooms` (Admin), `GET /rooms/:id/feedback`  
**Bookings:** `POST /bookings`, `GET /bookings/my`, `PATCH /bookings/:id/cancel`  
**Feedback:** `POST|PATCH|DELETE /feedback`  
**AI:** `POST /ai/chat`

## 💰 Pricing Logic

**Duration-based:** 6-12hrs (hourly rate) | 12-24hrs (full day) | >24hrs (multiple days)  
**Example:** ₹2400/day = ₹100/hr → 8hrs: ₹800, 20hrs: ₹2400, 30hrs: ₹4800

## 🎨 UI/UX & Security

**Security:** bcrypt hashing, JWT auth, RBAC, input validation, CORS, SQL injection prevention  
**Design:** Modern gradients, smooth animations, responsive layouts, loading states, toast notifications  
**Mobile:** Touch-friendly interface, optimized navigation, mobile-first design

## 🌐 Deployment

**Backend:** Deploy to Render/Railway/Heroku with `npm run build` → `npm run start:prod`  
**Frontend:** Deploy to Vercel/Netlify with `npm run build` → deploy `dist/` folder  
**Database:** Use [Neon PostgreSQL](https://neon.tech) (free tier available)  
**Environment:** Set all variables in hosting platform, update API URLs for production

## 🧪 Testing

**Admin Flow:** Login (hotel@gmail.com/1234567890) → Manage rooms → Upload HD images → View bookings  
**User Flow:** Sign up → Browse rooms → Make booking → Leave feedback  
**AI Chatbot:** Click chat icon → Ask "What rooms are available?" or "I need a room for 4 people"  
**Image Upload:** Admin panel → Add room → Upload images (auto HD optimization)

## 🐛 Troubleshooting

**Backend Issues:** Check DATABASE_URL, port 3000 availability, PostgreSQL status, run `npm install`  
**Frontend Issues:** Verify VITE_API_BASE_URL, clear browser cache, check console errors  
**Image Upload:** Verify Cloudinary credentials, max 20MB files, supported formats (JPG/PNG/WebP)  
**AI Chatbot:** Check GROQ_API_KEY, API quotas, backend console logs

## 📝 Environment Variables

**Backend:** DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GROQ_API_KEY, ADMIN_*  
**Frontend:** VITE_API_BASE_URL

## 🤝 Contributing & License

**Contributing:** Fork → Branch → Commit → Push → Pull Request  
**License:** MIT - Free for learning and commercial use

---

**Built with ❤️ using NestJS, React & TypeScript | Happy Booking! 🏨✨**
