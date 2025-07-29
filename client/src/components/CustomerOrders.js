import React, { useState, useEffect } from 'react';
import { getCustomerOrders, updateOrderStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        console.log('Fetching customer orders for logged-in user');
        setLoading(true);
        // Use the new customer-specific endpoint (uses user ID from JWT)
        const customerOrders = await getCustomerOrders();
        console.log('Received customer orders:', customerOrders);
        
        // Sort by creation date (newest first)
        const sortedOrders = customerOrders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is logged in
    if (user) {
      fetchCustomerOrders();
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchCustomerOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const customerOrders = await getCustomerOrders();
      
      const sortedOrders = customerOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await updateOrderStatus(orderId, 'cancelled');
        handleRefresh(); // Refresh the list
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please contact support.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      case 'completed': return '#9e9e9e';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Order received! Kitchen will start preparing soon.';
      case 'preparing': return 'Your order is being prepared by our chef!';
      case 'ready': return 'Order is ready for pickup! Please collect from counter.';
      case 'completed': return 'Order completed. Thank you for dining with us!';
      case 'cancelled': return 'This order has been cancelled.';
      default: return 'Order status unknown.';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedTime = (order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return null;
    }
    
    if (order.status === 'ready') {
      return 'Ready now!';
    }
    
    // Simple estimation based on order time
    const orderTime = new Date(order.createdAt);
    const estimatedReady = new Date(orderTime.getTime() + (order.estimatedPreparationTime || 20) * 60000);
    const now = new Date();
    
    if (estimatedReady <= now) {
      return 'Should be ready soon!';
    }
    
    const minutesLeft = Math.ceil((estimatedReady - now) / 60000);
    return `~${minutesLeft} minutes`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-orders">
          <div className="loading-spinner">⏳</div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>My Orders</h2>
          <p className="dashboard-subtitle">Track your order status in real-time</p>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="refresh-btn"
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🍽️</div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Browse our menu and place your first order!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-title">
                    <div className="order-id">Order #{order.orderNumber || order._id.slice(-6)}</div>
                    <span className="order-date">{formatTime(order.createdAt)}</span>
                  </div>
                  <div className="order-status-badge">
                    <span 
                      className={`order-status ${order.status}`}
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-status-message">
                  <p>{getStatusMessage(order.status)}</p>
                  {getEstimatedTime(order) && (
                    <p className="estimated-time">
                      <strong>{getEstimatedTime(order)}</strong>
                    </p>
                  )}
                </div>

                <div className="order-items">
                  <h4>Items Ordered</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-details">
                        <div className="item-name">
                          <span className="item-quantity">{item.quantity}x</span> {item.name}
                        </div>
                        {item.specialInstructions && (
                          <div className="special-instructions">
                            Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                      <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>

                {order.status === 'pending' && (
                  <div className="order-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
