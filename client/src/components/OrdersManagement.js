import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let params = {};
        
        if (filterStatus !== 'all') {
          params.status = filterStatus;
        }
        
        if (filterDate === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          params.startDate = today.toISOString();
        } else if (filterDate === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          params.startDate = weekAgo.toISOString();
        }

        const ordersData = await getOrders();
        
        // Apply client-side filtering for now
        let filteredOrders = ordersData;
        
        if (filterStatus !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
        }
        
        if (filterDate === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filteredOrders = filteredOrders.filter(order => 
            new Date(order.createdAt) >= today
          );
        }
        
        setOrders(filteredOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filterStatus, filterDate]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const ordersData = await getOrders();
      
      // Apply client-side filtering for now
      let filteredOrders = ordersData;
      
      if (filterStatus !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
      }
      
      if (filterDate === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.createdAt) >= today
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      handleRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.total, 0)
      .toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-management">
      <div className="orders-header">
        <h2>Order Management</h2>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">${getTotalRevenue()}</span>
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {orders.filter(o => o.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date:</label>
          <select 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <h3>No orders found</h3>
            <p>Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>#{order.orderNumber}</h3>
                  <span 
                    className="order-status"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </span>
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
                    <p><strong>Type:</strong> {order.orderType}</p>
                  </div>
                  
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="order-meta">
                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                    <p><strong>Ordered:</strong> {formatTime(order.createdAt)}</p>
                    {order.completedAt && (
                      <p><strong>Completed:</strong> {formatTime(order.completedAt)}</p>
                    )}
                  </div>
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
                      onClick={() => handleStatusUpdate(order._id, 'ready')}
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
                  
                  {['pending', 'preparing'].includes(order.status) && (
                    <button 
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      className="status-btn cancelled"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
