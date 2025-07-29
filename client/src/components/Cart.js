import React, { useState } from 'react';
import { createOrder } from '../services/api';

const Cart = ({ cart, updateQuantity, removeFromCart, onClose, onOrderPlaced }) => {
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    tableNumber: '',
    phone: ''
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        customerName: customerInfo.customerName,
        phone: customerInfo.phone, // Keep as 'phone' since backend expects this
        tableNumber: customerInfo.tableNumber
      };

      console.log('Creating order with data:', orderData);
      await createOrder(orderData);
      console.log('Order created successfully');
      
      // Clear cart and customer info
      cart.forEach(item => removeFromCart(item._id));
      setCustomerInfo({
        customerName: '',
        tableNumber: '',
        phone: ''
      });
      
      alert('Order placed successfully! Kitchen has been notified.');
      onClose();
      
      // Switch to orders tab if callback provided
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h2>Your Order</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item._id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
              </div>

              <div className="customer-info">
                <h3>Customer Information</h3>
                <div className="form-group">
                  <label htmlFor="customerName">Name:</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={customerInfo.customerName}
                    onChange={handleCustomerInfoChange}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tableNumber">Table Number:</label>
                  <input
                    type="text"
                    id="tableNumber"
                    name="tableNumber"
                    value={customerInfo.tableNumber}
                    onChange={handleCustomerInfoChange}
                    placeholder="Enter table number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone (optional):</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !customerInfo.customerName}
                  className="place-order-btn"
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
