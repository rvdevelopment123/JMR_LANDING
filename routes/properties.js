const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const Developer = require('../models/Developer');
const auth = require('../middleware/auth');
const { checkPermission, checkAnyPermission } = require('../middleware/checkPermission');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// @route   GET /api/properties
// @desc    Get all properties with search, filter, and pagination
// @access  Private (Staff)
router.get('/', auth, checkAnyPermission(['view_properties', 'manage_properties']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      location,
      minPrice,
      maxPrice,
      developer,
      agent,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { propertyId: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.province': { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.province': { $regex: location, $options: 'i' } },
        { 'location.address': { $regex: location, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
    }
    if (developer) query.developer = developer;
    if (agent) query.agent = agent;
    if (featured !== undefined) query.featured = featured === 'true';

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const properties = await Property.find(query)
      .populate('developer', 'companyName logo contactInfo')
      .populate('agent', 'firstName lastName email phone avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties',
      error: error.message
    });
  }
});

// @route   GET /api/properties/public
// @desc    Get active properties for public display
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      type,
      location,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for active properties only
    const query = { status: 'active' };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.province': { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (type) query.type = type;
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.province': { $regex: location, $options: 'i' } },
        { 'location.address': { $regex: location, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
    }
    if (featured !== undefined) query.featured = featured === 'true';

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const properties = await Property.find(query)
      .populate('developer', 'companyName logo contactInfo')
      .populate('agent', 'firstName lastName email phone avatar')
      .select('-seo -statistics -documents') // Exclude internal fields
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get public properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Private (Staff)
router.get('/:id', auth, checkAnyPermission(['view_properties', 'manage_properties']), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('developer', 'companyName logo contactInfo businessInfo')
      .populate('agent', 'firstName lastName email phone avatar bio specializations');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// @route   GET /api/properties/public/:id
// @desc    Get active property by ID for public display
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const property = await Property.findOne({ 
      _id: req.params.id, 
      status: 'active' 
    })
      .populate('developer', 'companyName logo contactInfo businessInfo')
      .populate('agent', 'firstName lastName email phone avatar bio specializations')
      .select('-seo -statistics -documents'); // Exclude internal fields

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or not available'
      });
    }

    // Increment view count
    await Property.findByIdAndUpdate(req.params.id, {
      $inc: { 'statistics.views': 1 }
    });

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get public property error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Staff with manage_properties permission)
router.post('/', auth, checkPermission('manage_properties'), upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  try {
    const propertyData = JSON.parse(req.body.propertyData);

    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'status', 'pricing', 'location', 'specifications'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Check if property ID already exists
    if (propertyData.propertyId) {
      const existingProperty = await Property.findOne({ propertyId: propertyData.propertyId });
      if (existingProperty) {
        return res.status(400).json({
          success: false,
          message: 'Property ID already exists'
        });
      }
    }

    // Validate developer and agent exist
    if (propertyData.developer) {
      const developer = await Developer.findById(propertyData.developer);
      if (!developer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid developer ID'
        });
      }
    }

    if (propertyData.agent) {
      const agent = await Agent.findById(propertyData.agent);
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Invalid agent ID'
        });
      }
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.images) {
        propertyData.images = req.files.images.map(file => ({
          url: `/uploads/properties/${file.filename}`,
          alt: file.originalname,
          isPrimary: false
        }));
        // Set first image as primary
        if (propertyData.images.length > 0) {
          propertyData.images[0].isPrimary = true;
        }
      }

      if (req.files.documents) {
        propertyData.documents = req.files.documents.map(file => ({
          name: file.originalname,
          url: `/uploads/properties/${file.filename}`,
          type: path.extname(file.originalname).toLowerCase().substring(1)
        }));
      }
    }

    // Create property
    const property = new Property(propertyData);
    await property.save();

    // Populate references for response
    await property.populate('developer', 'companyName logo contactInfo');
    await property.populate('agent', 'firstName lastName email phone avatar');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating property',
      error: error.message
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Staff with manage_properties permission)
router.put('/:id', auth, checkPermission('manage_properties'), upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const updateData = JSON.parse(req.body.propertyData || '{}');

    // Check if property ID is being changed and if it already exists
    if (updateData.propertyId && updateData.propertyId !== property.propertyId) {
      const existingProperty = await Property.findOne({ propertyId: updateData.propertyId });
      if (existingProperty) {
        return res.status(400).json({
          success: false,
          message: 'Property ID already exists'
        });
      }
    }

    // Validate developer and agent if provided
    if (updateData.developer) {
      const developer = await Developer.findById(updateData.developer);
      if (!developer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid developer ID'
        });
      }
    }

    if (updateData.agent) {
      const agent = await Agent.findById(updateData.agent);
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Invalid agent ID'
        });
      }
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.images) {
        const newImages = req.files.images.map(file => ({
          url: `/uploads/properties/${file.filename}`,
          alt: file.originalname,
          isPrimary: false
        }));
        updateData.images = [...(property.images || []), ...newImages];
      }

      if (req.files.documents) {
        const newDocuments = req.files.documents.map(file => ({
          name: file.originalname,
          url: `/uploads/properties/${file.filename}`,
          type: path.extname(file.originalname).toLowerCase().substring(1)
        }));
        updateData.documents = [...(property.documents || []), ...newDocuments];
      }
    }

    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('developer', 'companyName logo contactInfo')
      .populate('agent', 'firstName lastName email phone avatar');

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating property',
      error: error.message
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Staff with manage_properties permission)
router.delete('/:id', auth, checkPermission('manage_properties'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property',
      error: error.message
    });
  }
});

// @route   POST /api/properties/:id/toggle-featured
// @desc    Toggle property featured status
// @access  Private (Staff with manage_properties permission)
router.post('/:id/toggle-featured', auth, checkPermission('manage_properties'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.featured = !property.featured;
    await property.save();

    res.json({
      success: true,
      message: `Property ${property.featured ? 'featured' : 'unfeatured'} successfully`,
      data: { featured: property.featured }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating property status'
    });
  }
});

// @route   GET /api/properties/stats/overview
// @desc    Get property statistics overview
// @access  Private (Staff with view_properties permission)
router.get('/stats/overview', auth, checkAnyPermission(['view_properties', 'manage_properties']), async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'active' });
    const featuredProperties = await Property.countDocuments({ featured: true });
    const soldProperties = await Property.countDocuments({ status: 'sold' });
    
    // Get properties by type
    const propertiesByType = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt pricing.price')
      .populate('agent', 'firstName lastName');

    res.json({
      success: true,
      data: {
        overview: {
          total: totalProperties,
          active: activeProperties,
          featured: featuredProperties,
          sold: soldProperties
        },
        byType: propertiesByType,
        recent: recentProperties
      }
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property statistics'
    });
  }
});

module.exports = router;