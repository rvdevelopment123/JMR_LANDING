const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated (should be set by auth middleware)
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required' 
                });
            }

            // Check if user has the required permission
            if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access denied. Required permission: ${requiredPermission}` 
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error in permission check' 
            });
        }
    };
};

// Check multiple permissions (user must have ALL)
const checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required' 
                });
            }

            const userPermissions = req.user.permissions || [];
            const hasAllPermissions = requiredPermissions.every(permission => 
                userPermissions.includes(permission)
            );

            if (!hasAllPermissions) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access denied. Required permissions: ${requiredPermissions.join(', ')}` 
                });
            }

            next();
        } catch (error) {
            console.error('Multiple permissions check error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error in permission check' 
            });
        }
    };
};

// Check if user has ANY of the specified permissions
const checkAnyPermission = (permissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Authentication required' 
                });
            }

            const userPermissions = req.user.permissions || [];
            const hasAnyPermission = permissions.some(permission => 
                userPermissions.includes(permission)
            );

            if (!hasAnyPermission) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access denied. Required any of: ${permissions.join(', ')}` 
                });
            }

            next();
        } catch (error) {
            console.error('Any permission check error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server error in permission check' 
            });
        }
    };
};

// Check if user has admin role
const checkAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error in admin check' 
        });
    }
};

module.exports = {
    checkPermission,
    checkPermissions,
    checkAnyPermission,
    checkAdmin
};