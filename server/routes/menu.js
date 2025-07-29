const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');

// Public routes (for customers viewing menu)
router.get('/', menuController.getMenuItems);
router.get('/available', menuController.getAvailableMenuItems);
router.get('/category/:category', menuController.getMenuItemsByCategory);
router.get('/:id', menuController.getMenuItemById);

// Protected routes (for admin/staff)
router.post('/', authMiddleware, menuController.createMenuItem);
router.put('/:id', authMiddleware, menuController.updateMenuItem);
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;
