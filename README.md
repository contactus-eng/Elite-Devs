# EliteDevs Website

A modern, professional website for EliteDevs - a software development agency specializing in web development, mobile apps, AI solutions, and cloud services.

## 📁 Project Structure

```
elitedevs-website/
├── 📁 frontend/                 # Frontend application
│   ├── 📁 assets/              # Static assets
│   │   ├── 📁 css/             # Stylesheets
│   │   ├── 📁 js/              # JavaScript files
│   │   └── 📁 images/          # Images and media
│   ├── 📁 pages/               # HTML pages
│   └── 📁 components/          # Reusable components
├── 📁 backend/                  # Backend API server
│   ├── 📁 src/                 # Source code
│   │   ├── 📁 models/          # Database models
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 middleware/      # Custom middleware
│   │   ├── 📁 services/        # Business logic
│   │   ├── 📁 config/          # Configuration files
│   │   └── 📁 utils/           # Utility functions
│   ├── 📁 uploads/             # File uploads
│   ├── 📁 tests/               # Test files
│   ├── package.json            # Dependencies
│   ├── server.js               # Main server file
│   └── start-backend.sh        # Startup script
└── 📁 docs/                     # Documentation
    ├── 📁 api/                 # API documentation
    ├── 📁 deployment/          # Deployment guides
    └── 📁 user-guide/          # User guides
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Email service (Gmail, SendGrid, etc.)

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Serve the frontend (choose one method)
python3 -m http.server 8000
# OR
npx serve .
# OR
php -S localhost:8000
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Start the server
./start-backend.sh
# OR
npm start
```

## 📚 Documentation

- **[Main Documentation](docs/README.md)** - Complete project overview
- **[API Documentation](docs/api/README-BACKEND.md)** - Backend API reference
- **[Deployment Guide](docs/deployment/)** - Production deployment instructions
- **[User Guide](docs/user-guide/)** - User manuals and guides

## 🌟 Features

### Frontend
- Modern responsive design
- GSAP animations and Three.js effects
- Dark mode support
- Contact forms with validation
- Portfolio showcase
- Blog system
- Newsletter subscription

### Backend
- RESTful API with Express.js
- MongoDB database integration
- Email notification system
- Analytics tracking
- Admin dashboard
- File upload handling
- Security features

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- GSAP for animations
- Three.js for 3D effects

### Backend
- Node.js, Express.js
- MongoDB with Mongoose
- Nodemailer for emails
- JWT for authentication
- Helmet.js for security

## 📞 Support

- Email: contact.us@elitedevs.work
- Phone: +91 (878) 088-1010
- Website: https://elitedevs.work

## 📄 License

This project is licensed under the MIT License.

