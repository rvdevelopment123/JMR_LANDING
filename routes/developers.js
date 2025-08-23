const express = require('express');
const { body, validationResult } = require('express-validator');
const Developer = require('../models/Developer');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const router = express.Router();

// Apply authentication middleware to all developer routes
router.use(auth);

// @route   GET /api/developers
// @desc    Get all developers
// @access  Private (developers.view permission)
router.get('/', checkPermission('developers.view'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, specialization, isActive, isVerified } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'contactPerson.name': { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'businessInfo.registrationNumber': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (specialization) {
            query.specializations = { $in: [specialization] };
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (isVerified !== undefined) {
            query.isVerified = isVerified === 'true';
        }

        const developers = await Developer.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Developer.countDocuments(query);

        res.json({
            success: true,
            data: developers,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get developers error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching developers' 
        });
    }
});

// @route   GET /api/developers/:id
// @desc    Get developer by ID
// @access  Private (developers.view permission)
router.get('/:id', checkPermission('developers.view'), async (req, res) => {
    try {
        const developer = await Developer.findById(req.params.id);
        if (!developer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Developer not found' 
            });
        }

        res.json({
            success: true,
            data: developer
        });

    } catch (error) {
        console.error('Get developer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching developer' 
        });
    }
});

// @route   POST /api/developers
// @desc    Create a new developer
// @access  Private (developers.create permission)
router.post('/', [
    checkPermission('developers.create'),
    body('name').notEmpty().withMessage('Developer name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zipCode').notEmpty().withMessage('Zip code is required'),
    body('contactPerson.name').notEmpty().withMessage('Contact person name is required'),
    body('contactPerson.position').notEmpty().withMessage('Contact person position is required'),
    body('contactPerson.email').isEmail().withMessage('Contact person email must be valid'),
    body('contactPerson.phone').notEmpty().withMessage('Contact person phone is required'),
    body('businessInfo.registrationNumber').notEmpty().withMessage('Registration number is required'),
    body('businessInfo.taxId').notEmpty().withMessage('Tax ID is required'),
    body('businessInfo.licenseNumber').notEmpty().withMessage('License number is required'),
    body('businessInfo.establishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid established year is required')
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

        const { name, email, businessInfo } = req.body;

        // Check if developer already exists
        const existingDeveloper = await Developer.findOne({ 
            $or: [
                { name },
                { email },
                { 'businessInfo.registrationNumber': businessInfo.registrationNumber },
                { 'businessInfo.taxId': businessInfo.taxId },
                { 'businessInfo.licenseNumber': businessInfo.licenseNumber }
            ]
        });
        
        if (existingDeveloper) {
            return res.status(400).json({ 
                success: false, 
                message: 'Developer with this name, email, or business registration already exists' 
            });
        }

        const developer = new Developer(req.body);
        await developer.save();

        res.status(201).json({
            success: true,
            message: 'Developer created successfully',
            data: developer
        });

    } catch (error) {
        console.error('Create developer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating developer' 
        });
    }
});

// @route   PUT /api/developers/:id
// @desc    Update a developer
// @access  Private (developers.edit permission)
router.put('/:id', [
    checkPermission('developers.edit'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('contactPerson.email').optional().isEmail().withMessage('Contact person email must be valid'),
    body('businessInfo.establishedYear').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid established year is required')
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

        const developer = await Developer.findById(req.params.id);
        if (!developer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Developer not found' 
            });
        }

        const { name, email, businessInfo } = req.body;

        // Check for duplicates
        if (name || email || businessInfo) {
            const duplicateQuery = { _id: { $ne: developer._id } };
            const orConditions = [];
            
            if (name) orConditions.push({ name });
            if (email) orConditions.push({ email });
            if (businessInfo?.registrationNumber) orConditions.push({ 'businessInfo.registrationNumber': businessInfo.registrationNumber });
            if (businessInfo?.taxId) orConditions.push({ 'businessInfo.taxId': businessInfo.taxId });
            if (businessInfo?.licenseNumber) orConditions.push({ 'businessInfo.licenseNumber': businessInfo.licenseNumber });
            
            if (orConditions.length > 0) {
                duplicateQuery.$or = orConditions;
                const existingDeveloper = await Developer.findOne(duplicateQuery);
                if (existingDeveloper) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Another developer with this name, email, or business registration already exists' 
                    });
                }
            }
        }

        // Update developer
        Object.assign(developer, req.body);
        await developer.save();

        res.json({
            success: true,
            message: 'Developer updated successfully',
            data: developer
        });

    } catch (error) {
        console.error('Update developer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating developer' 
        });
    }
});

// @route   DELETE /api/developers/:id
// @desc    Delete a developer
// @access  Private (developers.delete permission)
router.delete('/:id', checkPermission('developers.delete'), async (req, res) => {
    try {
        const developer = await Developer.findById(req.params.id);
        if (!developer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Developer not found' 
            });
        }

        // Check if developer has associated properties
        const Property = require('../models/Property');
        const propertiesCount = await Property.countDocuments({ developer: developer._id });
        
        if (propertiesCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete developer. ${propertiesCount} properties are associated with this developer.` 
            });
        }

        await Developer.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Developer deleted successfully'
        });

    } catch (error) {
        console.error('Delete developer error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting developer' 
        });
    }
});

// @route   GET /api/developers/public/list
// @desc    Get public list of developers (for frontend display)
// @access  Public
router.get('/public/list', async (req, res) => {
    try {
        const developers = await Developer.find({ isActive: true, isVerified: true })
            .select('name description logo website specializations stats portfolio awards')
            .sort({ 'stats.totalProjects': -1 })
            .limit(20);

        res.json({
            success: true,
            data: developers
        });

    } catch (error) {
        console.error('Get public developers error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching developers' 
        });
    }
});

module.exports = router;