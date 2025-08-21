const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt is required'],
        trim: true,
        maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    author: {
        name: {
            type: String,
            required: [true, 'Author name is required'],
            trim: true
        },
        avatar: {
            type: String,
            default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [200, 'Author bio cannot exceed 200 characters']
        }
    },
    featuredImage: {
        type: String,
        required: [true, 'Featured image is required']
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
            'technology',
            'business',
            'tutorials',
            'case-studies'
        ]
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },
    readTime: {
        type: Number,
        min: [1, 'Read time must be at least 1 minute'],
        default: 5
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
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
    },
    socialShare: {
        facebook: {
            type: Number,
            default: 0
        },
        twitter: {
            type: Number,
            default: 0
        },
        linkedin: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, publishedAt: -1 });
blogSchema.index({ featured: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'author.name': 1 });

// Virtual for formatted category
blogSchema.virtual('categoryFormatted').get(function() {
    const categoryMap = {
        'web-development': 'Web Development',
        'mobile-development': 'Mobile Development',
        'ai-ml': 'AI & Machine Learning',
        'cloud-solutions': 'Cloud Solutions',
        'ui-ux-design': 'UI/UX Design',
        'technology': 'Technology',
        'business': 'Business',
        'tutorials': 'Tutorials',
        'case-studies': 'Case Studies'
    };
    return categoryMap[this.category] || this.category;
});

// Virtual for reading time
blogSchema.virtual('readTimeFormatted').get(function() {
    return `${this.readTime} min read`;
});

// Virtual for URL
blogSchema.virtual('url').get(function() {
    return `/blog/${this.slug}`;
});

// Pre-save middleware to generate slug if not provided
blogSchema.pre('save', function(next) {
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
blogSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to increment likes
blogSchema.methods.incrementLikes = function() {
    this.likes += 1;
    return this.save();
};

// Static method to get published posts
blogSchema.statics.getPublished = function() {
    return this.find({ 
        status: 'published',
        publishedAt: { $lte: new Date() }
    }).sort({ publishedAt: -1 });
};

// Static method to get featured posts
blogSchema.statics.getFeatured = function(limit = 3) {
    return this.find({ 
        status: 'published',
        featured: true,
        publishedAt: { $lte: new Date() }
    })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Ensure virtuals are included in JSON output
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
