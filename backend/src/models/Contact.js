const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    service: {
        type: String,
        required: [true, 'Service selection is required'],
        enum: [
            'web-development',
            'mobile-development',
            'ai-ml',
            'cloud-solutions',
            'ui-ux-design',
            'consulting',
            'other'
        ]
    },
    budget: {
        type: String,
        required: [true, 'Budget selection is required'],
        enum: [
            'under-10k',
            '10k-25k',
            '25k-50k',
            '50k-100k',
            'over-100k',
            'discuss'
        ]
    },
    timeline: {
        type: String,
        required: [true, 'Timeline selection is required'],
        enum: [
            'asap',
            '1-2-months',
            '3-6-months',
            '6-months-plus',
            'flexible'
        ]
    },
    message: {
        type: String,
        required: [true, 'Project details are required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'in-progress', 'completed', 'archived'],
        default: 'new'
    },
    source: {
        type: String,
        default: 'website'
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ service: 1, createdAt: -1 });

// Virtual for formatted budget
contactSchema.virtual('budgetFormatted').get(function() {
    const budgetMap = {
        'under-10k': 'Under $10,000',
        '10k-25k': '$10,000 - $25,000',
        '25k-50k': '$25,000 - $50,000',
        '50k-100k': '$50,000 - $100,000',
        'over-100k': 'Over $100,000',
        'discuss': "Let's Discuss"
    };
    return budgetMap[this.budget] || this.budget;
});

// Virtual for formatted timeline
contactSchema.virtual('timelineFormatted').get(function() {
    const timelineMap = {
        'asap': 'ASAP',
        '1-2-months': '1-2 Months',
        '3-6-months': '3-6 Months',
        '6-months-plus': '6+ Months',
        'flexible': 'Flexible'
    };
    return timelineMap[this.timeline] || this.timeline;
});

// Virtual for formatted service
contactSchema.virtual('serviceFormatted').get(function() {
    const serviceMap = {
        'web-development': 'Web Development',
        'mobile-development': 'Mobile App Development',
        'ai-ml': 'AI & Machine Learning',
        'cloud-solutions': 'Cloud Solutions',
        'ui-ux-design': 'UI/UX Design',
        'consulting': 'Technical Consulting',
        'other': 'Other'
    };
    return serviceMap[this.service] || this.service;
});

// Ensure virtuals are included in JSON output
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);
