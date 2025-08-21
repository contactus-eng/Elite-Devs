const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    detailedDescription: {
        type: String,
        required: [true, 'Detailed description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'web-development',
            'mobile-development',
            'ai-ml',
            'cloud-solutions',
            'ui-ux-design',
            'e-commerce',
            'saas',
            'other'
        ]
    },
    client: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Client name cannot exceed 100 characters']
        },
        industry: {
            type: String,
            trim: true
        },
        testimonial: {
            type: String,
            trim: true,
            maxlength: [500, 'Testimonial cannot exceed 500 characters']
        }
    },
    technologies: [{
        type: String,
        trim: true
    }],
    features: [{
        type: String,
        trim: true,
        maxlength: [200, 'Feature description cannot exceed 200 characters']
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            trim: true
        },
        caption: {
            type: String,
            trim: true
        }
    }],
    featuredImage: {
        type: String,
        required: [true, 'Featured image is required']
    },
    projectUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Project URL must be a valid URL']
    },
    githubUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'GitHub URL must be a valid URL']
    },
    duration: {
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        duration: {
            type: String,
            trim: true
        }
    },
    team: [{
        name: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            trim: true
        },
        avatar: {
            type: String
        }
    }],
    challenges: [{
        type: String,
        trim: true,
        maxlength: [300, 'Challenge description cannot exceed 300 characters']
    }],
    solutions: [{
        type: String,
        trim: true,
        maxlength: [300, 'Solution description cannot exceed 300 characters']
    }],
    results: {
        type: String,
        trim: true
    },
    metrics: {
        performance: {
            type: String,
            trim: true
        },
        userEngagement: {
            type: String,
            trim: true
        },
        conversionRate: {
            type: String,
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    seo: {
        metaTitle: {
            type: String,
            trim: true,
            maxlength: [60, 'Meta title cannot exceed 60 characters']
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: [160, 'Meta description cannot exceed 160 characters']
        },
        keywords: [{
            type: String,
            trim: true
        }]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
portfolioSchema.index({ slug: 1 });
portfolioSchema.index({ status: 1, publishedAt: -1 });
portfolioSchema.index({ category: 1, publishedAt: -1 });
portfolioSchema.index({ featured: 1, publishedAt: -1 });
portfolioSchema.index({ 'client.name': 1 });

// Virtual for formatted category
portfolioSchema.virtual('categoryFormatted').get(function() {
    const categoryMap = {
        'web-development': 'Web Development',
        'mobile-development': 'Mobile Development',
        'ai-ml': 'AI & Machine Learning',
        'cloud-solutions': 'Cloud Solutions',
        'ui-ux-design': 'UI/UX Design',
        'e-commerce': 'E-Commerce',
        'saas': 'SaaS',
        'other': 'Other'
    };
    return categoryMap[this.category] || this.category;
});

// Virtual for project duration
portfolioSchema.virtual('durationFormatted').get(function() {
    if (this.duration.duration) {
        return this.duration.duration;
    }
    if (this.duration.startDate && this.duration.endDate) {
        const start = new Date(this.duration.startDate);
        const end = new Date(this.duration.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return `${months} months`;
    }
    return 'N/A';
});

// Virtual for URL
portfolioSchema.virtual('url').get(function() {
    return `/portfolio/${this.slug}`;
});

// Pre-save middleware to generate slug if not provided
portfolioSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    // Set publishedAt if status is published and publishedAt is not set
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    next();
});

// Method to increment views
portfolioSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to increment likes
portfolioSchema.methods.incrementLikes = function() {
    this.likes += 1;
    return this.save();
};

// Static method to get published projects
portfolioSchema.statics.getPublished = function() {
    return this.find({ 
        status: 'published',
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1 });
};

// Static method to get featured projects
portfolioSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ 
        status: 'published',
        featured: true,
        publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to get projects by category
portfolioSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ 
        status: 'published',
        category: category,
        publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Ensure virtuals are included in JSON output
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
