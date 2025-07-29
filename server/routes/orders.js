const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Customer routes (require authentication)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getCustomerOrders);

// Protected routes (for staff/admin)
router.get('/', authMiddleware, orderController.getOrders);
router.get('/today', authMiddleware, orderController.getTodaysOrders);
router.get('/ready', authMiddleware, orderController.getReadyOrders);
router.get('/status/:status', authMiddleware, orderController.getOrdersByStatus);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/ready', authMiddleware, orderController.markOrderReady);
router.put('/:id/complete', authMiddleware, orderController.markOrderCompleted);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
