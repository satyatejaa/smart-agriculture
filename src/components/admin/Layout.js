import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiShoppingBag,
  FiLogOut,
  FiBarChart2
} from 'react-icons/fi';  // Removed FiSettings
import supabase from '../../services/supabase';
import './Layout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    getAdminInfo();
  }, []);

 const getAdminInfo = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    if (user) {
      const { data, error } = await supabase
        .from('farmers')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single
      
      if (error) {
        console.log('Admin profile not found yet');
      } else if (data) {
        setAdminName(data.full_name);
      }
    }
  } catch (error) {
    console.log('Admin info not available');
  }
};

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('admin-auth');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <p>Welcome, {adminName}</p>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiHome /> Dashboard
          </NavLink>
          
          <NavLink to="/admin/farmers" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiUsers /> Farmers
          </NavLink>
          
          <NavLink to="/admin/crops" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiPackage /> Crops
          </NavLink>
          
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiShoppingBag /> Products
          </NavLink>
          
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiPackage /> Orders
          </NavLink>
          
          <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiBarChart2 /> Reports
          </NavLink>
          {/* Settings link removed */}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div className="admin-main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;