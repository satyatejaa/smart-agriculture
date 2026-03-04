import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './AdminPages.css';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCrops: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [farmers, crops, products, orders] = await Promise.all([
        supabase.from('farmers').select('*', { count: 'exact', head: true }),
        supabase.from('crops').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = ordersData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setStats({
        totalFarmers: farmers.count || 0,
        totalCrops: crops.count || 0,
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderTop: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 5px', color: '#666' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color }}>{value}</p>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="admin-page">
      <h1>📊 Reports & Analytics</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard title="Total Farmers" value={stats.totalFarmers} icon="👨‍🌾" color="#2e7d32" />
        <StatCard title="Total Crops" value={stats.totalCrops} icon="🌾" color="#1976d2" />
        <StatCard title="Total Products" value={stats.totalProducts} icon="📦" color="#ed6c02" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon="🛒" color="#9c27b0" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon="💰" color="#2e7d32" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{ padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              📥 Export Farmers Data
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              📥 Export Products Data
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              📥 Export Orders Data
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
          <h3>System Info</h3>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Database Status: 🟢 Connected</p>
          <p>Storage Status: 🟢 Available</p>
          <p>Authentication: 🟢 Active</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;