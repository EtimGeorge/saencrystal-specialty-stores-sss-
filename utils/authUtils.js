// utils/authUtils.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is loaded from .env, provide a default only for non-production safety
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'fallback-secret-key-do-not-use-in-prod') {
    console.warn("WARNING: JWT_SECRET is using a fallback value in production! Set a strong secret in .env");
}
const SALT_ROUNDS = 10; // bcrypt salt rounds

async function hashPassword(password) {
    if (!password || typeof password !== 'string' || password.length === 0) { // Added type check
        throw new Error("Password cannot be empty or invalid for hashing.");
    }
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
        // console.warn("Attempted to compare empty plainPassword or hashedPassword.");
        return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
    // Ensure user object and necessary properties exist
    if (!user || !user.user_id || !user.email || !user.role) {
        console.error("Invalid user object for token generation:", user);
        throw new Error("Cannot generate token without user_id, email, and role.");
    }
    const payload = {
        userId: user.user_id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Example: token expires in 1 day
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Unauthorized: Token expired.'});
            }
            // For other errors like JsonWebTokenError (malformed token)
            return res.status(403).json({ error: 'Forbidden: Invalid or malformed token.' });
        }
        req.user = userPayload;
        next();
    });
}

function authorizeRole(roleOrRoles) {
    return (req, res, next) => {
        const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
        // Ensure req.user is set by authenticateToken middleware before this one
        if (!req.user || !req.user.role) {
            console.warn("authorizeRole middleware called without req.user or req.user.role being set. Ensure authenticateToken runs first.");
            return res.status(403).json({ error: 'Forbidden: User role not available for authorization.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions for this action.' });
        }
        next();
    };
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    authenticateToken,
    authorizeRole,
    JWT_SECRET
};
