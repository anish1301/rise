import React, { useState, useEffect } from 'react';
import { getMenuItems, updateMenuItem, deleteMenuItem } from '../services/api';

const MenuItemList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    try {
      await updateMenuItem(editingItem._id, editingItem);
      setMenuItems(menuItems.map(item => 
        item._id === editingItem._id ? editingItem : item
      ));
      setEditingItem(null);
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(itemId);
        setMenuItems(menuItems.filter(item => item._id !== itemId));
        alert('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedItem = { ...item, available: !item.available };
      await updateMenuItem(item._id, updatedItem);
      setMenuItems(menuItems.map(menuItem => 
        menuItem._id === item._id ? updatedItem : menuItem
      ));
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading menu items...</div>;
  }

  return (
    <div className="menu-item-list">
      {menuItems.length === 0 ? (
        <p>No menu items found. Add some items to get started!</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item._id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
              {editingItem && editingItem._id === item._id ? (
                <div className="edit-form">
                  <input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    placeholder="Name"
                  />
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                    placeholder="Price"
                  />
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                  >
                    <option value="appetizers">Appetizers</option>
                    <option value="main-course">Main Course</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                  </select>
                  <div className="edit-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setEditingItem(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {item.image && (
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                  )}
                  <div className="menu-item-content">
                    <h3>{item.name}</h3>
                    <p className="description">{item.description}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                    <p className="category">{item.category}</p>
                    <div className="item-actions">
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className={item.available ? 'available' : 'unavailable'}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="delete">
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItemList;
