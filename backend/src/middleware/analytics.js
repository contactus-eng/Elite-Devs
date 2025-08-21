const Analytics = require('../models/Analytics');
const UAParser = require('ua-parser-js');

const trackAnalytics = (type, metadata = {}) => {
    return async (req, res, next) => {
        try {
            // Get client information
            const userAgent = req.get('User-Agent');
            const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const referrer = req.get('Referrer');
            
            // Parse user agent
            const parser = new UAParser(userAgent);
            const uaResult = parser.getResult();
            
            // Determine device type
            let deviceType = 'unknown';
            if (uaResult.device.type) {
                deviceType = uaResult.device.type;
            } else if (uaResult.os.name === 'iOS' || uaResult.os.name === 'Android') {
                deviceType = 'mobile';
            } else {
                deviceType = 'desktop';
            }
            
            // Get screen dimensions from query params (if available)
            const screenWidth = parseInt(req.query.sw) || null;
            const screenHeight = parseInt(req.query.sh) || null;
            
            // Create analytics record
            const analyticsData = {
                type,
                page: req.originalUrl,
                title: req.query.title || req.path,
                referrer,
                userAgent,
                ipAddress,
                device: {
                    type: deviceType,
                    browser: uaResult.browser.name,
                    os: uaResult.os.name,
                    screen: {
                        width: screenWidth,
                        height: screenHeight
                    }
                },
                session: {
                    id: req.sessionID || null,
                    startTime: req.session?.startTime || null,
                    duration: req.session?.duration || null
                },
                user: {
                    id: req.user?.id || null,
                    email: req.user?.email || null
                },
                metadata: {
                    ...metadata,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime: Date.now() - req.startTime
                },
                timestamp: new Date()
            };
            
            // Save analytics asynchronously (don't block the response)
            Analytics.create(analyticsData).catch(err => {
                console.error('Analytics tracking error:', err);
            });
            
        } catch (error) {
            console.error('Analytics middleware error:', error);
        }
        
        next();
    };
};

// Middleware to track page views
const trackPageView = trackAnalytics('pageview');

// Middleware to track contact form submissions
const trackContactForm = trackAnalytics('contact_form', { formType: 'contact' });

// Middleware to track newsletter signups
const trackNewsletterSignup = trackAnalytics('newsletter_signup', { formType: 'newsletter' });

// Middleware to track portfolio views
const trackPortfolioView = trackAnalytics('portfolio_view', { contentType: 'portfolio' });

// Middleware to track blog views
const trackBlogView = trackAnalytics('blog_view', { contentType: 'blog' });

// Middleware to track downloads
const trackDownload = trackAnalytics('download');

// Middleware to track clicks
const trackClick = trackAnalytics('click');

// Middleware to track scroll events
const trackScroll = trackAnalytics('scroll');

// Middleware to add start time to request
const addStartTime = (req, res, next) => {
    req.startTime = Date.now();
    next();
};

module.exports = {
    trackAnalytics,
    trackPageView,
    trackContactForm,
    trackNewsletterSignup,
    trackPortfolioView,
    trackBlogView,
    trackDownload,
    trackClick,
    trackScroll,
    addStartTime
};
