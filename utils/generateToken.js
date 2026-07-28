const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign (
        {
            user_id: user.id,
            role_name: user.role_name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN}
);
}

module.exports = generateToken;