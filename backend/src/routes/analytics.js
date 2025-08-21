const express = require('express');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Get overall analytics statistics
router.get('/overview', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const stats = await Analytics.getOverallStats(startDate, endDate);

        res.json({
            success: true,
            data: stats[0] || {
                totalPageviews: 0,
                totalContactForms: 0,
                totalNewsletterSignups: 0,
                uniqueVisitors: 0,
                uniqueSessions: 0
            }
        });

    } catch (error) {
        console.error('Get analytics overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics overview'
        });
    }
});

// Get daily statistics
router.get('/daily', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const stats = await Analytics.getDailyStats(startDate, endDate);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get daily analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch daily analytics'
        });
    }
});

// Get popular pages
router.get('/popular-pages', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const limit = parseInt(req.query.limit) || 10;

        const pages = await Analytics.getPopularPages(startDate, endDate, limit);

        res.json({
            success: true,
            data: pages
        });

    } catch (error) {
        console.error('Get popular pages error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch popular pages'
        });
    }
});

// Get device statistics
router.get('/devices', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const devices = await Analytics.getDeviceStats(startDate, endDate);

        res.json({
            success: true,
            data: devices
        });

    } catch (error) {
        console.error('Get device analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch device analytics'
        });
    }
});

// Get geographic statistics
router.get('/geographic', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const locations = await Analytics.getGeographicStats(startDate, endDate);

        res.json({
            success: true,
            data: locations
        });

    } catch (error) {
        console.error('Get geographic analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch geographic analytics'
        });
    }
});

// Get contact form submissions analytics
router.get('/contact-forms', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const submissions = await Analytics.getContactSubmissions(startDate, endDate);

        res.json({
            success: true,
            data: submissions
        });

    } catch (error) {
        console.error('Get contact forms analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact forms analytics'
        });
    }
});

// Get newsletter signups analytics
router.get('/newsletter-signups', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const signups = await Analytics.getNewsletterSignups(startDate, endDate);

        res.json({
            success: true,
            data: signups
        });

    } catch (error) {
        console.error('Get newsletter signups analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch newsletter signups analytics'
        });
    }
});

// Track custom event
router.post('/track', async (req, res) => {
    try {
        const { type, page, title, metadata } = req.body;

        if (!type || !page) {
            return res.status(400).json({
                success: false,
                error: 'Type and page are required'
            });
        }

        // Get client information
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const referrer = req.get('Referrer');

        // Create analytics record
        const analyticsData = {
            type,
            page,
            title: title || page,
            referrer,
            userAgent,
            ipAddress,
            metadata: metadata || {},
            timestamp: new Date()
        };

        await Analytics.create(analyticsData);

        res.status(201).json({
            success: true,
            message: 'Analytics event tracked successfully'
        });

    } catch (error) {
        console.error('Track analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track analytics event'
        });
    }
});

// Get analytics by type
router.get('/by-type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const events = await Analytics.find({
            type,
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        const total = await Analytics.countDocuments({
            type,
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        });

        res.json({
            success: true,
            data: events,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get analytics by type error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics by type'
        });
    }
});

// Get real-time analytics (last 24 hours)
router.get('/realtime', async (req, res) => {
    try {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const realtimeStats = await Analytics.aggregate([
            {
                $match: {
                    timestamp: { $gte: last24Hours }
                }
            },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$timestamp' },
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.hour',
                    types: {
                        $push: {
                            type: '$_id.type',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: 'Last 24 hours',
                stats: realtimeStats
            }
        });

    } catch (error) {
        console.error('Get realtime analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch realtime analytics'
        });
    }
});

module.exports = router;
