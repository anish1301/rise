import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="user-profile">
      <button 
        className="profile-button"
        onClick={toggleDropdown}
        aria-label="User menu"
      >
        <div className="profile-avatar">
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="profile-name">{user.username}</span>
        <svg 
          className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <strong>{user.username}</strong>
              <span className="user-role">{user.role}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item theme-toggle-item">
            <span>Theme</span>
            <ThemeToggle />
          </div>
          <div className="dropdown-divider"></div>
          <button 
            className="dropdown-item logout-btn"
            onClick={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
