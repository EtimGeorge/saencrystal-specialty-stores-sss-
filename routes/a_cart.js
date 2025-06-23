// routes/a_cart.js
const express = require('express');

const getSessionCartId = (req) => {
    // This is a placeholder. In a real app with express-session:
    // if (!req.session.cartId) { req.session.cartId = require('crypto').randomUUID(); }
    // return req.session.cartId;
    // For this example, using a non-secure header for simplicity. NOT FOR PRODUCTION.
    // Or, if using client-side only cart, this cartId might come from client if it needs to sync.
    // For now, let's assume it's a temporary ID generated per request if not provided,
    // or a persistent one if the client sends one (e.g., if client manages its own UUID for cart).
    if (!req.headers['x-session-cart-id']) {
        // This creates a new cart ID for every request that doesn't send one,
        // which means cart is not persistent across requests without client sending the ID back.
        // A better approach for non-user carts is client-generated UUID stored in localStorage.
        req.headers['x-session-cart-id'] = `temp_cart_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    return req.headers['x-session-cart-id'];
};

module.exports = function(pool) {
    const router = express.Router();

    const calculateCartTotals = (items) => {
        const subtotal = items.reduce((sum, item) => {
            const price = parseFloat(item.price_at_addition);
            const qty = parseInt(item.quantity, 10);
            if (isNaN(price) || isNaN(qty)) {
                console.warn('Invalid item data in cart:', item);
                return sum;
            }
            return sum + (price * qty);
        }, 0);

        const taxRate = 0.075; // Example: 7.5% tax, should be configurable
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        return {
            items: items.map(item => ({
                cart_item_id: item.cart_item_id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: parseInt(item.quantity, 10),
                price_at_addition: parseFloat(item.price_at_addition),
                product_image_url: item.product_image_url,
                itemTotal: parseFloat((parseFloat(item.price_at_addition) * parseInt(item.quantity, 10)).toFixed(2))
            })),
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    };

    // GET /api/v1/cart - Get current cart
    router.get('/', async (req, res, next) => {
        const cartId = getSessionCartId(req); // This cartId needs to be persistent for a user/session
        try {
            const result = await pool.query(
                `SELECT ci.cart_item_id, ci.product_id, p.name as product_name, ci.quantity,
                        ci.price_at_addition, p.image_url_main as product_image_url
                 FROM CartItems ci
                 JOIN Products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = $1 ORDER BY ci.added_at ASC`,
                [cartId]
            );
            res.json({ data: calculateCartTotals(result.rows) });
        } catch (err) {
            console.error('Error fetching cart:', err.message, err.stack);
            next(err);
        }
    });

    // POST /api/v1/cart/items - Add item to cart (or update quantity if exists)
    router.post('/items', async (req, res, next) => {
        const cartId = getSessionCartId(req);
        let { productId, quantity } = req.body;

        productId = parseInt(productId, 10);
        quantity = parseInt(quantity, 10) || 1;

        if (isNaN(productId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: 'Valid productId and quantity (>=1) are required.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const productRes = await client.query('SELECT price, stock_quantity FROM Products WHERE product_id = $1 AND is_active = TRUE', [productId]);
            if (productRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Product not found or not available.' });
            }
            const { price: productPrice, stock_quantity: productStock } = productRes.rows[0];

            const existingItemRes = await client.query(
                'SELECT cart_item_id, quantity FROM CartItems WHERE cart_id = $1 AND product_id = $2',
                [cartId, productId]
            );

            let message = '';
            let httpStatus = 200;

            if (existingItemRes.rows.length > 0) {
                const existingItem = existingItemRes.rows[0];
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > productStock) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: `Insufficient stock for product ID ${productId}. Available: ${productStock}, Requested total: ${newQuantity}` });
                }
                await client.query(
                    'UPDATE CartItems SET quantity = $1, price_at_addition = $2, added_at = CURRENT_TIMESTAMP WHERE cart_item_id = $3',
                    [newQuantity, productPrice, existingItem.cart_item_id]
                );
                message = 'Cart item quantity updated.';
            } else {
                if (quantity > productStock) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: `Insufficient stock for product ID ${productId}. Available: ${productStock}, Requested: ${quantity}` });
                }
                await client.query(
                    'INSERT INTO CartItems (cart_id, product_id, quantity, price_at_addition) VALUES ($1, $2, $3, $4)',
                    [cartId, productId, quantity, productPrice]
                );
                message = 'Item added to cart.';
                httpStatus = 201;
            }

            await client.query('COMMIT');

            const updatedCartRes = await pool.query(
                `SELECT ci.cart_item_id, ci.product_id, p.name as product_name, ci.quantity,
                        ci.price_at_addition, p.image_url_main as product_image_url
                 FROM CartItems ci JOIN Products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = $1 ORDER BY ci.added_at ASC`,
                [cartId]
            );
            res.status(httpStatus).json({ data: calculateCartTotals(updatedCartRes.rows), message });

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error adding/updating cart item:', err.message, err.stack);
            next(err);
        } finally {
            client.release();
        }
    });

    // PUT /api/v1/cart/items/:productId - Set item quantity
    router.put('/items/:productId', async (req, res, next) => {
        const cartId = getSessionCartId(req);
        const productId = parseInt(req.params.productId, 10);
        let { quantity } = req.body;
        quantity = parseInt(quantity, 10);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Valid product ID is required in path.' });
        }
        if (!Number.isInteger(quantity)) {
            return res.status(400).json({ error: 'Valid integer quantity is required in body.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            if (quantity < 1) { // If quantity is 0 or less, remove the item
                const deleteResult = await client.query('DELETE FROM CartItems WHERE cart_id = $1 AND product_id = $2 RETURNING product_id', [cartId, productId]);
                await client.query('COMMIT');
                if (deleteResult.rowCount === 0) return res.status(404).json({ error: 'Item not found in cart for removal.' });
            } else { // If quantity >= 1, proceed to update/insert
                const productRes = await client.query('SELECT price, stock_quantity FROM Products WHERE product_id = $1 AND is_active = TRUE', [productId]);
                if (productRes.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Product not found or not available.' });
                }
                const { price: productPrice, stock_quantity: productStock } = productRes.rows[0];

                if (quantity > productStock) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: `Insufficient stock for product ID ${productId}. Available: ${productStock}, Requested: ${quantity}` });
                }

                const result = await client.query( // Use UPDATE ... RETURNING to check if row existed
                    `UPDATE CartItems SET quantity = $1, price_at_addition = $2, added_at = CURRENT_TIMESTAMP
                     WHERE cart_id = $3 AND product_id = $4 RETURNING cart_item_id`,
                    [quantity, productPrice, cartId, productId]
                );

                if (result.rowCount === 0) { // Item wasn't in cart, so add it with this quantity
                    await client.query(
                        'INSERT INTO CartItems (cart_id, product_id, quantity, price_at_addition) VALUES ($1, $2, $3, $4)',
                        [cartId, productId, quantity, productPrice]
                    );
                }
                await client.query('COMMIT');
            }

            const updatedCartRes = await pool.query(
                `SELECT ci.cart_item_id, ci.product_id, p.name as product_name, ci.quantity,
                        ci.price_at_addition, p.image_url_main as product_image_url
                 FROM CartItems ci JOIN Products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = $1 ORDER BY ci.added_at ASC`, [cartId]);
            res.json({ data: calculateCartTotals(updatedCartRes.rows), message: quantity < 1 ? 'Item removed due to zero quantity.' : 'Cart item quantity set.' });

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error setting cart item quantity:', err.message, err.stack);
            next(err);
        } finally {
            client.release();
        }
    });

    // DELETE /api/v1/cart/items/:productId - Remove item from cart
    router.delete('/items/:productId', async (req, res, next) => {
        const cartId = getSessionCartId(req);
        const productId = parseInt(req.params.productId, 10);

        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Valid product ID is required in path.' });
        }
        try {
            const result = await pool.query(
                'DELETE FROM CartItems WHERE cart_id = $1 AND product_id = $2 RETURNING product_id',
                [cartId, productId]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Item not found in cart.' });
            }
            const updatedCartRes = await pool.query(
                `SELECT ci.cart_item_id, ci.product_id, p.name as product_name, ci.quantity,
                        ci.price_at_addition, p.image_url_main as product_image_url
                 FROM CartItems ci JOIN Products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = $1 ORDER BY ci.added_at ASC`,
                [cartId]
            );
            res.json({ data: calculateCartTotals(updatedCartRes.rows), message: 'Item removed from cart.' });
        } catch (err) {
            console.error('Error removing item from cart:', err.message, err.stack);
            next(err);
        }
    });

    // DELETE /api/v1/cart - Clear the entire cart
    router.delete('/', async (req, res, next) => {
        const cartId = getSessionCartId(req);
        try {
            await pool.query('DELETE FROM CartItems WHERE cart_id = $1', [cartId]);
            // If using a Carts table that links session_id to a persistent cart_id
            // and you want to delete the cart itself:
            // await pool.query('DELETE FROM Carts WHERE cart_id = $1', [cartId]);
            res.status(200).json({ data: calculateCartTotals([]), message: 'Cart cleared successfully.' });
        } catch (err) {
            console.error('Error clearing cart:', err.message, err.stack);
            next(err);
        }
    });
    return router;
};
