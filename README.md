# 🔗 ShortLink

A modern, full-stack URL shortener built with the MERN stack. Create short, shareable links with detailed analytics and custom aliases.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://short-link-one-mu.vercel.app)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://shortlink-ex0a.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)]()

## ✨ Features

- **🔐 User Authentication** - Secure JWT-based authentication with password reset
- **⚡ Instant Short Links** - Generate short URLs with auto-generated or custom aliases
- **📊 Detailed Analytics** - Track clicks, locations, devices, browsers, and referrers
- **🌍 Geolocation Tracking** - See where your clicks are coming from
- **🎨 Modern UI** - Responsive React interface with Tailwind CSS
- **📱 Mobile Friendly** - Works seamlessly on all devices
- **🔒 Secure** - Rate limiting, input validation, and security headers
- **⚙️ Custom Aliases** - Create memorable, branded short links

## 🚀 Live Demo

**Frontend:** [https://short-link-one-mu.vercel.app](https://short-link-one-mu.vercel.app)  
**API:** [https://shortlink-ex0a.onrender.com](https://shortlink-ex0a.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router v7** - Routing
- **React Query v5** - Data fetching and caching
- **Recharts** - Analytics charts
- **GSAP** - Animations

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Joi** - Validation
- **Winston** - Logging
- **Nodemailer** - Email service

### DevOps
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting
- **UptimeRobot** - Uptime monitoring

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shortlink.git
cd shortlink
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# URLs
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Email (Optional - for password reset)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
SMTP_FROM=source_email

# Logging
LOG_LEVEL=info
```

Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=ShortLink
```

Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🌐 Deployment

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (see `.env` above)
5. Deploy!

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
3. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL
   - `VITE_APP_NAME`: ShortLink
4. Deploy!

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add database user with read/write permissions
3. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
4. Get connection string and add to backend `.env`

## 📁 Project Structure

```
shortlink/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (email, validation, logging)
│   ├── .env.example     # Environment variables template
│   ├── server.js        # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── context/     # React context (Auth, Theme)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env.example     # Environment variables template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password/:token - Reset password
```

### Links
```
GET    /api/links                - Get user's links
POST   /api/links                - Create new short link
GET    /api/links/:id            - Get single link
PUT    /api/links/:id            - Update link
DELETE /api/links/:id            - Delete link
DELETE /api/links                - Bulk delete links
GET    /:shortCode               - Redirect to original URL
```

### Analytics
```
GET    /api/analytics/link/:linkId      - Get link analytics
GET    /api/analytics/dashboard         - Get dashboard stats
```

## 🎯 Key Features Explained

### Short Code Generation
- Auto-generated 8-character codes using `nanoid`
- Custom aliases (3-50 characters, alphanumeric + hyphens/underscores)
- Collision prevention with database uniqueness checks

### Analytics Tracking
- **Geolocation**: Country, region, city via IP lookup
- **Device Detection**: Desktop, mobile, tablet
- **Browser/OS**: Chrome, Firefox, Safari, etc.
- **Referrer Tracking**: Where clicks came from
- **Time-based Analytics**: Track clicks over time

### Security
- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting (100 req/15min globally, 5 req/15min for auth)
- Input validation with Joi
- Helmet.js security headers
- CORS protection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [nanoid](https://github.com/ai/nanoid) for short code generation
- [ipapi.co](https://ipapi.co) for geolocation services
- [Recharts](https://recharts.org) for beautiful analytics charts
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Render](https://render.com) & [Vercel](https://vercel.com) for hosting

⭐ Star this repo if you found it helpful!

**Built with ❤️ using the MERN Stack**
