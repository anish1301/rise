const MenuItem = require('../models/MenuItem');

// Get all menu items
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};

// Get menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ message: 'Server error while fetching menu item' });
  }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        message: 'Name, price, and category are required fields'
      });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      available: available !== undefined ? available : true
    });

    await menuItem.save();
    
    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Server error while creating menu item' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Update fields
    if (name !== undefined) menuItem.name = name;
    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (category !== undefined) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (available !== undefined) menuItem.available = available;

    await menuItem.save();
    
    res.json({
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Server error while updating menu item' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Server error while deleting menu item' });
  }
};

// Get menu items by category
exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ category, available: true })
      .sort({ name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};

// Get available menu items only
exports.getAvailableMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true })
      .sort({ category: 1, name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching available menu items:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};
