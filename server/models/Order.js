const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  specialInstructions: {
    type: String,
    maxlength: 200
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest orders
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  customerPhone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  tableNumber: {
    type: String,
    trim: true,
    maxlength: 10
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeout', 'delivery'],
    default: 'dine-in'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'upi'],
    default: 'cash'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  estimatedPreparationTime: {
    type: Number, // in minutes
    default: 20
  },
  actualPreparationTime: {
    type: Number // in minutes
  },
  completedAt: {
    type: Date
  },
  readyAt: {
    type: Date
  },
  deliveryAddress: {
    street: String,
    city: String,
    zipCode: String,
    landmark: String
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    min: 0,
    default: 0
  },
  tip: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-6);
    this.orderNumber = `ORD-${dateStr}-${timeStr}`;
  }
  next();
});

// Update completedAt when status changes to completed
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
    if (this.status === 'ready' && !this.readyAt) {
      this.readyAt = new Date();
    }
  }
  next();
});

// Indexes for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ tableNumber: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
