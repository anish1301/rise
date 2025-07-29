import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedChart, setSelectedChart] = useState('all');
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const ordersData = await getOrders();
        
        // Filter orders based on selected period
        const filteredOrders = filterOrdersByPeriod(ordersData, selectedPeriod);
        setOrders(filteredOrders);
        
        // Trigger animation after data is loaded
        setTimeout(() => setAnimateCharts(true), 200);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedPeriod]);

  useEffect(() => {
    // Reset animation when chart selection changes
    setAnimateCharts(false);
    const timer = setTimeout(() => setAnimateCharts(true), 100);
    return () => clearTimeout(timer);
  }, [selectedChart]);

  const filterOrdersByPeriod = (orders, period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return orders;
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  };

  const getHourlyOrderData = () => {
    const hourlyData = Array(24).fill(0);
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour]++;
    });

    return hourlyData.map((count, hour) => ({
      hour,
      count,
      time: `${hour.toString().padStart(2, '0')}:00`
    }));
  };

  const getRevenueByHour = () => {
    const hourlyRevenue = Array(24).fill(0);
    
    orders.forEach(order => {
      if (order.status === 'completed') {
        const hour = new Date(order.createdAt).getHours();
        hourlyRevenue[hour] += order.total;
      }
    });

    return hourlyRevenue;
  };

  const getChartData = () => {
    const hourlyOrderData = getHourlyOrderData();
    const hourlyRevenue = getRevenueByHour();
    const statusData = getOrderStatusBreakdown();
    const popularItemsData = getPopularItems();

    // Histogram data for orders by hour
    const histogramData = {
      labels: hourlyOrderData.map(data => data.time),
      datasets: [
        {
          label: 'Orders',
          data: hourlyOrderData.map(data => data.count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Revenue ($)',
          data: hourlyRevenue,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ],
    };

    // Pie chart data for order status
    const statusPieData = {
      labels: Object.keys(statusData).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          data: Object.values(statusData),
          backgroundColor: [
            '#FF9800', // pending
            '#2196F3', // preparing
            '#4CAF50', // ready
            '#9E9E9E', // completed
            '#F44336', // cancelled
          ],
          borderColor: [
            '#E68900',
            '#1976D2',
            '#388E3C',
            '#757575',
            '#D32F2F',
          ],
          borderWidth: 2,
        },
      ],
    };

    // Pie chart data for popular items
    const itemsPieData = {
      labels: popularItemsData.map(item => item.name),
      datasets: [
        {
          data: popularItemsData.map(item => item.count),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
          borderColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
          borderWidth: 2,
        },
      ],
    };

    return { histogramData, statusPieData, itemsPieData };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Hour of Day'
        }
      }
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  const getRevenueStats = () => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    return {
      totalRevenue,
      averageOrderValue,
      completedOrders: completedOrders.length,
      totalOrders: orders.length
    };
  };

  const getPopularItems = () => {
    const itemCounts = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }
      });
    });

    return Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  const getOrderStatusBreakdown = () => {
    const statusCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      statusCounts[order.status]++;
    });

    return statusCounts;
  };

  const renderSelectedChart = () => {
    const { histogramData, statusPieData, itemsPieData } = getChartData();
    const isSingleChart = selectedChart !== 'all';
    const chartHeight = isSingleChart ? '500px' : '400px';
    const chartClassName = `chart-container ${isSingleChart ? 'expanded' : ''} ${animateCharts ? 'animate' : ''}`;
    
    switch (selectedChart) {
      case 'histogram':
        return (
          <div className={chartClassName}>
            <h3>Orders and Revenue by Time of Day</h3>
            <div style={{ height: chartHeight }}>
              <Bar data={histogramData} options={chartOptions} />
            </div>
          </div>
        );
      
      case 'status':
        return (
          <div className={chartClassName}>
            <h3>Order Status Distribution</h3>
            <div style={{ height: chartHeight }}>
              <Pie data={statusPieData} options={pieOptions} />
            </div>
          </div>
        );
      
      case 'items':
        return popularItems.length > 0 ? (
          <div className={chartClassName}>
            <h3>Most Popular Items</h3>
            <div style={{ height: chartHeight }}>
              <Pie data={itemsPieData} options={pieOptions} />
            </div>
          </div>
        ) : (
          <div className={chartClassName}>
            <h3>Most Popular Items</h3>
            <div style={{ height: chartHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '18px', color: 'var(--text-secondary)' }}>No orders yet to show popular items.</p>
            </div>
          </div>
        );
      
      case 'all':
      default:
        return (
          <>
            {/* Histogram - Orders and Revenue by Hour */}
            <div className={`chart-container ${animateCharts ? 'animate' : ''}`}>
              <h3>Orders and Revenue by Time of Day</h3>
              <div style={{ height: chartHeight }}>
                <Bar data={histogramData} options={chartOptions} />
              </div>
            </div>

            {/* Pie Chart - Order Status Breakdown */}
            <div className={`chart-container ${animateCharts ? 'animate' : ''}`}>
              <h3>Order Status Distribution</h3>
              <div style={{ height: chartHeight }}>
                <Pie data={statusPieData} options={pieOptions} />
              </div>
            </div>

            {/* Pie Chart - Popular Items */}
            {popularItems.length > 0 && (
              <div className={`chart-container ${animateCharts ? 'animate' : ''}`}>
                <h3>Most Popular Items</h3>
                <div style={{ height: chartHeight }}>
                  <Pie data={itemsPieData} options={pieOptions} />
                </div>
              </div>
            )}
          </>
        );
    }
  };

  const revenueStats = getRevenueStats();
  const popularItems = getPopularItems();

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="controls-section">
          <div className="period-selector">
            <label>Period:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="chart-selector">
            <label>Charts:</label>
            <select 
              value={selectedChart} 
              onChange={(e) => setSelectedChart(e.target.value)}
            >
              <option value="all">All Charts</option>
              <option value="histogram">Orders & Revenue Timeline</option>
              <option value="status">Order Status Distribution</option>
              <option value="items">Popular Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <span className="metric-value">${revenueStats.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <h3>Total Orders</h3>
          <span className="metric-value">{revenueStats.totalOrders}</span>
        </div>
        <div className="metric-card">
          <h3>Completed Orders</h3>
          <span className="metric-value">{revenueStats.completedOrders}</span>
        </div>
        <div className="metric-card">
          <h3>Average Order Value</h3>
          <span className="metric-value">${revenueStats.averageOrderValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className={`charts-section ${selectedChart !== 'all' ? 'single-chart' : ''}`}>
        {renderSelectedChart()}
      </div>

      {/* Popular Items */}
      <div className="popular-items-section">
        <h3>Popular Items</h3>
        <div className="popular-items-list">
          {popularItems.length > 0 ? (
            popularItems.map((item, index) => (
              <div key={item.name} className="popular-item">
                <span className="item-rank">#{index + 1}</span>
                <span className="item-name">{item.name}</span>
                <span className="item-count">{item.count} sold</span>
              </div>
            ))
          ) : (
            <p>No orders yet to show popular items.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
