const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { trackBlogView, addStartTime } = require('../middleware/analytics');

const router = express.Router();

// Get all published blog posts
router.get('/', addStartTime, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const tag = req.query.tag;
        const search = req.query.search;

        // Build query
        const query = { status: 'published' };
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query
        const posts = await Blog.find(query)
            .sort({ publishedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-content');

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get blog posts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blog posts'
        });
    }
});

// Get featured blog posts
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const posts = await Blog.getFeatured(limit);

        res.json({
            success: true,
            data: posts
        });

    } catch (error) {
        console.error('Get featured posts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured posts'
        });
    }
});

// Get blog post by slug
router.get('/:slug', addStartTime, trackBlogView, async (req, res) => {
    try {
        const post = await Blog.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        // Increment view count
        await post.incrementViews();

        res.json({
            success: true,
            data: post
        });

    } catch (error) {
        console.error('Get blog post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blog post'
        });
    }
});

// Get blog categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Blog.aggregate([
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
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

// Get blog tags
router.get('/tags/list', async (req, res) => {
    try {
        const tags = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags' } },
            { $sort: { _id: 1 } }
        ]);

        const tagList = tags.map(tag => ({
            value: tag._id,
            label: tag._id.charAt(0).toUpperCase() + tag._id.slice(1)
        }));

        res.json({
            success: true,
            data: tagList
        });

    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tags'
        });
    }
});

// Like a blog post
router.post('/:slug/like', async (req, res) => {
    try {
        const post = await Blog.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        await post.incrementLikes();

        res.json({
            success: true,
            message: 'Post liked successfully',
            data: { likes: post.likes + 1 }
        });

    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like post'
        });
    }
});

// Get related posts
router.get('/:slug/related', async (req, res) => {
    try {
        const post = await Blog.findOne({ 
            slug: req.params.slug,
            status: 'published'
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        const relatedPosts = await Blog.find({
            _id: { $ne: post._id },
            status: 'published',
            $or: [
                { category: post.category },
                { tags: { $in: post.tags } }
            ]
        })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('-content');

        res.json({
            success: true,
            data: relatedPosts
        });

    } catch (error) {
        console.error('Get related posts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch related posts'
        });
    }
});

// Admin routes (protected)
// Create new blog post
router.post('/', async (req, res) => {
    try {
        const {
            title,
            excerpt,
            content,
            author,
            featuredImage,
            category,
            tags,
            status,
            seo
        } = req.body;

        const post = new Blog({
            title,
            excerpt,
            content,
            author,
            featuredImage,
            category,
            tags: tags || [],
            status: status || 'draft',
            seo
        });

        await post.save();

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: post
        });

    } catch (error) {
        console.error('Create blog post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create blog post'
        });
    }
});

// Update blog post
router.put('/:id', async (req, res) => {
    try {
        const post = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: post
        });

    } catch (error) {
        console.error('Update blog post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update blog post'
        });
    }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Blog.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });

    } catch (error) {
        console.error('Delete blog post error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete blog post'
        });
    }
});

module.exports = router;
