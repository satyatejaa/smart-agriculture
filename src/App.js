import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Home
import Home from './pages/Home';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import FarmerLogin from './pages/FarmerLogin';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerWeather from './pages/farmer/Weather';
import FarmerCrops from './pages/farmer/Crops';
import FarmerCropDetail from './pages/farmer/CropDetail';
import FarmerTools from './pages/farmer/Tools';
import FarmerPesticides from './pages/farmer/Pesticides';
import FarmerCheckout from './pages/farmer/Checkout';
import FarmerLayout from './components/farmer/Layout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminFarmers from './pages/admin/Farmers';
import AdminCrops from './pages/admin/Crops';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminReports from './pages/admin/Reports';
import AdminLayout from './components/admin/Layout';

// Protected Route Components
const FarmerProtectedRoute = ({ children }) => {
  const farmer = localStorage.getItem('farmer-auth');
  if (!farmer) {
    return <Navigate to="/farmer/login" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem('admin-auth');
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/farmer/login" element={<FarmerLogin />} />

        {/* Protected Farmer Routes */}
        <Route path="/farmer" element={
          <FarmerProtectedRoute>
            <FarmerLayout />
          </FarmerProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="weather" element={<FarmerWeather />} />
          <Route path="crops" element={<FarmerCrops />} />
          <Route path="crop/:id" element={<FarmerCropDetail />} />
          <Route path="tools" element={<FarmerTools />} />
          <Route path="pesticides" element={<FarmerPesticides />} />
          <Route path="checkout" element={<FarmerCheckout />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="crops" element={<AdminCrops />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;