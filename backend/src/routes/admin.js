const express = require('express');
const Contact = require('../models/Contact');
const Blog = require('../models/Blog');
const Portfolio = require('../models/Portfolio');
const Newsletter = require('../models/Newsletter');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Dashboard overview
router.get('/dashboard', async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get counts for different periods
        const [
            totalContacts,
            recentContacts,
            totalBlogPosts,
            publishedBlogPosts,
            totalPortfolioProjects,
            publishedPortfolioProjects,
            totalSubscribers,
            activeSubscribers,
            recentAnalytics
        ] = await Promise.all([
            Contact.countDocuments(),
            Contact.countDocuments({ createdAt: { $gte: last7Days } }),
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            Portfolio.countDocuments(),
            Portfolio.countDocuments({ status: 'published' }),
            Newsletter.countDocuments(),
            Newsletter.countDocuments({ status: 'subscribed' }),
            Analytics.countDocuments({ timestamp: { $gte: last7Days } })
        ]);

        // Get recent activity
        const recentActivity = await Promise.all([
            Contact.find().sort({ createdAt: -1 }).limit(5).select('name email service status createdAt'),
            Blog.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
            Portfolio.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt'),
            Newsletter.find().sort({ subscribedAt: -1 }).limit(5).select('email fullName status subscribedAt')
        ]);

        const dashboardData = {
            overview: {
                contacts: {
                    total: totalContacts,
                    recent: recentContacts
                },
                blog: {
                    total: totalBlogPosts,
                    published: publishedBlogPosts
                },
                portfolio: {
                    total: totalPortfolioProjects,
                    published: publishedPortfolioProjects
                },
                newsletter: {
                    total: totalSubscribers,
                    active: activeSubscribers
                },
                analytics: {
                    recentEvents: recentAnalytics
                }
            },
            recentActivity: {
                contacts: recentActivity[0],
                blog: recentActivity[1],
                portfolio: recentActivity[2],
                newsletter: recentActivity[3]
            }
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});

// Get contact form statistics
router.get('/contacts/stats', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const stats = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    byStatus: {
                        $push: {
                            status: '$status',
                            createdAt: '$createdAt'
                        }
                    },
                    byService: {
                        $push: {
                            service: '$service',
                            createdAt: '$createdAt'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                data: {
                    total: 0,
                    byStatus: {},
                    byService: {},
                    period: { startDate, endDate }
                }
            });
        }

        const stat = stats[0];
        
        // Group by status
        const byStatus = {};
        stat.byStatus.forEach(item => {
            byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        });

        // Group by service
        const byService = {};
        stat.byService.forEach(item => {
            byService[item.service] = (byService[item.service] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                total: stat.total,
                byStatus,
                byService,
                period: { startDate, endDate }
            }
        });

    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact statistics'
        });
    }
});

// Get blog statistics
router.get('/blog/stats', async (req, res) => {
    try {
        const stats = await Blog.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draft: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    byCategory: {
                        $push: {
                            category: '$category',
                            status: '$status',
                            views: '$views',
                            likes: '$likes'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                data: {
                    total: 0,
                    published: 0,
                    draft: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    byCategory: {}
                }
            });
        }

        const stat = stats[0];
        
        // Group by category
        const byCategory = {};
        stat.byCategory.forEach(item => {
            if (!byCategory[item.category]) {
                byCategory[item.category] = {
                    total: 0,
                    published: 0,
                    draft: 0,
                    views: 0,
                    likes: 0
                };
            }
            byCategory[item.category].total += 1;
            if (item.status === 'published') {
                byCategory[item.category].published += 1;
            } else if (item.status === 'draft') {
                byCategory[item.category].draft += 1;
            }
            byCategory[item.category].views += item.views;
            byCategory[item.category].likes += item.likes;
        });

        res.json({
            success: true,
            data: {
                total: stat.total,
                published: stat.published,
                draft: stat.draft,
                totalViews: stat.totalViews,
                totalLikes: stat.totalLikes,
                byCategory
            }
        });

    } catch (error) {
        console.error('Get blog stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blog statistics'
        });
    }
});

// Get portfolio statistics
router.get('/portfolio/stats', async (req, res) => {
    try {
        const stats = await Portfolio.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draft: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    byCategory: {
                        $push: {
                            category: '$category',
                            status: '$status',
                            views: '$views',
                            likes: '$likes'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                data: {
                    total: 0,
                    published: 0,
                    draft: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    byCategory: {}
                }
            });
        }

        const stat = stats[0];
        
        // Group by category
        const byCategory = {};
        stat.byCategory.forEach(item => {
            if (!byCategory[item.category]) {
                byCategory[item.category] = {
                    total: 0,
                    published: 0,
                    draft: 0,
                    views: 0,
                    likes: 0
                };
            }
            byCategory[item.category].total += 1;
            if (item.status === 'published') {
                byCategory[item.category].published += 1;
            } else if (item.status === 'draft') {
                byCategory[item.category].draft += 1;
            }
            byCategory[item.category].views += item.views;
            byCategory[item.category].likes += item.likes;
        });

        res.json({
            success: true,
            data: {
                total: stat.total,
                published: stat.published,
                draft: stat.draft,
                totalViews: stat.totalViews,
                totalLikes: stat.totalLikes,
                byCategory
            }
        });

    } catch (error) {
        console.error('Get portfolio stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio statistics'
        });
    }
});

// Get newsletter statistics
router.get('/newsletter/stats', async (req, res) => {
    try {
        const stats = await Newsletter.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get newsletter stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch newsletter statistics'
        });
    }
});

// Get analytics overview
router.get('/analytics/overview', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const [
            overallStats,
            popularPages,
            deviceStats,
            geographicStats
        ] = await Promise.all([
            Analytics.getOverallStats(startDate, endDate),
            Analytics.getPopularPages(startDate, endDate, 10),
            Analytics.getDeviceStats(startDate, endDate),
            Analytics.getGeographicStats(startDate, endDate)
        ]);

        res.json({
            success: true,
            data: {
                overall: overallStats[0] || {
                    totalPageviews: 0,
                    totalContactForms: 0,
                    totalNewsletterSignups: 0,
                    uniqueVisitors: 0,
                    uniqueSessions: 0
                },
                popularPages,
                devices: deviceStats,
                geographic: geographicStats,
                period: { startDate, endDate }
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

// Bulk operations
router.post('/bulk/contacts/status', async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || !status) {
            return res.status(400).json({
                success: false,
                error: 'IDs array and status are required'
            });
        }

        const result = await Contact.updateMany(
            { _id: { $in: ids } },
            { status }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} contacts`,
            data: { modifiedCount: result.modifiedCount }
        });

    } catch (error) {
        console.error('Bulk update contacts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update contacts'
        });
    }
});

router.post('/bulk/blog/status', async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || !status) {
            return res.status(400).json({
                success: false,
                error: 'IDs array and status are required'
            });
        }

        const result = await Blog.updateMany(
            { _id: { $in: ids } },
            { status }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} blog posts`,
            data: { modifiedCount: result.modifiedCount }
        });

    } catch (error) {
        console.error('Bulk update blog posts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update blog posts'
        });
    }
});

router.post('/bulk/portfolio/status', async (req, res) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || !status) {
            return res.status(400).json({
                success: false,
                error: 'IDs array and status are required'
            });
        }

        const result = await Portfolio.updateMany(
            { _id: { $in: ids } },
            { status }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} portfolio projects`,
            data: { modifiedCount: result.modifiedCount }
        });

    } catch (error) {
        console.error('Bulk update portfolio projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update portfolio projects'
        });
    }
});

// Export data
router.get('/export/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        const csvData = contacts.map(contact => ({
            Name: contact.name,
            Email: contact.email,
            Phone: contact.phone || '',
            Company: contact.company || '',
            Service: contact.serviceFormatted,
            Budget: contact.budgetFormatted,
            Timeline: contact.timelineFormatted,
            Message: contact.message,
            Status: contact.status,
            'Submitted At': contact.createdAt.toISOString()
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
        
        // Convert to CSV
        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n');

        res.send(csv);

    } catch (error) {
        console.error('Export contacts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export contacts'
        });
    }
});

router.get('/export/newsletter', async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });

        const csvData = subscribers.map(sub => ({
            Email: sub.email,
            'First Name': sub.firstName || '',
            'Last Name': sub.lastName || '',
            Status: sub.status,
            Source: sub.source,
            'Subscribed At': sub.subscribedAt.toISOString(),
            'Email Count': sub.emailCount,
            'Open Count': sub.openCount,
            'Click Count': sub.clickCount
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
        
        // Convert to CSV
        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
        ].join('\n');

        res.send(csv);

    } catch (error) {
        console.error('Export newsletter error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export newsletter subscribers'
        });
    }
});

module.exports = router;
