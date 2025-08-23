const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        required: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false // System roles cannot be deleted
    }
}, {
    timestamps: true
});

// Available permissions
roleSchema.statics.PERMISSIONS = {
    // User Management
    'users.view': 'View Users',
    'users.create': 'Create Users',
    'users.edit': 'Edit Users',
    'users.delete': 'Delete Users',
    
    // Role Management
    'roles.view': 'View Roles',
    'roles.create': 'Create Roles',
    'roles.edit': 'Edit Roles',
    'roles.delete': 'Delete Roles',
    
    // Agent Management
    'agents.view': 'View Agents',
    'agents.create': 'Create Agents',
    'agents.edit': 'Edit Agents',
    'agents.delete': 'Delete Agents',
    
    // Developer Management
    'developers.view': 'View Developers',
    'developers.create': 'Create Developers',
    'developers.edit': 'Edit Developers',
    'developers.delete': 'Delete Developers',
    
    // Property Management
    'properties.view': 'View Properties',
    'properties.create': 'Create Properties',
    'properties.edit': 'Edit Properties',
    'properties.delete': 'Delete Properties',
    
    // System Administration
    'system.admin': 'System Administration',
    'system.settings': 'System Settings',
    'system.logs': 'View System Logs'
};

// Method to check if role has permission
roleSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to add permission
roleSchema.methods.addPermission = function(permission) {
    if (!this.permissions.includes(permission)) {
        this.permissions.push(permission);
    }
};

// Method to remove permission
roleSchema.methods.removePermission = function(permission) {
    this.permissions = this.permissions.filter(p => p !== permission);
};

module.exports = mongoose.model('Role', roleSchema);