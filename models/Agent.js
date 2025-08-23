const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    specializations: [{
        type: String,
        enum: ['Residential', 'Commercial', 'Industrial', 'Luxury', 'Investment', 'Development']
    }],
    bio: {
        type: String,
        maxlength: 1000
    },
    avatar: {
        type: String,
        default: null
    },
    experience: {
        type: Number,
        min: 0,
        default: 0 // years of experience
    },
    languages: [{
        type: String,
        default: ['English']
    }],
    socialMedia: {
        facebook: { type: String, default: null },
        linkedin: { type: String, default: null },
        instagram: { type: String, default: null },
        twitter: { type: String, default: null }
    },
    address: {
        street: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        zipCode: { type: String, default: null },
        country: { type: String, default: 'Philippines' }
    },
    achievements: [{
        title: String,
        description: String,
        date: Date
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    commission: {
        rate: { type: Number, min: 0, max: 100, default: 3 }, // percentage
        totalEarned: { type: Number, default: 0 }
    },
    stats: {
        propertiesSold: { type: Number, default: 0 },
        totalSalesValue: { type: Number, default: 0 },
        clientsServed: { type: Number, default: 0 },
        averageRating: { type: Number, min: 0, max: 5, default: 0 }
    }
}, {
    timestamps: true
});

// Virtual for full name
agentSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for display title
agentSchema.virtual('title').get(function() {
    return 'Property Investment Consultant';
});

// Method to calculate success rate
agentSchema.methods.getSuccessRate = function() {
    // This would be calculated based on leads converted to sales
    // For now, return a placeholder
    return Math.min(95, this.stats.propertiesSold * 2);
};

// Method to get experience level
agentSchema.methods.getExperienceLevel = function() {
    if (this.experience < 1) return 'New';
    if (this.experience < 3) return 'Junior';
    if (this.experience < 7) return 'Senior';
    return 'Expert';
};

// Ensure virtual fields are serialized
agentSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Agent', agentSchema);