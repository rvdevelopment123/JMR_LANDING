const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const router = express.Router();

// Apply authentication middleware to all staff routes
router.use(auth);

// @route   GET /api/staff/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('role');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching profile' 
        });
    }
});

// @route   PUT /api/staff/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation errors', 
                errors: errors.array() 
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const { firstName, lastName, email, phone, avatar } = req.body;

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email is already taken by another user' 
                });
            }
        }

        // Update allowed fields only
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        await user.populate('role');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating profile' 
        });
    }
});

// @route   PUT /api/staff/change-password
// @desc    Change current user's password
// @access  Private
router.put('/change-password', [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match');
        }
        return true;
    })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation errors', 
                errors: errors.array() 
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while changing password' 
        });
    }
});

// @route   GET /api/staff/dashboard
// @desc    Get dashboard data for current user
// @access  Private
router.get('/dashboard', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('role');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Get basic stats based on user permissions
        const dashboardData = {
            user: {
                name: user.fullName,
                role: user.role.displayName,
                lastLogin: user.lastLogin,
                avatar: user.avatar
            },
            permissions: user.role.permissions,
            stats: {}
        };

        // Add stats based on permissions
        if (user.role.permissions.includes('users.view')) {
            const totalUsers = await User.countDocuments({ isActive: true });
            dashboardData.stats.totalUsers = totalUsers;
        }

        if (user.role.permissions.includes('agents.view')) {
            const Agent = require('../models/Agent');
            const totalAgents = await Agent.countDocuments({ isActive: true });
            dashboardData.stats.totalAgents = totalAgents;
        }

        if (user.role.permissions.includes('developers.view')) {
            const Developer = require('../models/Developer');
            const totalDevelopers = await Developer.countDocuments({ isActive: true });
            dashboardData.stats.totalDevelopers = totalDevelopers;
        }

        if (user.role.permissions.includes('properties.view')) {
            const Property = require('../models/Property');
            const totalProperties = await Property.countDocuments({ isActive: true });
            const availableProperties = await Property.countDocuments({ isActive: true, status: 'Available' });
            dashboardData.stats.totalProperties = totalProperties;
            dashboardData.stats.availableProperties = availableProperties;
        }

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching dashboard data' 
        });
    }
});

// @route   GET /api/staff/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/notifications', async (req, res) => {
    try {
        // This is a placeholder for future notification system
        const notifications = [
            {
                id: 1,
                type: 'info',
                title: 'Welcome to JMR CMS',
                message: 'Your account has been successfully set up.',
                read: false,
                createdAt: new Date()
            }
        ];

        res.json({
            success: true,
            data: notifications,
            unreadCount: notifications.filter(n => !n.read).length
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching notifications' 
        });
    }
});

// @route   GET /api/staff/activity-log
// @desc    Get activity log for current user
// @access  Private
router.get('/activity-log', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        // This is a placeholder for future activity logging system
        const activities = [
            {
                id: 1,
                action: 'login',
                description: 'User logged in',
                timestamp: new Date(),
                ipAddress: req.ip
            }
        ];

        res.json({
            success: true,
            data: activities,
            pagination: {
                current: parseInt(page),
                pages: 1,
                total: activities.length,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get activity log error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching activity log' 
        });
    }
});

module.exports = router;