// routes/a_products.js
const express = require('express');

module.exports = function(pool) {
    const router = express.Router();

    // GET all products with filtering, pagination, and sorting
    router.get('/', async (req, res, next) => {
        let { page = 1, limit = 12, department, category, sortBy = 'p.name', sortOrder = 'asc', searchTerm } = req.query;

        // Validate and sanitize page and limit
        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 12; // Max limit 100

        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM Products p
            LEFT JOIN Departments d ON p.department_id = d.department_id
            LEFT JOIN Categories c ON p.category_id = c.category_id
            WHERE p.is_active = TRUE
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (department) {
            baseQuery += ` AND d.slug = $${paramIndex++}`;
            queryParams.push(department);
        }
        if (category) {
            baseQuery += ` AND c.slug = $${paramIndex++}`;
            queryParams.push(category);
        }
        if (searchTerm) {
            baseQuery += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex++})`;
            queryParams.push(`%${searchTerm}%`);
        }

        const totalQuery = `SELECT COUNT(*) AS total_items ${baseQuery}`;

        let productsQuery = `
            SELECT
                p.product_id as id, p.name, p.price, p.currency, p.description,
                p.image_url_main as "imageUrl", p.stock_quantity as stock,
                d.slug as department_slug, d.name as department_name,
                c.slug as category_slug, c.name as category_name
            ${baseQuery}
        `;

        // Validate sortBy and sortOrder to prevent SQL injection
        const validSortByFields = {
            'name': 'p.name',
            'price': 'p.price',
            'createdAt': 'p.created_at',
            'p.name': 'p.name', // Allow fully qualified names too
            'p.price': 'p.price',
            'p.created_at': 'p.created_at'
        };
        const validSortOrders = ['asc', 'desc'];

        const effectiveSortBy = validSortByFields[sortBy] || 'p.name'; // Default sort
        const effectiveSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

        productsQuery += ` ORDER BY ${effectiveSortBy} ${effectiveSortOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        const finalQueryParams = [...queryParams, limit, offset];

        try {
            const totalResult = await pool.query(totalQuery, queryParams);
            const totalItems = parseInt(totalResult.rows[0].total_items, 10);
            const totalPages = Math.ceil(totalItems / limit);

            const productsResult = await pool.query(productsQuery, finalQueryParams);

            res.json({
                data: productsResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    limit: limit
                }
            });
        } catch (err) {
            console.error('Error fetching products:', err.message, err.stack);
            next(err);
        }
    });

    // GET a single product by ID
    router.get('/:productId', async (req, res, next) => {
        const { productId } = req.params;
        // Validate productId is a number
        if (isNaN(parseInt(productId, 10))) {
            return res.status(400).json({ error: 'Invalid product ID format.' });
        }

        try {
            const result = await pool.query(
                `SELECT
                    product_id as id, name, sku, description, detailed_description, price, currency,
                    department_id, category_id, image_url_main as "imageUrlMain",
                    array(SELECT image_url FROM Product_Images WHERE product_id = p.product_id ORDER BY display_order ASC) as "imageUrls",
                    stock_quantity as stock,
                    is_featured, is_active, created_at, updated_at
                 FROM Products p WHERE product_id = $1 AND is_active = TRUE`,
                [productId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found or not active.' });
            }
            res.json({ data: result.rows[0] });
        } catch (err) {
            console.error(`Error fetching product ${productId}:`, err.message, err.stack);
            next(err);
        }
    });

    // POST new product (Admin only - auth middleware would be added here)
    router.post('/', async (req, res, next) => {
        // Example: if (!req.user || req.user.role !== 'admin') return res.sendStatus(403);
        const {
            name, sku, description, detailed_description, price, currency = 'NGN',
            department_id, category_id, image_url_main, image_urls, // image_urls is an array of strings
            stock_quantity = 0, is_featured = false, is_active = true
        } = req.body;

        if (!name || price === undefined || !department_id || !category_id) {
            return res.status(400).json({ error: 'Name, price, department_id, and category_id are required.' });
        }
        if (isNaN(parseFloat(price)) || isNaN(parseInt(department_id)) || isNaN(parseInt(category_id)) || isNaN(parseInt(stock_quantity))) {
            return res.status(400).json({ error: 'Price, department_id, category_id, and stock_quantity must be valid numbers.'});
        }

        const client = await pool.connect(); // Use a client for transaction
        try {
            await client.query('BEGIN');

            const productResult = await client.query(
                `INSERT INTO Products (name, sku, description, detailed_description, price, currency,
                                   department_id, category_id, image_url_main, stock_quantity,
                                   is_featured, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
                [name, sku, description, detailed_description, parseFloat(price), currency,
                 parseInt(department_id), parseInt(category_id), image_url_main, parseInt(stock_quantity),
                 is_featured, is_active]
            );
            const newProduct = productResult.rows[0];

            // Insert into Product_Images if image_urls array is provided
            if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
                const imageInsertPromises = image_urls.map((url, index) => {
                    return client.query(
                        'INSERT INTO Product_Images (product_id, image_url, display_order) VALUES ($1, $2, $3)',
                        [newProduct.product_id, url, index]
                    );
                });
                await Promise.all(imageInsertPromises);
            }

            await client.query('COMMIT');
            res.status(201).json({ data: newProduct, message: "Product created successfully." });
        } catch (err) {
            await client.query('ROLLBACK');
            if (err.code === '23505' && err.constraint === 'products_sku_key') {
                console.error('Create product conflict (SKU):', err.message);
                return res.status(409).json({ error: 'Product with this SKU already exists.' });
            }
            if (err.code === '23503') { // Foreign key violation
                console.error('Create product FK violation:', err.message);
                 return res.status(400).json({ error: 'Invalid department_id or category_id.' });
            }
            console.error('Error creating product:', err.message, err.stack);
            next(err);
        } finally {
            client.release();
        }
    });

    // Placeholder for PUT /:productId (Admin)
    // Placeholder for DELETE /:productId (Admin)

    return router;
};
