// routes/a_auth.js
const express = require('express');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils'); // Correct path

module.exports = function(pool) {
    const router = express.Router();

    // POST /api/v1/auth/register
    router.post('/register', async (req, res, next) => {
        const { email, password, firstName, lastName, phoneNumber } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        // Basic password strength check
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }
        // Basic email format check (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        try {
            const hashedPassword = await hashPassword(password);

            const result = await pool.query(
                `INSERT INTO Users (email, password_hash, first_name, last_name, phone_number, role, is_active, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING user_id, email, first_name, last_name, role, is_active`, // Added is_active
                [email.toLowerCase(), hashedPassword, firstName, lastName, phoneNumber, 'customer'] // Default role and is_active
            );

            const newUser = result.rows[0];
            const tokenPayload = {
                user_id: newUser.user_id,
                email: newUser.email,
                role: newUser.role
            };
            const token = generateToken(tokenPayload);

            res.status(201).json({
                data: {
                    userId: newUser.user_id,
                    email: newUser.email,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name, // Added lastName
                    role: newUser.role,
                    isActive: newUser.is_active
                },
                token: token,
                message: 'User registered successfully.'
            });

        } catch (err) {
            if (err.code === '23505') { // Unique constraint violation
                if (err.constraint && err.constraint.includes('users_email_key')) {
                     return res.status(409).json({ error: 'Email address already in use.' });
                }
                if (err.constraint && err.constraint.includes('users_phone_number_key')) { // Assuming unique constraint on phone
                    return res.status(409).json({ error: 'Phone number already in use.' });
                }
                console.error("Registration unique constraint error:", err.detail);
                return res.status(409).json({ error: 'A user with some of the provided details already exists.' });
            }
            console.error("Registration error:", err.message, err.stack);
            next(err);
        }
    });

    // POST /api/v1/auth/login
    router.post('/login', async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        try {
            const result = await pool.query(
                'SELECT user_id, email, password_hash, first_name, last_name, role, is_active FROM Users WHERE email = $1',
                [email.toLowerCase()]
             );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password.' }); // User not found
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
            }

            const passwordMatch = await comparePassword(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid email or password.' }); // Password incorrect
            }

            const tokenPayload = {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            };
            const token = generateToken(tokenPayload);

            // Update last_login_at
            await pool.query('UPDATE Users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);

            res.json({
                data: {
                    userId: user.user_id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name, // Added lastName
                    role: user.role
                },
                token: token,
                message: 'Login successful.'
            });

        } catch (err) {
            console.error("Login error:", err.message, err.stack);
            next(err);
        }
    });

    // POST /api/v1/auth/logout - Placeholder, actual logout is client-side token removal
    router.post('/logout', (req, res) => {
        // For stateless JWT, client is responsible for deleting the token.
        // If using a server-side token blocklist (e.g., with Redis), add token to blocklist here.
        // For example: blocklist.add(req.token); // Assuming token was extracted by authenticateToken if used before this
        res.json({ message: 'Logout successful. Please clear your token client-side.' });
    });

    return router;
};
