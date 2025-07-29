const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let filter = {};
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get customer's own orders (for logged-in customers)
exports.getCustomerOrders = async (req, res) => {
  try {
    // Get user ID from the authenticated token
    const userId = req.user.id;
    
    // Find orders that belong to this user
    const orders = await Order.find({ 
      user: userId 
    })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Server error while fetching customer orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, tableNumber, phone, notes } = req.body;
    const userId = req.user.id; // Get user ID from authenticated token

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem || item._id);
      
      if (!menuItem) {
        return res.status(400).json({
          message: `Menu item not found: ${item.name || item.menuItem}`
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          message: `Menu item not available: ${menuItem.name}`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Create order with user association
    const order = new Order({
      user: userId, // Associate order with logged-in user
      items: orderItems,
      total,
      customerName,
      customerPhone: phone,
      tableNumber,
      notes,
      status: 'pending'
    });

    await order.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', populatedOrder);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', populatedOrder);
    }

    res.json({
      message: 'Order status updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error while deleting order' });
  }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get today's orders
exports.getTodaysOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await Order.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('items.menuItem', 'name price')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Mark order as ready (Kitchen staff)
exports.markOrderReady = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'preparing') {
      return res.status(400).json({ 
        message: 'Order must be in preparing status to mark as ready' 
      });
    }
    
    order.status = 'ready';
    await order.save();
    
    // Populate the order before sending response
    const populatedOrder = await Order.findById(id)
      .populate('items.menuItem', 'name price');
    
    res.json({
      message: 'Order marked as ready',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error marking order as ready:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
};

// Mark order as completed (Waiter)
exports.markOrderCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.status !== 'ready') {
      return res.status(400).json({ 
        message: 'Order must be ready to mark as completed' 
      });
    }
    
    order.status = 'completed';
    await order.save();
    
    // Populate the order before sending response
    const populatedOrder = await Order.findById(id)
      .populate('items.menuItem', 'name price');
    
    res.json({
      message: 'Order marked as completed',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error marking order as completed:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
};

// Get ready orders (for waiters)
exports.getReadyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready' })
      .populate('items.menuItem', 'name price')
      .sort({ readyAt: 1 }); // Oldest ready orders first
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching ready orders:', error);
    res.status(500).json({ message: 'Server error while fetching ready orders' });
  }
};
