const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Role = require('../models/Role');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(auth);

// ============ ROLE MANAGEMENT ============

// @route   GET /api/admin/roles
// @desc    Get all roles
// @access  Private (roles.view permission)
router.get('/roles', checkPermission('roles.view'), async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: roles,
            count: roles.length
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching roles' 
        });
    }
});

// @route   POST /api/admin/roles
// @desc    Create a new role
// @access  Private (roles.create permission)
router.post('/roles', [
    checkPermission('roles.create'),
    body('name').notEmpty().withMessage('Role name is required'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('permissions').isArray().withMessage('Permissions must be an array')
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

        const { name, displayName, description, permissions } = req.body;

        // Check if role already exists
        const existingRole = await Role.findOne({ name: name.toUpperCase() });
        if (existingRole) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role with this name already exists' 
            });
        }

        // Validate permissions
        const validPermissions = Object.keys(Role.schema.statics.PERMISSIONS);
        const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
        if (invalidPermissions.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid permissions: ${invalidPermissions.join(', ')}` 
            });
        }

        const role = new Role({
            name: name.toUpperCase(),
            displayName,
            description,
            permissions
        });

        await role.save();

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });

    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating role' 
        });
    }
});

// @route   PUT /api/admin/roles/:id
// @desc    Update a role
// @access  Private (roles.edit permission)
router.put('/roles/:id', [
    checkPermission('roles.edit'),
    body('displayName').optional().notEmpty().withMessage('Display name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('permissions').optional().isArray().withMessage('Permissions must be an array')
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

        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        // Prevent editing system roles
        if (role.isSystem) {
            return res.status(403).json({ 
                success: false, 
                message: 'System roles cannot be modified' 
            });
        }

        const { displayName, description, permissions, isActive } = req.body;

        // Validate permissions if provided
        if (permissions) {
            const validPermissions = Object.keys(Role.schema.statics.PERMISSIONS);
            const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
            if (invalidPermissions.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid permissions: ${invalidPermissions.join(', ')}` 
                });
            }
        }

        // Update fields
        if (displayName !== undefined) role.displayName = displayName;
        if (description !== undefined) role.description = description;
        if (permissions !== undefined) role.permissions = permissions;
        if (isActive !== undefined) role.isActive = isActive;

        await role.save();

        res.json({
            success: true,
            message: 'Role updated successfully',
            data: role
        });

    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating role' 
        });
    }
});

// @route   DELETE /api/admin/roles/:id
// @desc    Delete a role
// @access  Private (roles.delete permission)
router.delete('/roles/:id', checkPermission('roles.delete'), async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        // Prevent deleting system roles
        if (role.isSystem) {
            return res.status(403).json({ 
                success: false, 
                message: 'System roles cannot be deleted' 
            });
        }

        // Check if role is being used by any users
        const usersWithRole = await User.countDocuments({ role: role._id });
        if (usersWithRole > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete role. ${usersWithRole} user(s) are assigned to this role.` 
            });
        }

        await Role.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Role deleted successfully'
        });

    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting role' 
        });
    }
});

// @route   GET /api/admin/permissions
// @desc    Get all available permissions
// @access  Private (roles.view permission)
router.get('/permissions', checkPermission('roles.view'), (req, res) => {
    try {
        const permissions = Role.schema.statics.PERMISSIONS;
        const formattedPermissions = Object.entries(permissions).map(([key, description]) => ({
            key,
            description,
            category: key.split('.')[0]
        }));

        // Group by category
        const groupedPermissions = formattedPermissions.reduce((acc, perm) => {
            if (!acc[perm.category]) {
                acc[perm.category] = [];
            }
            acc[perm.category].push(perm);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                all: formattedPermissions,
                grouped: groupedPermissions
            }
        });
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching permissions' 
        });
    }
});

// ============ STAFF MANAGEMENT ============

// @route   GET /api/admin/staff
// @desc    Get all staff members
// @access  Private (users.view permission)
router.get('/staff', checkPermission('users.view'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role, isActive } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.role = role;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const users = await User.find(query)
            .populate('role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching staff' 
        });
    }
});

// @route   GET /api/admin/staff/:id
// @desc    Get staff member by ID
// @access  Private (users.view permission)
router.get('/staff/:id', checkPermission('users.view'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff member not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get staff member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching staff member' 
        });
    }
});

// @route   PUT /api/admin/staff/:id
// @desc    Update staff member
// @access  Private (users.edit permission)
router.put('/staff/:id', [
    checkPermission('users.edit'),
    body('email').optional().isEmail().withMessage('Please provide a valid email')
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

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff member not found' 
            });
        }

        const { firstName, lastName, email, role, phone, department, isActive } = req.body;

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

        // Verify role exists if provided
        if (role) {
            const userRole = await Role.findById(role);
            if (!userRole) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid role specified' 
                });
            }
        }

        // Update fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        await user.populate('role');

        res.json({
            success: true,
            message: 'Staff member updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating staff member' 
        });
    }
});

// @route   DELETE /api/admin/staff/:id
// @desc    Delete staff member
// @access  Private (users.delete permission)
router.delete('/staff/:id', checkPermission('users.delete'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff member not found' 
            });
        }

        // Prevent users from deleting themselves
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot delete your own account' 
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });

    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting staff member' 
        });
    }
});

module.exports = router;