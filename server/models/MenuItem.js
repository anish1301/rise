const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['appetizers', 'main-course', 'desserts', 'beverages'],
    lowercase: true
  },
  image: {
    type: String,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy'],
    lowercase: true
  }],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'very-hot'],
    default: 'mild'
  },
  calories: {
    type: Number,
    min: 0
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
menuItemSchema.index({ category: 1, available: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ price: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
