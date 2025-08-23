const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const router = express.Router();

// Apply authentication middleware to all agent routes
router.use(auth);

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private (agents.view permission)
router.get('/', checkPermission('agents.view'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, specialization, isActive } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (specialization) {
            query.specializations = { $in: [specialization] };
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const agents = await Agent.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Agent.countDocuments(query);

        res.json({
            success: true,
            data: agents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching agents' 
        });
    }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Private (agents.view permission)
router.get('/:id', checkPermission('agents.view'), async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ 
                success: false, 
                message: 'Agent not found' 
            });
        }

        res.json({
            success: true,
            data: agent
        });

    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching agent' 
        });
    }
});

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private (agents.create permission)
router.post('/', [
    checkPermission('agents.create'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('licenseNumber').notEmpty().withMessage('License number is required')
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

        const { email, licenseNumber } = req.body;

        // Check if agent already exists
        const existingAgent = await Agent.findOne({ 
            $or: [{ email }, { licenseNumber }] 
        });
        
        if (existingAgent) {
            return res.status(400).json({ 
                success: false, 
                message: 'Agent with this email or license number already exists' 
            });
        }

        const agent = new Agent(req.body);
        await agent.save();

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: agent
        });

    } catch (error) {
        console.error('Create agent error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while creating agent' 
        });
    }
});

// @route   PUT /api/agents/:id
// @desc    Update an agent
// @access  Private (agents.edit permission)
router.put('/:id', [
    checkPermission('agents.edit'),
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

        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ 
                success: false, 
                message: 'Agent not found' 
            });
        }

        const { email, licenseNumber } = req.body;

        // Check for duplicate email or license number
        if (email || licenseNumber) {
            const duplicateQuery = { _id: { $ne: agent._id } };
            if (email) duplicateQuery.email = email;
            if (licenseNumber) duplicateQuery.licenseNumber = licenseNumber;
            
            const existingAgent = await Agent.findOne(duplicateQuery);
            if (existingAgent) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Another agent with this email or license number already exists' 
                });
            }
        }

        // Update agent
        Object.assign(agent, req.body);
        await agent.save();

        res.json({
            success: true,
            message: 'Agent updated successfully',
            data: agent
        });

    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating agent' 
        });
    }
});

// @route   DELETE /api/agents/:id
// @desc    Delete an agent
// @access  Private (agents.delete permission)
router.delete('/:id', checkPermission('agents.delete'), async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ 
                success: false, 
                message: 'Agent not found' 
            });
        }

        await Agent.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Agent deleted successfully'
        });

    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting agent' 
        });
    }
});

// @route   GET /api/agents/public/list
// @desc    Get public list of agents (for frontend display)
// @access  Public
router.get('/public/list', async (req, res) => {
    try {
        const agents = await Agent.find({ isActive: true })
            .select('firstName lastName email phone specializations bio avatar experience languages stats')
            .sort({ 'stats.propertiesSold': -1 })
            .limit(20);

        res.json({
            success: true,
            data: agents
        });

    } catch (error) {
        console.error('Get public agents error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching agents' 
        });
    }
});

module.exports = router;