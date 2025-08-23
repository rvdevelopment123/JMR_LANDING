const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 3000
    },
    propertyId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Developer',
        required: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        default: null
    },
    type: {
        type: String,
        required: true,
        enum: ['Condominium', 'House and Lot', 'Townhouse', 'Commercial', 'Industrial', 'Lot Only', 'Apartment']
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Reserved', 'Sold', 'Under Construction', 'Pre-Selling', 'Ready for Occupancy'],
        default: 'Available'
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'Philippines' },
        coordinates: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null }
        },
        landmarks: [String],
        accessibility: {
            nearMRT: { type: Boolean, default: false },
            nearBus: { type: Boolean, default: false },
            nearMall: { type: Boolean, default: false },
            nearSchool: { type: Boolean, default: false },
            nearHospital: { type: Boolean, default: false }
        }
    },
    pricing: {
        basePrice: { type: Number, required: true },
        pricePerSqm: { type: Number, default: null },
        currency: { type: String, default: 'PHP' },
        paymentTerms: [{
            name: String,
            description: String,
            downPayment: Number,
            monthlyPayment: Number,
            terms: Number // months
        }],
        discounts: [{
            name: String,
            description: String,
            percentage: Number,
            validUntil: Date
        }]
    },
    specifications: {
        floorArea: { type: Number, required: true }, // sqm
        lotArea: { type: Number, default: null }, // sqm
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        parking: { type: Number, default: 0 },
        floors: { type: Number, default: 1 },
        yearBuilt: { type: Number, default: null },
        furnishing: {
            type: String,
            enum: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'],
            default: 'Unfurnished'
        }
    },
    features: {
        indoor: [String], // e.g., ['Balcony', 'Walk-in Closet', 'Maid\'s Room']
        outdoor: [String], // e.g., ['Garden', 'Garage', 'Swimming Pool']
        amenities: [String], // e.g., ['Gym', 'Clubhouse', 'Security']
        utilities: [String] // e.g., ['Water', 'Electricity', 'Internet Ready']
    },
    images: {
        main: { type: String, required: true },
        gallery: [String],
        floorPlan: [String],
        siteMap: { type: String, default: null }
    },
    documents: [{
        name: String,
        type: String, // 'PDF', 'Image', etc.
        url: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        slug: { type: String, unique: true }
    },
    stats: {
        views: { type: Number, default: 0 },
        inquiries: { type: Number, default: 0 },
        favorites: { type: Number, default: 0 },
        lastViewed: { type: Date, default: null }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    listingDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Generate slug from title
propertySchema.pre('save', function(next) {
    if (this.isModified('title') && !this.seo.slug) {
        this.seo.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + this.propertyId.toLowerCase();
    }
    next();
});

// Method to get formatted price
propertySchema.methods.getFormattedPrice = function() {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: this.pricing.currency
    }).format(this.pricing.basePrice);
};

// Method to get full address
propertySchema.methods.getFullAddress = function() {
    const loc = this.location;
    return `${loc.address}, ${loc.city}, ${loc.state} ${loc.zipCode}`;
};

// Method to calculate price per sqm
propertySchema.methods.getPricePerSqm = function() {
    if (this.specifications.floorArea > 0) {
        return Math.round(this.pricing.basePrice / this.specifications.floorArea);
    }
    return 0;
};

// Virtual for property age
propertySchema.virtual('age').get(function() {
    if (this.specifications.yearBuilt) {
        return new Date().getFullYear() - this.specifications.yearBuilt;
    }
    return null;
});

// Ensure virtual fields are serialized
propertySchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Property', propertySchema);