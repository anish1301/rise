import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Utensils, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Floating Element Component
  const FloatingElement = ({ children, delay = 0, className = '' }) => {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: -50,
          rotate: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotate: 0,
        }}
        transition={{
          duration: 2,
          delay,
          ease: [0.23, 0.86, 0.39, 0.96],
        }}
        className={className}
        style={{ position: 'fixed' }}
      >
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  };

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3 + i * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'kitchen') {
        navigate('/kitchen');
      } else if (user?.role === 'waiter') {
        navigate('/waiter');
      } else {
        navigate('/menu');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modern-login-container">
      {/* Background Glow Effects */}
      <div className="glow-effect"></div>
      <div className="glow-effect-secondary"></div>

      {/* Floating Restaurant Elements */}
      <FloatingElement delay={0.5} className="floating-chef">
        <ChefHat size={80} />
      </FloatingElement>

      <FloatingElement delay={0.7} className="floating-utensils">
        <Utensils size={60} />
      </FloatingElement>

      <FloatingElement delay={0.9} className="floating-circle-1">
        <div className="floating-circle bg-gradient-orange"></div>
      </FloatingElement>

      <FloatingElement delay={1.1} className="floating-circle-2">
        <div className="floating-circle bg-gradient-amber"></div>
      </FloatingElement>

      {/* Additional decorative elements */}
      <div className="decorative-blur blur-orange"></div>
      <div className="decorative-blur blur-amber"></div>

      {/* Main Content */}
      <div className="login-content-wrapper">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="modern-login-card"
        >
          {/* Header */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="login-header"
          >
            <div className="restaurant-logo">
              <ChefHat className="logo-icon" />
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to your restaurant account</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modern-login-form">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="error-message modern-error"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="form-fields"
            >
              <div className="modern-form-group">
                <label htmlFor="username" className="modern-label">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="chef@restaurant.com"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              <div className="modern-form-group">
                <label htmlFor="password" className="modern-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="modern-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="form-actions"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="modern-submit-btn"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="divider">
                <span>Or continue with</span>
              </div>

              <button type="button" className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>

            <motion.div
              custom={5}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="signup-link"
            >
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/register')}
                className="link-button"
              >
                Sign up
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Overlay gradient */}
      <div className="overlay-gradient"></div>
    </div>
  );
};

export default Login;
