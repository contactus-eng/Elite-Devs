const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Analytics type is required'],
        enum: ['pageview', 'contact_form', 'newsletter_signup', 'portfolio_view', 'blog_view', 'download', 'click', 'scroll']
    },
    page: {
        type: String,
        required: [true, 'Page URL is required'],
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    referrer: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    device: {
        type: {
            type: String,
            enum: ['desktop', 'tablet', 'mobile', 'unknown']
        },
        browser: {
            type: String,
            trim: true
        },
        os: {
            type: String,
            trim: true
        },
        screen: {
            width: Number,
            height: Number
        }
    },
    location: {
        country: {
            type: String,
            trim: true
        },
        region: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        }
    },
    session: {
        id: {
            type: String,
            trim: true
        },
        startTime: {
            type: Date
        },
        duration: {
            type: Number // in seconds
        }
    },
    user: {
        id: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ page: 1, timestamp: -1 });
analyticsSchema.index({ 'session.id': 1 });
analyticsSchema.index({ 'user.id': 1 });
analyticsSchema.index({ 'device.type': 1 });
analyticsSchema.index({ 'location.country': 1 });
analyticsSchema.index({ timestamp: -1 });

// TTL index to automatically delete old records (keep for 1 year)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Static method to get page views
analyticsSchema.statics.getPageViews = function(startDate, endDate, page = null) {
    const query = {
        type: 'pageview',
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    };
    
    if (page) {
        query.page = page;
    }
    
    return this.find(query).sort({ timestamp: -1 });
};

// Static method to get contact form submissions
analyticsSchema.statics.getContactSubmissions = function(startDate, endDate) {
    return this.find({
        type: 'contact_form',
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: -1 });
};

// Static method to get newsletter signups
analyticsSchema.statics.getNewsletterSignups = function(startDate, endDate) {
    return this.find({
        type: 'newsletter_signup',
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: -1 });
};

// Static method to get popular pages
analyticsSchema.statics.getPopularPages = function(startDate, endDate, limit = 10) {
    return this.aggregate([
        {
            $match: {
                type: 'pageview',
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: '$page',
                title: { $first: '$title' },
                views: { $sum: 1 },
                uniqueVisitors: { $addToSet: '$ipAddress' }
            }
        },
        {
            $project: {
                page: '$_id',
                title: 1,
                views: 1,
                uniqueVisitors: { $size: '$uniqueVisitors' }
            }
        },
        {
            $sort: { views: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

// Static method to get device statistics
analyticsSchema.statics.getDeviceStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                type: 'pageview',
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: '$device.type',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Static method to get geographic statistics
analyticsSchema.statics.getGeographicStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                type: 'pageview',
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                },
                'location.country': { $exists: true, $ne: null }
            }
        },
        {
            $group: {
                _id: '$location.country',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

// Static method to get daily statistics
analyticsSchema.statics.getDailyStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$timestamp'
                    }
                },
                pageviews: {
                    $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
                },
                contactForms: {
                    $sum: { $cond: [{ $eq: ['$type', 'contact_form'] }, 1, 0] }
                },
                newsletterSignups: {
                    $sum: { $cond: [{ $eq: ['$type', 'newsletter_signup'] }, 1, 0] }
                },
                uniqueVisitors: { $addToSet: '$ipAddress' }
            }
        },
        {
            $project: {
                date: '$_id',
                pageviews: 1,
                contactForms: 1,
                newsletterSignups: 1,
                uniqueVisitors: { $size: '$uniqueVisitors' }
            }
        },
        {
            $sort: { date: 1 }
        }
    ]);
};

// Static method to get overall statistics
analyticsSchema.statics.getOverallStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalPageviews: {
                    $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
                },
                totalContactForms: {
                    $sum: { $cond: [{ $eq: ['$type', 'contact_form'] }, 1, 0] }
                },
                totalNewsletterSignups: {
                    $sum: { $cond: [{ $eq: ['$type', 'newsletter_signup'] }, 1, 0] }
                },
                uniqueVisitors: { $addToSet: '$ipAddress' },
                uniqueSessions: { $addToSet: '$session.id' }
            }
        },
        {
            $project: {
                totalPageviews: 1,
                totalContactForms: 1,
                totalNewsletterSignups: 1,
                uniqueVisitors: { $size: '$uniqueVisitors' },
                uniqueSessions: { $size: '$uniqueSessions' }
            }
        }
    ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);
