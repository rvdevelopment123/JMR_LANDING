const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    logo: {
        type: String,
        default: null
    },
    website: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'Philippines' }
    },
    contactPerson: {
        name: { type: String, required: true },
        position: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    businessInfo: {
        registrationNumber: { type: String, required: true, unique: true },
        taxId: { type: String, required: true },
        licenseNumber: { type: String, required: true },
        establishedYear: { type: Number, required: true },
        employeeCount: { type: Number, default: 0 }
    },
    specializations: [{
        type: String,
        enum: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Luxury', 'Affordable Housing', 'Condominiums', 'Subdivisions']
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        certificateNumber: String
    }],
    socialMedia: {
        facebook: { type: String, default: null },
        linkedin: { type: String, default: null },
        instagram: { type: String, default: null },
        twitter: { type: String, default: null }
    },
    portfolio: [{
        projectName: String,
        location: String,
        completionYear: Number,
        projectType: String,
        units: Number,
        images: [String],
        description: String
    }],
    awards: [{
        title: String,
        awardedBy: String,
        year: Number,
        description: String
    }],
    financialInfo: {
        creditRating: { type: String, enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D'], default: null },
        bondRating: { type: String, default: null },
        capitalBase: { type: Number, default: 0 }
    },
    stats: {
        totalProjects: { type: Number, default: 0 },
        completedProjects: { type: Number, default: 0 },
        ongoingProjects: { type: Number, default: 0 },
        totalUnits: { type: Number, default: 0 },
        averageRating: { type: Number, min: 0, max: 5, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    partnershipDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to calculate completion rate
developerSchema.methods.getCompletionRate = function() {
    if (this.stats.totalProjects === 0) return 0;
    return Math.round((this.stats.completedProjects / this.stats.totalProjects) * 100);
};

// Method to get experience level
developerSchema.methods.getExperienceLevel = function() {
    const yearsInBusiness = new Date().getFullYear() - this.businessInfo.establishedYear;
    if (yearsInBusiness < 5) return 'Emerging';
    if (yearsInBusiness < 15) return 'Established';
    if (yearsInBusiness < 30) return 'Veteran';
    return 'Legacy';
};

// Method to get full address
developerSchema.methods.getFullAddress = function() {
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
};

module.exports = mongoose.model('Developer', developerSchema);