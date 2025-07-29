const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Get analytics overview
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Get orders in the specified period
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    });

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue (for charts)
    const dailyRevenue = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total;
    });

    res.json({
      period,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      statusBreakdown,
      dailyRevenue
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

// Get popular menu items
exports.getPopularItems = async (req, res) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Aggregate popular items
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(popularItems);
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ message: 'Server error while fetching popular items' });
  }
};

// Get revenue statistics
exports.getRevenueStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate, groupBy, dateFormat;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = 'daily';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = 'daily';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = 'monthly';
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = 'daily';
    }

    const revenueStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate growth rate
    const currentPeriodRevenue = revenueStats.reduce((sum, stat) => sum + stat.revenue, 0);
    
    // Get previous period for comparison
    let previousStartDate;
    switch (period) {
      case 'week':
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        break;
      case 'year':
        previousStartDate = new Date(startDate);
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        break;
      default:
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    }

    const previousPeriodOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: { $ne: 'cancelled' }
    });

    const previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const growthRate = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    res.json({
      period,
      dateFormat,
      currentPeriodRevenue: parseFloat(currentPeriodRevenue.toFixed(2)),
      previousPeriodRevenue: parseFloat(previousPeriodRevenue.toFixed(2)),
      growthRate: parseFloat(growthRate.toFixed(2)),
      stats: revenueStats.map(stat => ({
        date: stat._id,
        revenue: parseFloat(stat.revenue.toFixed(2)),
        orderCount: stat.orderCount,
        averageOrderValue: parseFloat(stat.averageOrderValue.toFixed(2))
      }))
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({ message: 'Server error while fetching revenue stats' });
  }
};

// Get customer insights
exports.getCustomerInsights = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get orders in period
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' }
    });

    // Calculate insights
    const totalCustomers = new Set(orders.map(order => order.customerName || 'Anonymous')).size;
    const repeatCustomers = {};
    const tableUsage = {};

    orders.forEach(order => {
      const customer = order.customerName || 'Anonymous';
      repeatCustomers[customer] = (repeatCustomers[customer] || 0) + 1;
      
      if (order.tableNumber) {
        tableUsage[order.tableNumber] = (tableUsage[order.tableNumber] || 0) + 1;
      }
    });

    const loyalCustomers = Object.entries(repeatCustomers)
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => ({ name, orderCount: count }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);

    const popularTables = Object.entries(tableUsage)
      .map(([table, count]) => ({ table, orderCount: count }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);

    res.json({
      period,
      totalCustomers,
      loyalCustomers,
      popularTables,
      averageOrdersPerCustomer: orders.length / totalCustomers
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ message: 'Server error while fetching customer insights' });
  }
};
