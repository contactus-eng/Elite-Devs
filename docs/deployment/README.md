# Deployment Guide

Complete guide for deploying the EliteDevs website to various platforms and environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Domain & SSL](#domain--ssl)
6. [Monitoring & Logging](#monitoring--logging)
7. [Performance Optimization](#performance-optimization)
8. [Security Checklist](#security-checklist)

## 🔧 Prerequisites

### Required Tools
- Git for version control
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Email service (Gmail, SendGrid, etc.)
- Domain name (optional but recommended)

### Required Accounts
- GitHub/GitLab for code hosting
- Cloud platform account (AWS, DigitalOcean, Heroku, etc.)
- MongoDB Atlas (for cloud database)
- Email service provider

## 🎨 Frontend Deployment

### Option 1: Netlify (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure your repository is on GitHub/GitLab
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your repository
4. Configure build settings:
   - **Build command**: `cd frontend && npx serve .`
   - **Publish directory**: `frontend`
   - **Base directory**: Leave empty

#### Step 3: Configure Environment
1. Go to Site settings > Environment variables
2. Add any required environment variables
3. Set up custom domain (optional)

#### Step 4: Deploy
Netlify will automatically deploy when you push to your main branch.

### Option 2: Vercel

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Deploy
```bash
cd frontend
vercel
```

#### Step 3: Configure
- Set root directory to `frontend`
- Configure environment variables
- Set up custom domain

### Option 3: GitHub Pages

#### Step 1: Enable GitHub Pages
1. Go to repository settings
2. Scroll to "Pages" section
3. Select source: "Deploy from a branch"
4. Choose branch: `main`
5. Select folder: `/docs` or `/frontend`

#### Step 2: Configure
Create a `.github/workflows/deploy.yml` file:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend
```

### Option 4: AWS S3 + CloudFront

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://your-website-bucket
aws s3 website s3://your-website-bucket --index-document index.html
```

#### Step 2: Upload Files
```bash
aws s3 sync frontend/ s3://your-website-bucket --delete
```

#### Step 3: Configure CloudFront
1. Create CloudFront distribution
2. Set origin to S3 bucket
3. Configure custom domain and SSL

## ⚙️ Backend Deployment

### Option 1: Heroku

#### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Create Heroku App
```bash
heroku create your-app-name
```

#### Step 3: Configure Environment
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set JWT_SECRET=your-secret-key
```

#### Step 4: Deploy
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy backend only
git subtree push --prefix backend heroku main
```

### Option 2: DigitalOcean App Platform

#### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Click "Create App"
3. Connect your repository

#### Step 2: Configure
- **Source Directory**: `backend`
- **Build Command**: `npm install`
- **Run Command**: `npm start`

#### Step 3: Set Environment Variables
Add all required environment variables in the app settings.

### Option 3: AWS EC2

#### Step 1: Launch EC2 Instance
```bash
# Launch Ubuntu instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --count 1 \
  --instance-type t2.micro \
  --key-name your-key-pair
```

#### Step 2: Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/elitedevs-website.git
cd elitedevs-website/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "elitedevs-backend"
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/elitedevs
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/elitedevs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 4: Docker Deployment

#### Step 1: Create Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Step 2: Create Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/elitedevs
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

#### Step 3: Deploy
```bash
docker-compose up -d
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

#### Step 1: Create Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Free tier)

#### Step 2: Configure Network Access
1. Go to Network Access
2. Add IP address: `0.0.0.0/0` (for all IPs)
3. Or add specific IP addresses

#### Step 3: Create Database User
1. Go to Database Access
2. Add new database user
3. Set username and password
4. Grant read/write permissions

#### Step 4: Get Connection String
1. Go to Clusters
2. Click "Connect"
3. Choose "Connect your application"
4. Copy connection string
5. Replace `<password>` with your password

### Local MongoDB

#### Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

#### Start Service
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew services start mongodb-community
```

## 🌐 Domain & SSL

### Domain Configuration

#### Step 1: Purchase Domain
- GoDaddy, Namecheap, Google Domains, etc.

#### Step 2: Configure DNS
Add these records to your domain provider:

**For Frontend (Netlify/Vercel):**
```
Type: CNAME
Name: www
Value: your-app.netlify.app
```

**For Backend (Heroku/DigitalOcean):**
```
Type: CNAME
Name: api
Value: your-app.herokuapp.com
```

### SSL Certificate

#### Automatic SSL (Recommended)
Most platforms provide automatic SSL:
- Netlify: Automatic
- Vercel: Automatic
- Heroku: Automatic
- DigitalOcean: Automatic

#### Manual SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### Application Monitoring

#### PM2 Monitoring
```bash
# Install PM2
npm install -g pm2

# Start with monitoring
pm2 start server.js --name "elitedevs-backend"

# Monitor
pm2 monit

# View logs
pm2 logs

# Dashboard
pm2 plus
```

#### Log Management
```bash
# Create log directory
mkdir -p /var/log/elitedevs

# Configure log rotation
sudo nano /etc/logrotate.d/elitedevs
```

Add configuration:
```
/var/log/elitedevs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### Error Tracking

#### Sentry Integration
```bash
npm install @sentry/node
```

Add to `server.js`:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

#### New Relic
```bash
npm install newrelic
```

Create `newrelic.js`:
```javascript
'use strict'

exports.config = {
  app_name: ['EliteDevs Backend'],
  license_key: 'your-license-key',
  logging: {
    level: 'info'
  }
}
```

## ⚡ Performance Optimization

### Frontend Optimization

#### Image Optimization
```bash
# Install image optimization tools
npm install -g imagemin-cli

# Optimize images
imagemin frontend/assets/images/* --out-dir=frontend/assets/images/optimized
```

#### Code Minification
```bash
# Install minification tools
npm install -g uglify-js clean-css-cli

# Minify JavaScript
uglifyjs frontend/assets/js/script.js -o frontend/assets/js/script.min.js

# Minify CSS
cleancss -o frontend/assets/css/styles.min.css frontend/assets/css/styles.css
```

#### Caching Strategy
Add to HTML files:
```html
<!-- Cache static assets -->
<link rel="stylesheet" href="assets/css/styles.min.css?v=1.0.0">
<script src="assets/js/script.min.js?v=1.0.0"></script>
```

### Backend Optimization

#### Database Indexing
```javascript
// Add indexes to models
const contactSchema = new mongoose.Schema({
  // ... schema definition
});

contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
```

#### Caching with Redis
```bash
# Install Redis
sudo apt install redis-server

# Install Redis client
npm install redis
```

Add caching middleware:
```javascript
const redis = require('redis');
const client = redis.createClient();

const cache = (duration) => {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    client.get(key, (err, data) => {
      if (data) {
        return res.json(JSON.parse(data));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    });
  };
};
```

#### Compression
```javascript
const compression = require('compression');
app.use(compression());
```

## 🔒 Security Checklist

### Environment Security
- [ ] Use strong, unique passwords
- [ ] Store secrets in environment variables
- [ ] Never commit `.env` files
- [ ] Use different databases for dev/prod

### Application Security
- [ ] Enable HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use security headers (Helmet.js)
- [ ] Implement CORS properly

### Database Security
- [ ] Use strong database passwords
- [ ] Restrict database access by IP
- [ ] Enable database authentication
- [ ] Regular database backups
- [ ] Monitor database access

### Server Security
- [ ] Keep system updated
- [ ] Configure firewall
- [ ] Use SSH keys instead of passwords
- [ ] Disable root login
- [ ] Regular security updates

### Monitoring Security
- [ ] Monitor application logs
- [ ] Set up alerts for errors
- [ ] Monitor resource usage
- [ ] Track failed login attempts
- [ ] Monitor API usage

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Test all functionality locally
- [ ] Update environment variables
- [ ] Optimize images and assets
- [ ] Minify CSS and JavaScript
- [ ] Update version numbers
- [ ] Check for security vulnerabilities

### Deployment
- [ ] Deploy backend first
- [ ] Test backend endpoints
- [ ] Deploy frontend
- [ ] Test frontend functionality
- [ ] Configure domain and SSL
- [ ] Set up monitoring

### Post-Deployment
- [ ] Test all forms and features
- [ ] Verify email notifications
- [ ] Check analytics tracking
- [ ] Monitor error logs
- [ ] Test on different devices
- [ ] Verify SEO meta tags

## 📞 Support

For deployment issues:

- **Email**: contact.us@elitedevs.work
- **Phone**: +91 (878) 088-1010
- **Documentation**: Check the main README.md

---

**Last updated**: January 2024
**Version**: 2.0.0
