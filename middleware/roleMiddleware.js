function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role_name)) {
            return res.status(403).json({ message: 'Access denied for this role'})
        }
        next();
    };
}

module.exports = authorizeRoles;