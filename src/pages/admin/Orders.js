import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './AdminPages.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      let result = orders;
      if (searchTerm) {
        result = result.filter(o => 
          o.id.toString().includes(searchTerm) ||
          o.farmer_id?.includes(searchTerm)
        );
      }
      if (selectedStatus !== 'All') {
        result = result.filter(o => o.status === selectedStatus);
      }
      setFilteredOrders(result);
    }
  }, [searchTerm, selectedStatus, orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrders(orders.map(o => 
        o.id === id ? { ...o, status: newStatus } : o
      ));
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#ffc107', text: 'Pending' },
      processing: { color: '#17a2b8', text: 'Processing' },
      shipped: { color: '#007bff', text: 'Shipped' },
      delivered: { color: '#28a745', text: 'Delivered' },
      cancelled: { color: '#dc3545', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return <span style={{ 
      background: badge.color, 
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    }}>{badge.text}</span>;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📋 Manage Orders</h1>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Search by Order ID or Farmer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Farmer ID</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.farmer_id?.substring(0, 8)}...</td>
                <td>₹{order.total_amount}</td>
                <td>{order.payment_method}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <select 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    value={order.status}
                    style={{ padding: '6px', borderRadius: '4px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;