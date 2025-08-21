const express = require('express');
const { body, validationResult } = require('express-validator');
const Newsletter = require('../models/Newsletter');
const emailService = require('../services/emailService');
const { trackNewsletterSignup, addStartTime } = require('../middleware/analytics');

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', 
    addStartTime,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email address'),
        body('firstName')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('First name cannot exceed 50 characters'),
        body('lastName')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Last name cannot exceed 50 characters'),
        body('preferences')
            .optional()
            .isObject()
            .withMessage('Preferences must be an object')
    ],
    trackNewsletterSignup,
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

            const { email, firstName, lastName, preferences, source = 'website' } = req.body;

            // Check if already subscribed
            const existingSubscriber = await Newsletter.findOne({ email });
            if (existingSubscriber) {
                if (existingSubscriber.status === 'subscribed') {
                    return res.status(400).json({
                        success: false,
                        error: 'You are already subscribed to our newsletter'
                    });
                } else if (existingSubscriber.status === 'unsubscribed') {
                    // Resubscribe
                    existingSubscriber.status = 'subscribed';
                    existingSubscriber.firstName = firstName || existingSubscriber.firstName;
                    existingSubscriber.lastName = lastName || existingSubscriber.lastName;
                    if (preferences) {
                        existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
                    }
                    existingSubscriber.source = source;
                    existingSubscriber.ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
                    existingSubscriber.userAgent = req.get('User-Agent');
                    
                    await existingSubscriber.save();

                    // Send welcome back email
                    try {
                        await emailService.sendNewsletterConfirmation(existingSubscriber);
                    } catch (emailError) {
                        console.error('Failed to send resubscription email:', emailError);
                    }

                    return res.json({
                        success: true,
                        message: 'Welcome back! You have been resubscribed to our newsletter.',
                        data: {
                            email: existingSubscriber.email,
                            fullName: existingSubscriber.fullName,
                            subscribedAt: existingSubscriber.subscribedAt
                        }
                    });
                }
            }

            // Get client information
            const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const userAgent = req.get('User-Agent');

            // Create new subscriber
            const subscriber = new Newsletter({
                email,
                firstName,
                lastName,
                preferences: preferences || {
                    blogUpdates: true,
                    projectUpdates: true,
                    industryNews: true,
                    promotional: false
                },
                source,
                ipAddress,
                userAgent
            });

            await subscriber.save();

            // Send welcome email
            try {
                await emailService.sendNewsletterConfirmation(subscriber);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail the request if email fails
            }

            res.status(201).json({
                success: true,
                message: 'Successfully subscribed to our newsletter!',
                data: {
                    email: subscriber.email,
                    fullName: subscriber.fullName,
                    subscribedAt: subscriber.subscribedAt
                }
            });

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to subscribe to newsletter. Please try again later.'
            });
        }
    }
);

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const subscriber = await Newsletter.findOne({ email });
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        await subscriber.unsubscribe();

        res.json({
            success: true,
            message: 'You have been successfully unsubscribed from our newsletter.',
            data: {
                email: subscriber.email,
                unsubscribedAt: subscriber.unsubscribedAt
            }
        });

    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unsubscribe. Please try again later.'
        });
    }
});

// Unsubscribe by token (for email links)
router.get('/unsubscribe/:token', async (req, res) => {
    try {
        // In a real implementation, you'd decode the token to get the email
        // For now, we'll use a simple approach
        const email = req.params.token; // This should be base64 encoded email

        const subscriber = await Newsletter.findOne({ email });
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        await subscriber.unsubscribe();

        // Redirect to a thank you page or show success message
        res.json({
            success: true,
            message: 'You have been successfully unsubscribed from our newsletter.'
        });

    } catch (error) {
        console.error('Newsletter unsubscription by token error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unsubscribe. Please try again later.'
        });
    }
});

// Update subscription preferences
router.patch('/preferences', async (req, res) => {
    try {
        const { email, preferences } = req.body;

        if (!email || !preferences) {
            return res.status(400).json({
                success: false,
                error: 'Email and preferences are required'
            });
        }

        const subscriber = await Newsletter.findOne({ email });
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        await subscriber.save();

        res.json({
            success: true,
            message: 'Subscription preferences updated successfully',
            data: {
                email: subscriber.email,
                preferences: subscriber.preferences
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences. Please try again later.'
        });
    }
});

// Admin routes (protected)
// Get all subscribers
router.get('/subscribers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const source = req.query.source;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (source) query.source = source;

        // Execute query
        const subscribers = await Newsletter.find(query)
            .sort({ subscribedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Newsletter.countDocuments(query);

        res.json({
            success: true,
            data: subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscribers'
        });
    }
});

// Get subscriber by ID
router.get('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);
        
        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: subscriber
        });

    } catch (error) {
        console.error('Get subscriber error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscriber'
        });
    }
});

// Update subscriber
router.put('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await Newsletter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscriber updated successfully',
            data: subscriber
        });

    } catch (error) {
        console.error('Update subscriber error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update subscriber'
        });
    }
});

// Delete subscriber
router.delete('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscriber deleted successfully'
        });

    } catch (error) {
        console.error('Delete subscriber error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete subscriber'
        });
    }
});

// Get newsletter statistics
router.get('/stats', async (req, res) => {
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

// Send newsletter to subscribers
router.post('/send', async (req, res) => {
    try {
        const { subject, content, previewText, preferences } = req.body;

        if (!subject || !content) {
            return res.status(400).json({
                success: false,
                error: 'Subject and content are required'
            });
        }

        // Get subscribers based on preferences
        let subscribers;
        if (preferences) {
            subscribers = await Newsletter.getSubscribersByPreference(preferences);
        } else {
            subscribers = await Newsletter.getActiveSubscribers();
        }

        if (subscribers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No subscribers found for the specified criteria'
            });
        }

        // Send newsletter
        await emailService.sendNewsletter(
            { subject, content, previewText },
            subscribers
        );

        // Update email count for all subscribers
        const updatePromises = subscribers.map(subscriber => 
            subscriber.incrementEmailCount()
        );
        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: `Newsletter sent successfully to ${subscribers.length} subscribers`,
            data: {
                sentTo: subscribers.length,
                subject,
                sentAt: new Date()
            }
        });

    } catch (error) {
        console.error('Send newsletter error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send newsletter. Please try again later.'
        });
    }
});

module.exports = router;
