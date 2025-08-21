const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');
const { trackContactForm, addStartTime } = require('../middleware/analytics');

const router = express.Router();

// Validation rules
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    body('service')
        .isIn([
            'web-development',
            'mobile-development',
            'ai-ml',
            'cloud-solutions',
            'ui-ux-design',
            'consulting',
            'other'
        ])
        .withMessage('Please select a valid service'),
    body('budget')
        .isIn([
            'under-10k',
            '10k-25k',
            '25k-50k',
            '50k-100k',
            'over-100k',
            'discuss'
        ])
        .withMessage('Please select a valid budget range'),
    body('timeline')
        .isIn([
            'asap',
            '1-2-months',
            '3-6-months',
            '6-months-plus',
            'flexible'
        ])
        .withMessage('Please select a valid timeline'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
];

// Submit contact form
router.post('/submit', 
    addStartTime,
    contactValidation,
    trackContactForm,
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            // Extract form data
            const {
                name,
                email,
                phone,
                company,
                service,
                budget,
                timeline,
                message
            } = req.body;

            // Get client information
            const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const userAgent = req.get('User-Agent');

            // Create contact record
            const contact = new Contact({
                name,
                email,
                phone,
                company,
                service,
                budget,
                timeline,
                message,
                ipAddress,
                userAgent,
                source: 'website'
            });

            await contact.save();

            // Send notification email to admin
            try {
                await emailService.sendContactNotification(contact);
                contact.emailSent = true;
                contact.emailSentAt = new Date();
                await contact.save();
            } catch (emailError) {
                console.error('Failed to send admin notification:', emailError);
                // Don't fail the request if email fails
            }

            // Send confirmation email to user
            try {
                await emailService.sendContactConfirmation(contact);
            } catch (emailError) {
                console.error('Failed to send user confirmation:', emailError);
                // Don't fail the request if email fails
            }

            res.status(201).json({
                success: true,
                message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
                data: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    service: contact.serviceFormatted,
                    submittedAt: contact.createdAt
                }
            });

        } catch (error) {
            console.error('Contact form submission error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit contact form. Please try again later.'
            });
        }
    }
);

// Get contact submissions (admin only)
router.get('/submissions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const service = req.query.service;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (service) query.service = service;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Execute query
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-__v');

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get contact submissions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact submissions'
        });
    }
});

// Get contact submission by ID (admin only)
router.get('/submissions/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contact submission'
        });
    }
});

// Update contact submission status (admin only)
router.patch('/submissions/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!status || !['new', 'contacted', 'in-progress', 'completed', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                ...(notes && { notes })
            },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update contact status'
        });
    }
});

// Get contact statistics (admin only)
router.get('/stats', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
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

module.exports = router;
