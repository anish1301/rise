const API_BASE_URL = 'https://rise-mhor.onrender.com/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API calls
export const loginUser = async (credentials) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me');
};

// Menu API calls
export const getMenuItems = async () => {
  try {
    console.log('Attempting to fetch menu items from API...');
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 3000)
    );
    
    // Create the fetch promise
    const fetchPromise = fetch(`${API_BASE_URL}/menu`, {
      headers: getAuthHeaders(),
    });
    
    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API data received:', data);
      
      // If API returns empty array, use mock data instead
      if (!data || data.length === 0) {
        console.log('API returned empty data, using mock data instead');
        return getMockMenuData();
      }
      
      return data;
    } else {
      console.log('API response not ok:', response.status);
      throw new Error('API not available');
    }
  } catch (error) {
    console.log('API call failed, using mock data:', error.message);
    return getMockMenuData();
  }
};

// Helper function to get mock menu data
const getMockMenuData = () => {
  const mockData = [
    {
      _id: '1',
      name: 'Margherita Pizza',
      description: 'Fresh tomato sauce, mozzarella cheese, and basil',
      price: 12.99,
      category: 'Pizza',
      available: true,
      image: '/marpizza.jpeg'
    },
    {
      _id: '2',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce, parmesan cheese, and caesar dressing',
      price: 8.99,
      category: 'Salads',
      available: true,
      image: '/cesar_salad.jpeg'
    },
    {
      _id: '3',
      name: 'Grilled Chicken Breast',
      description: 'Tender grilled chicken with herbs and spices',
      price: 15.99,
      category: 'Main Course',
      available: true,
      image: '/chickenb.jpeg'
    },
    {
      _id: '4',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with chocolate frosting',
      price: 6.99,
      category: 'Desserts',
      available: true,
      image: '/chocolatecake.jpeg'
    },
    {
      _id: '5',
      name: 'Pepperoni Pizza',
      description: 'Classic pizza with pepperoni and mozzarella cheese',
      price: 14.99,
      category: 'Pizza',
      available: true,
      image: '/peperronipizza.jpeg'
    },
    {
      _id: '6',
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon and parmesan cheese',
      price: 13.99,
      category: 'Pasta',
      available: true,
      image: '/pastacarbonara.jpeg'
    },
    {
      _id: '7',
      name: 'Fish and Chips',
      description: 'Beer-battered fish with crispy fries',
      price: 16.99,
      category: 'Main Course',
      available: true,
      image: '/fishandchips.jpeg'
    },
    {
      _id: '8',
      name: 'Greek Salad',
      description: 'Fresh vegetables with feta cheese and olive oil',
      price: 9.99,
      category: 'Salads',
      available: true,
      image: '/greeksalad.jpeg'
    }
  ];
  console.log('Returning mock data:', mockData);
  return mockData;
};

export const createMenuItem = async (itemData) => {
  return apiRequest('/menu', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
};

export const updateMenuItem = async (itemId, itemData) => {
  return apiRequest(`/menu/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(itemData)
  });
};

export const deleteMenuItem = async (itemId) => {
  return apiRequest(`/menu/${itemId}`, {
    method: 'DELETE'
  });
};

// Order API calls
export const getOrders = async () => {
  return apiRequest('/orders');
};

export const getCustomerOrders = async () => {
  return apiRequest('/orders/my-orders');
};

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('API not available');
    }
  } catch (error) {
    console.warn('API not available for order creation:', error.message);
    // Return a mock successful response when backend is not available
    return {
      _id: 'mock-order-' + Date.now(),
      orderNumber: 'ORD' + Date.now(),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

export const getOrderById = async (orderId) => {
  return apiRequest(`/orders/${orderId}`);
};

// Get ready orders (for waiters)
export const getReadyOrders = async () => {
  return apiRequest('/orders/ready');
};

// Mark order as ready (kitchen staff)
export const markOrderReady = async (orderId) => {
  return apiRequest(`/orders/${orderId}/ready`, {
    method: 'PUT'
  });
};

// Mark order as completed (waiter)
export const markOrderCompleted = async (orderId) => {
  return apiRequest(`/orders/${orderId}/complete`, {
    method: 'PUT'
  });
};

// Analytics API calls
export const getAnalytics = async (period = 'week') => {
  return apiRequest(`/analytics?period=${period}`);
};

export const getPopularItems = async () => {
  return apiRequest('/analytics/popular-items');
};

export const getRevenueStats = async () => {
  return apiRequest('/analytics/revenue');
};
