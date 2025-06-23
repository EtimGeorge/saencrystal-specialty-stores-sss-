// routes/a_orders.js
const express = require('express');

// This placeholder needs to be consistent with how cartId is managed.
// If client generates and stores its cartId (e.g. in localStorage) and sends it,
// then for placing an order, it should also send this cartId.
// For user-specific carts (after login), cartId might be associated with userId.
const getSessionCartId = (req) => {
    // For now, assume client might send 'X-Session-Cart-Id' or we use a temporary one.
    // This is NOT a secure or robust session/cart management strategy for production.
    let cartId = req.headers['x-session-cart-id'];
    if (!cartId && req.body.cartId) { // Fallback to cartId from body if placing order
        cartId = req.body.cartId;
    }
    // If still no cartId, and an order is being placed, it implies an issue or an empty cart.
    // For fetching orders by ID, cartId isn't directly used.
    return cartId;
};


module.exports = function(pool) {
    const router = express.Router();

    // POST /api/v1/orders - Place a new order
    router.post('/', async (req, res, next) => {
        // const userId = req.user ? req.user.userId : null; // Assuming req.user from auth middleware for logged-in users
        // For now, we'll allow anonymous orders if no userId.
        // The cartId will identify the cart to be converted to an order.

        const { shippingInfo, paymentInfo, cartId: clientCartId, userId } = req.body;
        const cartId = clientCartId || getSessionCartId(req); // Prefer cartId from body for explicit order creation

        if (!cartId) {
            return res.status(400).json({ error: "Cart ID is missing. Cannot determine which cart to process."});
        }

        // --- Basic Validation for shippingInfo ---
        const requiredShippingFields = ['fullName', 'address_line1', 'city', 'country', 'zip_postal_code', 'customer_email'];
        if (!shippingInfo) {
            return res.status(400).json({ error: "Shipping information is required."});
        }
        for (const field of requiredShippingFields) {
            if (!shippingInfo[field] || String(shippingInfo[field]).trim() === '') { // Added trim check
                return res.status(400).json({ error: `Shipping information is incomplete. Missing or empty: ${field}` });
            }
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingInfo.customer_email)) {
            return res.status(400).json({ error: "Invalid customer email format." });
        }
        // --- End Basic Validation ---


        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const cartItemsRes = await client.query(
                `SELECT ci.product_id, p.name as product_name, ci.quantity, ci.price_at_addition, p.stock_quantity
                 FROM CartItems ci
                 JOIN Products p ON ci.product_id = p.product_id
                 WHERE ci.cart_id = $1 AND ci.quantity > 0 AND p.is_active = TRUE`, // Also check if product is active
                [cartId]
            );

            if (cartItemsRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Cart is empty or contains no valid items. Cannot place order.' });
            }

            let subtotalAmount = 0;
            const orderItemsData = [];

            for (const item of cartItemsRes.rows) {
                const itemStock = parseInt(item.stock_quantity, 10);
                const itemQuantity = parseInt(item.quantity, 10);

                if (itemQuantity > itemStock) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({
                        error: `Not enough stock for ${item.product_name}. Available: ${itemStock}, Requested: ${itemQuantity}. Please update your cart.`
                    });
                }
                const price = parseFloat(item.price_at_addition);
                subtotalAmount += price * itemQuantity;
                orderItemsData.push({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: itemQuantity,
                    price_per_unit: price,
                    total_price: parseFloat((price * itemQuantity).toFixed(2))
                });
            }

            const taxRate = 0.075; // Example: 7.5% tax
            const taxAmount = parseFloat((subtotalAmount * taxRate).toFixed(2));

            // Example: Simple flat shipping rate or free if subtotal > threshold
            const shippingConfig = { cost: 1500.00, freeShippingThreshold: 50000.00 };
            const shippingAmount = subtotalAmount >= shippingConfig.freeShippingThreshold ? 0.00 : shippingConfig.cost;

            const totalAmount = parseFloat((subtotalAmount + taxAmount + shippingAmount).toFixed(2));

            // Simulate payment processing (in a real app, integrate with a payment gateway)
            const paymentTransactionId = `mock_txn_${Date.now()}`;
            const paymentStatus = 'completed'; // Assume payment success for this simulation

            const orderRes = await client.query(
                `INSERT INTO Orders (user_id, order_status, subtotal_amount, tax_amount, shipping_amount, total_amount, currency,
                                   shipping_full_name, shipping_address_line1, shipping_address_line2, shipping_city,
                                   shipping_state_province, shipping_zip_postal_code, shipping_country,
                                   customer_email, customer_phone, payment_method, payment_status, payment_transaction_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                 RETURNING order_id, order_status, total_amount, created_at, customer_email`, // Added customer_email to returning
                [
                    userId, 'pending_confirmation',
                    subtotalAmount, taxAmount, shippingAmount, totalAmount, 'NGN',
                    shippingInfo.fullName, shippingInfo.address_line1, shippingInfo.address_line2 || null, shippingInfo.city,
                    shippingInfo.state_province || null, shippingInfo.zip_postal_code, shippingInfo.country,
                    shippingInfo.customer_email, shippingInfo.customer_phone || null,
                    (paymentInfo ? paymentInfo.method : 'mock_card'), paymentStatus, paymentTransactionId
                ]
            );
            const newOrder = orderRes.rows[0];
            const newOrderId = newOrder.order_id;

            for (const itemData of orderItemsData) {
                await client.query(
                    `INSERT INTO OrderItems (order_id, product_id, product_name, quantity, price_per_unit, total_price)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [newOrderId, itemData.product_id, itemData.product_name, itemData.quantity, itemData.price_per_unit, itemData.total_price]
                );
                // Update product stock
                await client.query(
                    'UPDATE Products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
                    [itemData.quantity, itemData.product_id]
                );
            }

            // Clear the processed cart items
            await client.query('DELETE FROM CartItems WHERE cart_id = $1', [cartId]);
            // If using a Carts table that is meant to be deleted after order:
            // await client.query('DELETE FROM Carts WHERE cart_id = $1', [cartId]);

            await client.query('COMMIT');

            // TODO: Send order confirmation email (out of scope for this setup)

            res.status(201).json({
                data: {
                    orderId: newOrderId,
                    status: newOrder.order_status,
                    totalAmount: newOrder.total_amount,
                    customerEmail: newOrder.customer_email,
                    createdAt: newOrder.created_at
                },
                message: 'Order placed successfully.'
            });

        } catch (err) {
            if (client) await client.query('ROLLBACK');
            console.error('Error placing order:', err.message, err.stack);
            next(err);
        } finally {
            if (client) client.release();
        }
    });

    // GET /api/v1/orders/:orderId - Get order details (requires authentication & authorization)
    router.get('/:orderId', /* authenticateToken, */ async (req, res, next) => {
        const { orderId } = req.params;
        // const userId = req.user ? req.user.userId : null; // From authenticateToken middleware
        // const userRole = req.user ? req.user.role : 'guest';

        // Validate orderId format (e.g., if it should be a number or UUID)
        if (isNaN(parseInt(orderId,10)) && typeof orderId !== 'string' ) { // Basic check, adjust if UUID
             return res.status(400).json({ error: "Invalid order ID format."});
        }

        try {
            let orderQueryText = `SELECT o.*,
                                     json_agg(json_build_object(
                                         'order_item_id', oi.order_item_id,
                                         'product_id', oi.product_id,
                                         'product_name', oi.product_name,
                                         'quantity', oi.quantity,
                                         'price_per_unit', oi.price_per_unit,
                                         'total_price', oi.total_price
                                     )) as items
                              FROM Orders o
                              JOIN OrderItems oi ON o.order_id = oi.order_id
                              WHERE o.order_id = $1`;
            const queryParams = [orderId];

            // Example: Restrict access if not admin and order doesn't belong to user
            // if (userId && userRole !== 'admin') {
            //     orderQueryText += ' AND o.user_id = $2';
            //     queryParams.push(userId);
            // }

            orderQueryText += ' GROUP BY o.order_id'; // Group by all columns in Orders table if needed, or just o.order_id

            const orderRes = await pool.query(orderQueryText, queryParams);

            if (orderRes.rows.length === 0) {
                return res.status(404).json({ error: "Order not found or access denied." });
            }

            res.json({ data: orderRes.rows[0] });
        } catch (err) {
            console.error(`Error fetching order ${orderId}:`, err.message, err.stack);
            next(err);
        }
    });

    // GET /api/v1/orders - Get all orders (Admin only)
    router.get('/', /* authenticateToken, authorizeRole('admin'), */ async (req, res, next) => {
        try {
            // Add pagination here if expecting many orders
            const result = await pool.query('SELECT * FROM Orders ORDER BY created_at DESC');
            res.json({data: result.rows});
        } catch(err) {
            console.error('Error fetching all orders:', err.message, err.stack);
            next(err);
        }
    });

    // PUT /api/v1/orders/:orderId/status - Update order status (Admin only)
    router.put('/:orderId/status', /* authenticateToken, authorizeRole('admin'), */ async (req, res, next) => {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "New status is required."});
        }
        // Add validation for allowed status values e.g. ['pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']
        const allowedStatuses = ['pending_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status value. Allowed: ${allowedStatuses.join(', ')}`});
        }

        try {
            const result = await pool.query(
                'UPDATE Orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *',
                [status, orderId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Order not found."});
            }
            // TODO: Potentially send notification to customer about status update
            res.json({ data: result.rows[0], message: "Order status updated successfully."});
        } catch (err) {
            console.error(`Error updating status for order ${orderId}:`, err.message, err.stack);
            next(err);
        }
    });

    return router;
};
