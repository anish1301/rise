import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { getOrders, updateOrderStatus, markOrderReady } from '../services/api';
import UserProfile from './UserProfile';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    fetchOrders();
    
    // Listen for new orders via socket
    if (socket) {
      socket.on('newOrder', (order) => {
        setOrders(prevOrders => [order, ...prevOrders]);
      });

      socket.on('orderStatusUpdate', (updatedOrder) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderStatusUpdate');
      }
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order._id === orderId ? updatedOrder : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      const response = await markOrderReady(orderId);
      setOrders(orders.map(order =>
        order._id === orderId ? response.order : order
      ));
    } catch (error) {
      console.error('Error marking order as ready:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      case 'completed': return '#9e9e9e';
      default: return '#f44336';
    }
  };

  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'preparing'
  );

  const handleRefresh = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-orders">
          <div className="loading-spinner">⏳</div>
          <p>Loading kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Kitchen Dashboard</h2>
          <p className="dashboard-subtitle">Manage and prepare orders</p>
        </div>
        <div className="dashboard-actions">
          <div className="orders-summary">
            <span>Pending Orders: {pendingOrders.length}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="refresh-btn"
          >
            🔄 Refresh
          </button>
          <UserProfile />
        </div>
      </div>

      <div className="dashboard-content">
        <div className="orders-grid">
          {pendingOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">👨‍🍳</div>
              <h3>No pending orders</h3>
              <p>All caught up! 🎉</p>
            </div>
          ) : (
            pendingOrders.map(order => (
              <div 
                key={order._id} 
                className="order-card"
                style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}
              >
                <div className="order-header">
                  <div className="order-title">
                    <div className="order-id">Order #{order._id.slice(-6)}</div>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-details">
                <p><strong>Customer:</strong> {order.customerName || 'Walk-in'}</p>
                <p><strong>Table:</strong> {order.tableNumber || 'N/A'}</p>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              </div>

              <div className="order-actions">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusUpdate(order._id, 'preparing')}
                    className="status-btn preparing"
                  >
                    Start Preparing
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => handleMarkReady(order._id)}
                    className="status-btn ready"
                  >
                    Mark Ready
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button 
                    onClick={() => handleStatusUpdate(order._id, 'completed')}
                    className="status-btn completed"
                  >
                    Complete Order
                  </button>
                )}
              </div>

              <div className="order-status">
                Status: <span style={{ color: getStatusColor(order.status) }}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;
