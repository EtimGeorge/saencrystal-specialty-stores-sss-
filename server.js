require('dotenv').config(); // For environment variables
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// PostgreSQL Pool setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
});

// Test DB connection
pool.connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err.stack));

// Basic root route
app.get('/', (req, res) => {
    res.send('Saencrystal API is running!');
});

// Route imports
const productsRouter = require('./routes/a_products');
app.use('/api/v1/products', productsRouter(pool));

const departmentsRouter = require('./routes/a_departments');
app.use('/api/v1/departments', departmentsRouter(pool));

const cartRouter = require('./routes/a_cart');
app.use('/api/v1/cart', cartRouter(pool));

const ordersRouter = require('./routes/a_orders');
app.use('/api/v1/orders', ordersRouter(pool));

const authRouter = require('./routes/a_auth');
app.use('/api/v1/auth', authRouter(pool));

// Example of adding protected routes (demonstration):
const { authenticateToken } = require('./utils/authUtils'); // Using only authenticateToken for this example

app.get('/api/v1/profile', authenticateToken, async (req, res, next) => {
    // req.user is available here (e.g., req.user.userId, req.user.email, req.user.role)
    try {
        // Ensure req.user and req.user.userId are available
        if (!req.user || !req.user.userId) {
            // This case should ideally be caught by authenticateToken if token is invalid/missing
            // but an extra check doesn't hurt if authenticateToken logic changes.
            return res.status(401).json({ error: "Authentication details not found or invalid." });
        }

        const userProfile = await pool.query(
            'SELECT user_id, email, first_name, last_name, phone_number, role, created_at, is_active FROM Users WHERE user_id = $1',
            [req.user.userId]
        );
        if (userProfile.rows.length === 0) {
            return res.status(404).json({ error: "User profile not found." });
        }
        // Exclude password_hash from the response; it's already not selected.
        res.json({ data: userProfile.rows[0] });
    } catch (err) {
        console.error("Error fetching user profile:", err.message, err.stack);
        next(err); // Pass to generic error handler
    }
});

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
