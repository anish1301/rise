import React, { useState } from 'react';
import { createMenuItem } from '../services/api';

const MenuItemForm = ({ onItemCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newItem = await createMenuItem({
        ...formData,
        price: parseFloat(formData.price)
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        available: true
      });
      
      if (onItemCreated) {
        onItemCreated(newItem);
      }
      
      alert('Menu item created successfully!');
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="menu-item-form">
      <div className="form-group">
        <label htmlFor="name">Item Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="price">Price ($):</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option value="appetizers">Appetizers</option>
          <option value="main-course">Main Course</option>
          <option value="desserts">Desserts</option>
          <option value="beverages">Beverages</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="image">Image URL:</label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          Available
        </label>
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Menu Item'}
      </button>
    </form>
  );
};

export default MenuItemForm;
