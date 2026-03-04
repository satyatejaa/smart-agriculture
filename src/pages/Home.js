import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>🌱 Smart Agriculture Monitoring System</h1>
        <p>Choose your login type to continue</p>
        
        <div className="login-options">
          {/* Farmer Login Card */}
          <div className="login-option-card farmer" onClick={() => navigate('/farmer/login')}>
            <div className="option-icon">👨‍🌾</div>
            <h2>Farmer Login</h2>
            <p>Access your farm dashboard, check weather, browse crops, and shop for tools & pesticides</p>
            <button className="farmer-btn">Continue as Farmer →</button>
          </div>

          {/* Admin Login Card */}
          <div className="login-option-card admin" onClick={() => navigate('/admin/login')}>
            <div className="option-icon">👨‍💼</div>
            <h2>Admin Login</h2>
            <p>Manage farmers, crops, products, orders, and view system analytics</p>
            <button className="admin-btn">Continue as Admin →</button>
          </div>
        </div>

        <div className="home-footer">
          <p>Smart Agriculture Management System v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Home;