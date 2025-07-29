const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join kitchen room for kitchen staff
    socket.on('joinKitchen', () => {
      socket.join('kitchen');
      console.log(`Socket ${socket.id} joined kitchen room`);
    });

    // Join admin room for admin users
    socket.on('joinAdmin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    // Join customer room for customers
    socket.on('joinCustomer', (tableNumber) => {
      socket.join(`table-${tableNumber}`);
      console.log(`Socket ${socket.id} joined table-${tableNumber} room`);
    });

    // Handle order status updates
    socket.on('updateOrderStatus', (data) => {
      const { orderId, status, tableNumber } = data;
      
      // Emit to kitchen
      socket.to('kitchen').emit('orderStatusUpdate', { orderId, status });
      
      // Emit to admin
      socket.to('admin').emit('orderStatusUpdate', { orderId, status });
      
      // Emit to specific table if available
      if (tableNumber) {
        socket.to(`table-${tableNumber}`).emit('orderStatusUpdate', { orderId, status });
      }
    });

    // Handle new orders
    socket.on('newOrder', (orderData) => {
      // Emit to kitchen
      socket.to('kitchen').emit('newOrder', orderData);
      
      // Emit to admin
      socket.to('admin').emit('newOrder', orderData);
      
      console.log('New order broadcasted:', orderData.orderNumber);
    });

    // Handle menu updates
    socket.on('menuUpdate', (menuData) => {
      // Broadcast menu updates to all connected clients
      socket.broadcast.emit('menuUpdate', menuData);
      console.log('Menu update broadcasted');
    });

    // Handle kitchen notifications
    socket.on('kitchenNotification', (notification) => {
      // Send notification to kitchen staff
      socket.to('kitchen').emit('notification', notification);
      console.log('Kitchen notification sent:', notification.message);
    });

    // Handle admin notifications
    socket.on('adminNotification', (notification) => {
      // Send notification to admin
      socket.to('admin').emit('notification', notification);
      console.log('Admin notification sent:', notification.message);
    });

    // Handle table notifications
    socket.on('tableNotification', (data) => {
      const { tableNumber, notification } = data;
      socket.to(`table-${tableNumber}`).emit('notification', notification);
      console.log(`Table ${tableNumber} notification sent:`, notification.message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to emit to specific rooms
  const emitToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
  };

  // Helper function to emit to all clients
  const emitToAll = (event, data) => {
    io.emit(event, data);
  };

  return {
    emitToRoom,
    emitToAll
  };
};

module.exports = socketHandler;
