# Render Deployment Guide for EliteDevs Backend

## Prerequisites
- GitHub repository with your code
- MongoDB Atlas database (free tier available)
- Gmail account for email service
- Render account (free tier available)

## Step 1: Prepare Your MongoDB Database

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier)

2. **Set Up Database**
   - Create a database named `elitedevs`
   - Create collections: `contacts`, `newsletters`, `blogs`, `portfolios`, `analytics`
   - Get your connection string from Atlas dashboard

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended for first deployment)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `elitedevs-backend`
     - **Environment**: `Node`
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**
   In Render dashboard, go to Environment → Environment Variables and add:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI_PROD=your-mongodb-atlas-connection-string
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=contact.us@elitedevs.work
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   JWT_EXPIRE=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   GOOGLE_ANALYTICS_ID=your-ga-id
   ```

### Option B: Using render.yaml (Advanced)

1. **Update render.yaml**
   - Replace `your-render-app-name` with your actual app name
   - Update environment variables in the file

2. **Deploy via CLI**
   ```bash
   # Install Render CLI
   npm install -g @render/cli
   
   # Login to Render
   render login
   
   # Deploy
   render deploy
   ```

## Step 3: Update Frontend Configuration

1. **Update API URL**
   - Replace `your-render-app-name` in `frontend/assets/js/api.js` with your actual Render app name
   - Your Render URL will be: `https://your-app-name.onrender.com`

2. **Update CORS Settings**
   - In your backend `server.js`, update the CORS origin to include your Netlify domain:
   ```javascript
   origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-netlify-app.netlify.app', 'https://elitedevs.work']
       : ['http://localhost:8000', 'http://127.0.0.1:8000'],
   ```

## Step 4: Test Your Deployment

1. **Health Check**
   - Visit: `https://your-app-name.onrender.com/api/health`
   - Should return: `{"status":"success","message":"EliteDevs API is running"}`

2. **Test API Endpoints**
   - Contact form: `POST /api/contact/submit`
   - Newsletter: `POST /api/newsletter/subscribe`
   - Analytics: `POST /api/analytics/track`

## Step 5: Set Up Custom Domain (Optional)

1. **Add Custom Domain in Render**
   - Go to your service settings
   - Add custom domain: `api.elitedevs.work`
   - Update DNS records as instructed

2. **Update Frontend Configuration**
   - Change API URL back to: `https://api.elitedevs.work/api`

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI_PROD` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/elitedevs` |
| `EMAIL_USER` | Your Gmail address | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password (not regular password) | `abcd efgh ijkl mnop` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-super-secret-jwt-key-change-this-in-production` |
| `GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID | `G-XXXXXXXXXX` |

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check if all dependencies are in `package.json`
   - Ensure `package-lock.json` is committed
   - Verify Node.js version compatibility

2. **Database Connection Fails**
   - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
   - Verify connection string format
   - Ensure database user has correct permissions

3. **Email Not Working**
   - Enable 2-factor authentication on Gmail
   - Generate app password (not regular password)
   - Check Gmail settings for less secure apps

4. **CORS Errors**
   - Update CORS origin in `server.js`
   - Ensure frontend URL is included in allowed origins

### Useful Commands:

```bash
# Check Render logs
# Go to your service dashboard → Logs

# Test locally with production env
NODE_ENV=production npm start

# Check MongoDB connection
# Test your connection string in MongoDB Compass
```

## Monitoring and Maintenance

1. **Set Up Alerts**
   - Configure uptime monitoring
   - Set up error notifications

2. **Regular Maintenance**
   - Monitor logs for errors
   - Check database performance
   - Update dependencies regularly

3. **Backup Strategy**
   - MongoDB Atlas provides automatic backups
   - Consider additional backup solutions

## Cost Optimization

- **Free Tier Limits**: 750 hours/month
- **Auto-sleep**: Service sleeps after 15 minutes of inactivity
- **Upgrade**: $7/month for always-on service

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] Environment variables are not exposed in logs
- [ ] File upload size limits are set
- [ ] Input validation is implemented

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain
3. Set up CI/CD pipeline
4. Implement backup strategies
5. Add performance monitoring
