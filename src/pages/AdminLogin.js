import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ONLY THIS ONE USER CAN LOGIN
    if (formData.email === 'adminteja@gmail.com' && formData.password === 'admin123') {
      localStorage.setItem('admin-auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Only adminteja@gmail.com can access.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container admin-login-bg">
      <div className="login-card admin-card">
        <div className="login-header">
          <h1>👨‍💼 Admin Portal</h1>
          <p>Authorized access only</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="adminteja@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Login as Admin'}
          </button>
        </form>

        <div className="back-link">
          <Link to="/farmer/login">← Farmer Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;