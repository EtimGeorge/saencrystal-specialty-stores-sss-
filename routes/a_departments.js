// routes/a_departments.js
const express = require('express');

module.exports = function(pool) {
    const router = express.Router();

    // GET all departments
    router.get('/', async (req, res, next) => {
        try {
            const result = await pool.query('SELECT department_id as id, name, slug, description, image_url FROM Departments ORDER BY name');
            res.json({ data: result.rows });
        } catch (err) {
            console.error('Error fetching departments:', err.message, err.stack);
            next(err);
        }
    });

    // GET categories for a specific department by department slug
    router.get('/:departmentSlug/categories', async (req, res, next) => {
        const { departmentSlug } = req.params;
        try {
            const deptResult = await pool.query('SELECT department_id FROM Departments WHERE slug = $1', [departmentSlug]);
            if (deptResult.rows.length === 0) {
                return res.status(404).json({ error: 'Department not found' });
            }
            const departmentId = deptResult.rows[0].department_id;

            const catResult = await pool.query(
                'SELECT category_id as id, name, slug, description, image_url, department_id FROM Categories WHERE department_id = $1 ORDER BY name',
                [departmentId]
            );
            res.json({ data: catResult.rows });
        } catch (err) {
            console.error(`Error fetching categories for department ${departmentSlug}:`, err.message, err.stack);
            next(err);
        }
    });

    // POST new department (Admin only - auth middleware would be added here)
    router.post('/', async (req, res, next) => {
        // Example: if (!req.user || req.user.role !== 'admin') return res.sendStatus(403);
        const { name, slug, description, image_url } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required for a department.' });
        }
        try {
            // Ensure slug is URL-friendly
            const generatedSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const result = await pool.query(
                'INSERT INTO Departments (name, slug, description, image_url) VALUES ($1, $2, $3, $4) RETURNING department_id as id, name, slug, description, image_url',
                [name, generatedSlug, description, image_url]
            );
            res.status(201).json({ data: result.rows[0], message: 'Department created successfully.' });
        } catch (err) {
            if (err.code === '23505') { // Unique violation (e.g., for slug or name if unique constraint exists)
                console.error('Create department conflict error:', err.message);
                return res.status(409).json({ error: 'Department name or slug already exists.' });
            }
            console.error('Error creating department:', err.message, err.stack);
            next(err);
        }
    });

    // Placeholder for PUT /:departmentId (Admin)
    // Placeholder for DELETE /:departmentId (Admin)

    return router;
};
