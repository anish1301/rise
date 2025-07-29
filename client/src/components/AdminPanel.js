import React, { useState } from 'react';
import MenuItemForm from './MenuItemForm';
import MenuItemList from './MenuItemList';
import OrdersManagement from './OrdersManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserProfile from './UserProfile';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="admin-panel">
      <div className="header-with-profile">
        <h1>Restaurant Admin Panel</h1>
        <UserProfile />
      </div>
      <div className="admin-header">
        <nav className="admin-nav">
          <button 
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => setActiveTab('menu')}
          >
            Menu Management
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'menu' && (
          <div className="menu-management">
            <div className="menu-form-section">
              <h2>Add New Menu Item</h2>
              <MenuItemForm />
            </div>
            <div className="menu-list-section">
              <h2>Current Menu Items</h2>
              <MenuItemList />
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && (
          <OrdersManagement />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
