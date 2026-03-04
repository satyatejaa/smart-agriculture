import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabase';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get counts from all tables
      const [farmersResult, cropsResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('farmers').select('*', { count: 'exact', head: true }),
        supabase.from('crops').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      // Get pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate total revenue from orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalFarmers: farmersResult.count || 0,
        totalCrops: cropsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        pendingOrders: pendingCount || 0,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card farmers" onClick={() => handleNavigation('farmers')}>
          <div className="stat-icon">👨‍🌾</div>
          <div className="stat-content">
            <h3>Total Farmers</h3>
            <p className="stat-number">{stats.totalFarmers}</p>
          </div>
        </div>
        
        <div className="stat-card crops" onClick={() => handleNavigation('crops')}>
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>Total Crops</h3>
            <p className="stat-number">{stats.totalCrops}</p>
          </div>
        </div>
        
        <div className="stat-card products" onClick={() => handleNavigation('products')}>
          <div className="stat-icon">🛠️</div>
          <div className="stat-content">
            <h3>Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card orders" onClick={() => handleNavigation('orders')}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <p className="stat-number">₹{stats.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => handleNavigation('crops')}>
            ➕ Add New Crop
          </button>
          <button onClick={() => handleNavigation('products')}>
            ➕ Add New Product
          </button>
          <button onClick={() => handleNavigation('farmers')}>
            👥 View All Farmers
          </button>
          <button onClick={() => handleNavigation('orders')}>
            📋 Manage Orders
          </button>
          <button onClick={() => handleNavigation('reports')}>
            📊 View Reports
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">Just now</span>
            <span className="activity-text">Dashboard loaded successfully</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">Today</span>
            <span className="activity-text">{stats.totalOrders} orders to process</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">Today</span>
            <span className="activity-text">{stats.totalFarmers} active farmers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;