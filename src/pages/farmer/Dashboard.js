import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabase';
import './Dashboard.css';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState('');
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalTools: 0,
    totalPesticides: 0,
    totalOrders: 0
  });
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [greeting, setGreeting] = useState('');

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const fetchFarmerName = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user); // Debug log
      
      if (user) {
        const { data, error } = await supabase
          .from('farmers')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        console.log('Farmer data:', data); // Debug log
        
        if (error) {
          console.error('Error fetching farmer:', error);
        } else if (data && data.full_name) {
          // Get first name only
          const firstName = data.full_name.split(' ')[0];
          setFarmerName(firstName);
        } else {
          // Fallback if no name found
          setFarmerName('Farmer');
        }
      }
    } catch (error) {
      console.error('Error fetching farmer name:', error);
      setFarmerName('Farmer');
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { count: cropsCount } = await supabase
        .from('crops')
        .select('*', { count: 'exact', head: true });

      const { count: toolsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'tool');

      const { count: pesticidesCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'pesticide');

      const { data: cropsData } = await supabase
        .from('crops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      setStats({
        totalCrops: cropsCount || 0,
        totalTools: toolsCount || 0,
        totalPesticides: pesticidesCount || 0,
        totalOrders: 0
      });

      setRecentCrops(cropsData || []);
      setRecentProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Delhi&units=metric&appid=671552ed0a83d9281238d13fe1b64015`
      );
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchFarmerName(),
        fetchWeather()
      ]);
      setGreeting(getGreeting());
      setLoading(false);
    };

    loadDashboard();
  }, [fetchDashboardData, fetchFarmerName, fetchWeather, getGreeting]);

  const getCropIcon = (category) => {
    const icons = {
      'Vegetable': '🥬',
      'Grain': '🌾',
      'Fruit': '🍎',
      'Herb': '🌿',
      'Leafy': '🥬',
      'Spice': '🌶️',
      'Fiber': '🌿'
    };
    return icons[category] || '🌱';
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your farm data...</div>;
  }

  return (
    <div className="dashboard">
      {/* Welcome Section with Gradient */}
      <div className="welcome-card">
        <div className="welcome-content">
          <h1>
            {greeting}, <span className="farmer-name">{farmerName || 'Farmer'}</span>! 👋
          </h1>
          <p className="welcome-subtitle">Here's what's happening with your farm today</p>
        </div>
        {weather && (
          <div className="weather-widget" onClick={() => navigate('/farmer/weather')}>
            <div className="weather-icon-large">
              {weather.weather[0].main === 'Clear' && '☀️'}
              {weather.weather[0].main === 'Clouds' && '☁️'}
              {weather.weather[0].main === 'Rain' && '🌧️'}
            </div>
            <div className="weather-info">
              <span className="weather-temp">{Math.round(weather.main.temp)}°C</span>
              <span className="weather-city">{weather.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-modern">
        <div className="stat-card-modern crops" onClick={() => navigate('/farmer/crops')}>
          <div className="stat-icon-wrapper">
            <span className="stat-icon">🌾</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Crops</span>
            <span className="stat-value">{stats.totalCrops}</span>
          </div>
          <div className="stat-trend">+12% this month</div>
        </div>

        <div className="stat-card-modern tools" onClick={() => navigate('/farmer/tools')}>
          <div className="stat-icon-wrapper">
            <span className="stat-icon">🔧</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Farm Tools</span>
            <span className="stat-value">{stats.totalTools}</span>
          </div>
          <div className="stat-trend">8 available</div>
        </div>

        <div className="stat-card-modern pesticides" onClick={() => navigate('/farmer/pesticides')}>
          <div className="stat-icon-wrapper">
            <span className="stat-icon">🧪</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Pesticides</span>
            <span className="stat-value">{stats.totalPesticides}</span>
          </div>
          <div className="stat-trend">5 new this week</div>
        </div>

        <div className="stat-card-modern orders" onClick={() => navigate('/farmer/orders')}>
          <div className="stat-icon-wrapper">
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Orders</span>
            <span className="stat-value">{stats.totalOrders}</span>
          </div>
          <div className="stat-trend">No pending orders</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-modern">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button className="action-card weather" onClick={() => navigate('/farmer/weather')}>
            <span className="action-icon">🌤️</span>
            <span className="action-text">Check Weather</span>
          </button>
          <button className="action-card crops" onClick={() => navigate('/farmer/crops')}>
            <span className="action-icon">🌾</span>
            <span className="action-text">Browse Crops</span>
          </button>
          <button className="action-card tools" onClick={() => navigate('/farmer/tools')}>
            <span className="action-icon">🔧</span>
            <span className="action-text">Shop Tools</span>
          </button>
          <button className="action-card pesticides" onClick={() => navigate('/farmer/pesticides')}>
            <span className="action-icon">🧪</span>
            <span className="action-text">Shop Pesticides</span>
          </button>
        </div>
      </div>

      {/* Recent Sections */}
      <div className="recent-sections">
        <div className="recent-section">
          <div className="section-header">
            <h2>Recently Added Crops</h2>
            <button className="view-all-btn" onClick={() => navigate('/farmer/crops')}>
              View All <span>→</span>
            </button>
          </div>
          <div className="recent-grid">
            {recentCrops.length > 0 ? (
              recentCrops.map(crop => (
                <div 
                  key={crop.id} 
                  className="recent-item"
                  onClick={() => navigate(`/farmer/crop/${crop.id}`)}
                >
                  <div className="recent-icon">{getCropIcon(crop.category)}</div>
                  <div className="recent-details">
                    <h4>{crop.name}</h4>
                    <p>{crop.category}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No crops added yet</p>
            )}
          </div>
        </div>

        <div className="recent-section">
          <div className="section-header">
            <h2>Recently Added Products</h2>
            <button className="view-all-btn" onClick={() => navigate('/farmer/tools')}>
              View All <span>→</span>
            </button>
          </div>
          <div className="recent-grid">
            {recentProducts.length > 0 ? (
              recentProducts.map(product => (
                <div 
                  key={product.id} 
                  className="recent-item"
                  onClick={() => navigate(`/farmer/${product.category === 'tool' ? 'tools' : 'pesticides'}`)}
                >
                  <div className="recent-icon">{product.category === 'tool' ? '🔧' : '🧪'}</div>
                  <div className="recent-details">
                    <h4>{product.name}</h4>
                    <p>₹{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No products added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;