import React, { useState, useEffect } from 'react';
import { getReadyOrders, markOrderCompleted } from '../services/api';
import UserProfile from './UserProfile';

const WaiterDashboard = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadyOrders();
    // Set up polling to check for new ready orders every 30 seconds
    const interval = setInterval(fetchReadyOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReadyOrders = async () => {
    try {
      const orders = await getReadyOrders();
      setReadyOrders(orders);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (orderId) => {
    try {
      await markOrderCompleted(orderId);
      // Remove the completed order from the list
      setReadyOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    } catch (error) {
      console.error('Error marking order as completed:', error);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWaitTime = (readyAt) => {
    const now = new Date();
    const readyTime = new Date(readyAt);
    const diffMinutes = Math.floor((now - readyTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just ready';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  };

  const handleRefresh = () => {
    fetchReadyOrders();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-orders">
          <div className="loading-spinner">⏳</div>
          <p>Loading waiter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Waiter Dashboard</h2>
          <p className="dashboard-subtitle">Manage ready orders for pickup</p>
        </div>
        <div className="dashboard-actions">
          <div className="ready-orders-summary">
            <span className="ready-count">
              Ready Orders: {readyOrders.length}
            </span>
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
        {readyOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">🥘</div>
            <h3>No orders ready for pickup</h3>
            <p>All orders have been delivered! 🎉</p>
          </div>
        ) : (
          <div className="orders-grid">
            {readyOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-title">
                    <div className="order-id">Order #{order.orderNumber}</div>
                    <span className="order-date">
                      Ready {getWaitTime(order.readyAt)}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="customer-info">
                    {order.customerName && (
                      <p><strong>Customer:</strong> {order.customerName}</p>
                    )}
                    {order.tableNumber && (
                      <p><strong>Table:</strong> {order.tableNumber}</p>
                    )}
                    {order.customerPhone && (
                      <p><strong>Phone:</strong> {order.customerPhone}</p>
                    )}
                  </div>
                  
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          <span className="item-quantity">{item.quantity}x</span>
                          <span className="item-name">{item.name}</span>
                          {item.specialInstructions && (
                            <span className="special-instructions">
                              - {item.specialInstructions}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="order-meta">
                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    <p><strong>Type:</strong> {order.orderType}</p>
                    <p><strong>Ready at:</strong> {formatTime(order.readyAt)}</p>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button 
                    className="deliver-btn"
                    onClick={() => handleMarkCompleted(order._id)}
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
