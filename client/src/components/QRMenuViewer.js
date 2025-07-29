import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/api';
import Cart from './Cart';
import CustomerOrders from './CustomerOrders';
import UserProfile from './UserProfile';

const QRMenuViewer = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // New: tab state

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    console.log('QRMenuViewer: Starting to fetch menu items...');
    setLoading(true);
    try {
      const items = await getMenuItems();
      console.log('QRMenuViewer: Received items:', items);
      const availableItems = items.filter(item => item.available);
      console.log('QRMenuViewer: Available items:', availableItems);
      setMenuItems(availableItems);
    } catch (error) {
      console.error('QRMenuViewer: Error fetching menu items:', error);
      // Fallback is now handled in the API service itself
      setMenuItems([]);
    } finally {
      console.log('QRMenuViewer: Setting loading to false');
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="qr-menu-viewer">
      <header className="menu-header">
        <div className="header-top">
          <div className="header-with-profile">
            <h1>Customer Dashboard</h1>
            <UserProfile />
          </div>
        </div>
        
        {/* Tab Navigation with Cart Button */}
        <div className="tab-navigation">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              Browse Menu
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </button>
          </div>
          
          {/* Cart Button - Same level as tabs */}
          {activeTab === 'menu' && (
            <button 
              className="cart-button"
              onClick={() => setShowCart(!showCart)}
            >
              Cart ({getTotalItems()})
            </button>
          )}
        </div>
      </header>

      {/* Menu Tab Content */}
      {activeTab === 'menu' && (
        <>
        {showCart && (
          <Cart 
            cart={cart} 
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            onClose={() => setShowCart(false)}
            onOrderPlaced={() => setActiveTab('orders')}
          />
        )}          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="menu-items-grid">
            {filteredItems.map(item => (
              <div key={item._id} className="menu-item-card">
                {item.image && (
                  <img src={item.image} alt={item.name} className="item-image" />
                )}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price">${item.price.toFixed(2)}</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="no-items">No items available in this category.</p>
          )}
        </>
      )}

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <CustomerOrders />
      )}
    </div>
  );
};

export default QRMenuViewer;
