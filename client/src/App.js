import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
// import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import QRMenuViewer from './components/QRMenuViewer';
import KitchenDashboard from './components/KitchenDashboard';
import WaiterDashboard from './components/WaiterDashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Temporarily disable SocketProvider to prevent connection errors */}
        {/* <SocketProvider> */}
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/menu" 
                  element={
                    <ProtectedRoute>
                    <QRMenuViewer />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Kitchen Dashboard - can be accessed by kitchen staff */}
              <Route 
                path="/kitchen" 
                element={
                  <ProtectedRoute>
                    <KitchenDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Waiter Dashboard - can be accessed by waiter staff */}
              <Route 
                path="/waiter" 
                element={
                  <ProtectedRoute>
                    <WaiterDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Auth route alias for better UX */}
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              
              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      {/* </SocketProvider> */}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
