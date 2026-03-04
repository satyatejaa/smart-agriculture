import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiCloud, 
  FiGrid, 
  FiTool, 
  FiPackage,
  FiShoppingCart,
  FiMenu,
  FiX
} from 'react-icons/fi';
import ProfileDropdown from './ProfileDropdown';
import './Layout.css';

const FarmerLayout = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="farmer-layout">
      {/* Hamburger Menu Button - Always visible now */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🌱 Smart Farm</h2>
          <button className="close-sidebar-btn" onClick={closeSidebar}>
            <FiX />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/farmer/dashboard" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <FiHome /> Dashboard
          </NavLink>
          <NavLink 
            to="/farmer/weather" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <FiCloud /> Weather Report
          </NavLink>
          <NavLink 
            to="/farmer/crops" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <FiGrid /> Crops
          </NavLink>
          <NavLink 
            to="/farmer/tools" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <FiTool /> Tools
          </NavLink>
          <NavLink 
            to="/farmer/pesticides" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={closeSidebar}
          >
            <FiPackage /> Pesticides
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="cart-icon" onClick={() => {
            navigate('/farmer/checkout');
            closeSidebar();
          }}>
            <FiShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Bar with Profile */}
        <div className="top-bar">
          <div className="top-bar-right">
            <ProfileDropdown />
          </div>
        </div>
        
        {/* Page Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FarmerLayout;