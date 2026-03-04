import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Login.css';

// Initialize Supabase
const supabaseUrl = 'https://wytdbpaaloxpyrkucyxt.supabase.co';
const supabaseKey = 'sb_publishable_2plwUslHaB-0i0XaxHtHqw_NjCQAwB2';
const supabase = createClient(supabaseUrl, supabaseKey);

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    farmSize: '',
    location: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Store farmer session
      localStorage.setItem('farmer-auth', JSON.stringify(data.session));
      navigate('/farmer/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Register farmer with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'farmer'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create farmer profile in farmers table
        const { error: profileError } = await supabase
          .from('farmers')
          .insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              phone: formData.phone,
              farm_size: formData.farmSize ? parseFloat(formData.farmSize) : null,
              location: formData.location,
              preferred_language: 'en'
            }
          ]);

        if (profileError) throw profileError;
      }

      setSuccess('Registration successful! You can now login.');
      setIsLogin(true);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        farmSize: '',
        location: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container farmer-login-bg">
      <div className="login-card farmer-card">
        <div className="login-header">
          <h1>🌱 Farmer Portal</h1>
          <h2>{isLogin ? 'Welcome Back' : 'Join as Farmer'}</h2>
          <p>{isLogin ? 'Login to manage your farm' : 'Create your farmer account'}</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Farm Size (acres)</label>
                  <input
                    type="number"
                    name="farmSize"
                    placeholder="e.g., 5"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City/Village"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
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

          {isLogin && (
            <div className="forgot-password">
              <button type="button" className="forgot-password-btn">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login as Farmer' : 'Register as Farmer')}
          </button>
        </form>

        <div className="toggle-text">
          {isLogin ? "New farmer? " : "Already registered? "}
          <button 
            className="toggle-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Create account' : 'Login'}
          </button>
        </div>

        <div className="back-link">
          <Link to="/admin/login">← Admin login</Link>
        </div>
      </div>
    </div>
  );
};

export default FarmerLogin;