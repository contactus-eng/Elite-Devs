const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    status: {
        type: String,
        enum: ['subscribed', 'unsubscribed', 'pending'],
        default: 'subscribed'
    },
    source: {
        type: String,
        default: 'website',
        enum: ['website', 'blog', 'contact-form', 'admin']
    },
    preferences: {
        blogUpdates: {
            type: Boolean,
            default: true
        },
        projectUpdates: {
            type: Boolean,
            default: true
        },
        industryNews: {
            type: Boolean,
            default: true
        },
        promotional: {
            type: Boolean,
            default: false
        }
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date
    },
    lastEmailSent: {
        type: Date
    },
    emailCount: {
        type: Number,
        default: 0
    },
    openCount: {
        type: Number,
        default: 0
    },
    clickCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Indexes for better query performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1, subscribedAt: -1 });
newsletterSchema.index({ source: 1 });
newsletterSchema.index({ tags: 1 });

// Virtual for full name
newsletterSchema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || '';
});

// Virtual for subscription duration
newsletterSchema.virtual('subscriptionDuration').get(function() {
    const now = new Date();
    const subscribed = new Date(this.subscribedAt);
    const diffTime = Math.abs(now - subscribed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for engagement rate
newsletterSchema.virtual('engagementRate').get(function() {
    if (this.emailCount === 0) return 0;
    return ((this.openCount + this.clickCount) / (this.emailCount * 2)) * 100;
});

// Pre-save middleware
newsletterSchema.pre('save', function(next) {
    // If status is being changed to unsubscribed, set unsubscribedAt
    if (this.isModified('status') && this.status === 'unsubscribed' && !this.unsubscribedAt) {
        this.unsubscribedAt = new Date();
    }
    
    // If status is being changed to subscribed, clear unsubscribedAt
    if (this.isModified('status') && this.status === 'subscribed') {
        this.unsubscribedAt = undefined;
    }
    
    next();
});

// Method to increment email count
newsletterSchema.methods.incrementEmailCount = function() {
    this.emailCount += 1;
    this.lastEmailSent = new Date();
    return this.save();
};

// Method to increment open count
newsletterSchema.methods.incrementOpenCount = function() {
    this.openCount += 1;
    return this.save();
};

// Method to increment click count
newsletterSchema.methods.incrementClickCount = function() {
    this.clickCount += 1;
    return this.save();
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
    this.status = 'unsubscribed';
    this.unsubscribedAt = new Date();
    return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
    this.status = 'subscribed';
    this.unsubscribedAt = undefined;
    return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function() {
    return this.find({ status: 'subscribed' }).sort({ subscribedAt: -1 });
};

// Static method to get subscribers by preference
newsletterSchema.statics.getSubscribersByPreference = function(preference) {
    return this.find({ 
        status: 'subscribed',
        [`preferences.${preference}`]: true 
    }).sort({ subscribedAt: -1 });
};

// Static method to get subscribers by tag
newsletterSchema.statics.getSubscribersByTag = function(tag) {
    return this.find({ 
        status: 'subscribed',
        tags: tag 
    }).sort({ subscribedAt: -1 });
};

// Static method to get subscription statistics
newsletterSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                subscribed: {
                    $sum: { $cond: [{ $eq: ['$status', 'subscribed'] }, 1, 0] }
                },
                unsubscribed: {
                    $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
                },
                pending: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                totalEmails: { $sum: '$emailCount' },
                totalOpens: { $sum: '$openCount' },
                totalClicks: { $sum: '$clickCount' }
            }
        }
    ]);
    
    return stats[0] || {
        total: 0,
        subscribed: 0,
        unsubscribed: 0,
        pending: 0,
        totalEmails: 0,
        totalOpens: 0,
        totalClicks: 0
    };
};

// Ensure virtuals are included in JSON output
newsletterSchema.set('toJSON', { virtuals: true });
newsletterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
