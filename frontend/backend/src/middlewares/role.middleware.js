const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Handle case where allowedRoles is passed as an array
        let rolesToCheck = [];
        if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
            rolesToCheck = allowedRoles[0];
        } else {
            rolesToCheck = allowedRoles;
        }
        
        if (!req.user || !rolesToCheck.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden: insufficient permissions'
            });
        }
        next();
    };
};

module.exports = requireRole;
