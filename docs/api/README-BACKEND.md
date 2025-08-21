# EliteDevs Backend API

A comprehensive Node.js/Express backend API for the EliteDevs website, providing robust functionality for contact forms, blog management, portfolio management, newsletter subscriptions, and analytics tracking.

## 🚀 Features

### Core Functionality
- **Contact Form Processing** - Handle form submissions with email notifications
- **Blog Management** - CRUD operations for blog posts with categories and tags
- **Portfolio Management** - Manage portfolio projects with detailed information
- **Newsletter System** - Email subscription management with preferences
- **Analytics Tracking** - Comprehensive website analytics and user behavior tracking
- **Admin Dashboard** - Statistics and management tools

### Technical Features
- **RESTful API** - Clean, consistent API design
- **MongoDB Integration** - Robust data storage with Mongoose ODM
- **Email Service** - Automated email notifications using Nodemailer
- **Input Validation** - Comprehensive validation using express-validator
- **Rate Limiting** - Protection against abuse
- **Security** - Helmet.js for security headers
- **Error Handling** - Centralized error handling with detailed logging
- **Analytics** - User behavior tracking and reporting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd elitedevs-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/elitedevs
   MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/elitedevs

   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=contact.us@elitedevs.work

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads

   # Analytics
   GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /api/health
```

### Contact Form API

#### Submit Contact Form
```
POST /api/contact/submit
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "service": "web-development",
  "budget": "10k-25k",
  "timeline": "3-6-months",
  "message": "Project description..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We'll get back to you within 24 hours.",
  "data": {
    "id": "contact_id",
    "name": "John Doe",
    "email": "john@example.com",
    "service": "Web Development",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Contact Submissions (Admin)
```
GET /api/contact/submissions?page=1&limit=10&status=new
```

#### Update Contact Status (Admin)
```
PATCH /api/contact/submissions/:id/status
```

**Request Body:**
```json
{
  "status": "contacted",
  "notes": "Called client, scheduled meeting"
}
```

### Blog API

#### Get All Blog Posts
```
GET /api/blog?page=1&limit=10&category=web-development&search=react
```

#### Get Featured Posts
```
GET /api/blog/featured?limit=3
```

#### Get Blog Post by Slug
```
GET /api/blog/your-blog-post-slug
```

#### Get Categories
```
GET /api/blog/categories/list
```

#### Get Tags
```
GET /api/blog/tags/list
```

#### Like a Post
```
POST /api/blog/:slug/like
```

#### Get Related Posts
```
GET /api/blog/:slug/related
```

### Portfolio API

#### Get All Portfolio Projects
```
GET /api/portfolio?page=1&limit=12&category=web-development&featured=true
```

#### Get Featured Projects
```
GET /api/portfolio/featured?limit=6
```

#### Get Project by Slug
```
GET /api/portfolio/your-project-slug
```

#### Get Categories
```
GET /api/portfolio/categories/list
```

#### Get Projects by Category
```
GET /api/portfolio/category/web-development
```

#### Like a Project
```
POST /api/portfolio/:slug/like
```

#### Get Related Projects
```
GET /api/portfolio/:slug/related
```

### Newsletter API

#### Subscribe to Newsletter
```
POST /api/newsletter/subscribe
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "preferences": {
    "blogUpdates": true,
    "projectUpdates": true,
    "industryNews": true,
    "promotional": false
  }
}
```

#### Unsubscribe
```
POST /api/newsletter/unsubscribe
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Update Preferences
```
PATCH /api/newsletter/preferences
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "preferences": {
    "blogUpdates": false,
    "projectUpdates": true
  }
}
```

### Analytics API

#### Get Overview Statistics
```
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Daily Statistics
```
GET /api/analytics/daily?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Popular Pages
```
GET /api/analytics/popular-pages?limit=10
```

#### Get Device Statistics
```
GET /api/analytics/devices
```

#### Get Geographic Statistics
```
GET /api/analytics/geographic
```

#### Track Custom Event
```
POST /api/analytics/track
```

**Request Body:**
```json
{
  "type": "download",
  "page": "/downloads/whitepaper.pdf",
  "title": "Download Whitepaper",
  "metadata": {
    "fileType": "pdf",
    "fileSize": "2.5MB"
  }
}
```

### Admin API

#### Dashboard Overview
```
GET /api/admin/dashboard
```

#### Contact Statistics
```
GET /api/admin/contacts/stats
```

#### Blog Statistics
```
GET /api/admin/blog/stats
```

#### Portfolio Statistics
```
GET /api/admin/portfolio/stats
```

#### Newsletter Statistics
```
GET /api/admin/newsletter/stats
```

#### Analytics Overview
```
GET /api/admin/analytics/overview
```

#### Bulk Operations
```
POST /api/admin/bulk/contacts/status
POST /api/admin/bulk/blog/status
POST /api/admin/bulk/portfolio/status
```

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "status": "published"
}
```

#### Export Data
```
GET /api/admin/export/contacts
GET /api/admin/export/newsletter
```

## 🔧 Database Models

### Contact Model
- Name, email, phone, company
- Service, budget, timeline, message
- Status tracking (new, contacted, in-progress, completed, archived)
- Email notification tracking

### Blog Model
- Title, slug, excerpt, content
- Author information
- Categories and tags
- SEO metadata
- View and like tracking
- Publication status

### Portfolio Model
- Title, slug, description, detailed description
- Client information and testimonials
- Technologies and features
- Project images and URLs
- Team and duration information
- View and like tracking

### Newsletter Model
- Email, name, preferences
- Subscription status
- Email engagement tracking
- Source tracking

### Analytics Model
- Event type and metadata
- User agent and device information
- Geographic data
- Session tracking
- TTL index for automatic cleanup

## 📧 Email Templates

The backend includes several email templates:

1. **Contact Form Notification** - Sent to admin when form is submitted
2. **Contact Confirmation** - Sent to user confirming submission
3. **Newsletter Welcome** - Sent to new subscribers
4. **Newsletter Broadcast** - Sent to all subscribers

## 🔒 Security Features

- **Rate Limiting** - Prevents abuse with configurable limits
- **Input Validation** - Comprehensive validation for all inputs
- **Security Headers** - Helmet.js for security headers
- **CORS Configuration** - Proper CORS setup for production
- **Error Handling** - Secure error responses without sensitive data

## 📊 Analytics Features

- **Page Views** - Track page visits and user behavior
- **Form Submissions** - Monitor contact form usage
- **Newsletter Signups** - Track subscription growth
- **Device Analytics** - Browser and device statistics
- **Geographic Data** - User location tracking
- **Real-time Analytics** - Live activity monitoring

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set up email service credentials
   - Configure JWT secret

2. **Database Setup**
   - Create production MongoDB database
   - Set up indexes for optimal performance
   - Configure backup strategy

3. **Server Setup**
   - Use PM2 or similar process manager
   - Set up reverse proxy (Nginx)
   - Configure SSL certificates
   - Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/elitedevs |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASS` | Email password | - |
| `EMAIL_FROM` | From email address | contact.us@elitedevs.work |
| `JWT_SECRET` | JWT secret key | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: contact.us@elitedevs.work
- Phone: +91 (878) 088-1010
- Website: https://elitedevs.work

## 🔄 Updates

- **v1.0.0** - Initial release with core functionality
- Contact form processing
- Blog and portfolio management
- Newsletter system
- Analytics tracking
- Admin dashboard
