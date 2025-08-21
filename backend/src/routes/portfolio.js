const express = require('express');
const Portfolio = require('../models/Portfolio');
const { trackPortfolioView, addStartTime } = require('../middleware/analytics');

const router = express.Router();

// Get all published portfolio projects
router.get('/', addStartTime, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const category = req.query.category;
        const featured = req.query.featured === 'true';

        // Build query
        const query = { status: 'published' };
        if (category) query.category = category;
        if (featured) query.featured = true;

        // Execute query
        const projects = await Portfolio.find(query)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-detailedDescription -challenges -solutions -results -metrics');

        const total = await Portfolio.countDocuments(query);

        res.json({
            success: true,
            data: projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get portfolio projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio projects'
        });
    }
});

// Get featured portfolio projects
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const projects = await Portfolio.getFeatured(limit);

        res.json({
            success: true,
            data: projects
        });

    } catch (error) {
        console.error('Get featured projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured projects'
        });
    }
});

// Get portfolio project by slug
router.get('/:slug', addStartTime, trackPortfolioView, async (req, res) => {
    try {
        const project = await Portfolio.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio project not found'
            });
        }

        // Increment view count
        await project.incrementViews();

        res.json({
            success: true,
            data: project
        });

    } catch (error) {
        console.error('Get portfolio project error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio project'
        });
    }
});

// Get portfolio categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Portfolio.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category' } },
            { $sort: { _id: 1 } }
        ]);

        const categoryList = categories.map(cat => ({
            value: cat._id,
            label: cat._id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));

        res.json({
            success: true,
            data: categoryList
        });

    } catch (error) {
        console.error('Get portfolio categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio categories'
        });
    }
});

// Get projects by category
router.get('/category/:category', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const category = req.params.category;

        const projects = await Portfolio.getByCategory(category, limit);
        const total = await Portfolio.countDocuments({ 
            category, 
            status: 'published' 
        });

        res.json({
            success: true,
            data: projects,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get projects by category error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch projects by category'
        });
    }
});

// Like a portfolio project
router.post('/:slug/like', async (req, res) => {
    try {
        const project = await Portfolio.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio project not found'
            });
        }

        await project.incrementLikes();

        res.json({
            success: true,
            message: 'Project liked successfully',
            data: { likes: project.likes + 1 }
        });

    } catch (error) {
        console.error('Like project error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like project'
        });
    }
});

// Get related projects
router.get('/:slug/related', async (req, res) => {
    try {
        const project = await Portfolio.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio project not found'
            });
        }

        const relatedProjects = await Portfolio.find({
            _id: { $ne: project._id },
            status: 'published',
            $or: [
                { category: project.category },
                { 'client.industry': project.client.industry }
            ]
        })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('-detailedDescription -challenges -solutions -results -metrics');

        res.json({
            success: true,
            data: relatedProjects
        });

    } catch (error) {
        console.error('Get related projects error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch related projects'
        });
    }
});

// Admin routes (protected)
// Create new portfolio project
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            detailedDescription,
            category,
            client,
            technologies,
            features,
            images,
            featuredImage,
            projectUrl,
            githubUrl,
            duration,
            team,
            challenges,
            solutions,
            results,
            metrics,
            status,
            featured,
            seo
        } = req.body;

        const project = new Portfolio({
            title,
            description,
            detailedDescription,
            category,
            client,
            technologies: technologies || [],
            features: features || [],
            images: images || [],
            featuredImage,
            projectUrl,
            githubUrl,
            duration,
            team: team || [],
            challenges: challenges || [],
            solutions: solutions || [],
            results,
            metrics,
            status: status || 'draft',
            featured: featured || false,
            seo
        });

        await project.save();

        res.status(201).json({
            success: true,
            message: 'Portfolio project created successfully',
            data: project
        });

    } catch (error) {
        console.error('Create portfolio project error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create portfolio project'
        });
    }
});

// Update portfolio project
router.put('/:id', async (req, res) => {
    try {
        const project = await Portfolio.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio project not found'
            });
        }

        res.json({
            success: true,
            message: 'Portfolio project updated successfully',
            data: project
        });

    } catch (error) {
        console.error('Update portfolio project error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update portfolio project'
        });
    }
});

// Delete portfolio project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Portfolio.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio project not found'
            });
        }

        res.json({
            success: true,
            message: 'Portfolio project deleted successfully'
        });

    } catch (error) {
        console.error('Delete portfolio project error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete portfolio project'
        });
    }
});

// Get portfolio statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await Portfolio.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    byCategory: {
                        $push: {
                            category: '$category',
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
                    count: 0,
                    views: 0,
                    likes: 0
                };
            }
            byCategory[item.category].count += 1;
            byCategory[item.category].views += item.views;
            byCategory[item.category].likes += item.likes;
        });

        res.json({
            success: true,
            data: {
                total: stat.total,
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

module.exports = router;
