import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './AdminPages.css';

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    if (farmers.length > 0) {
      let result = farmers;
      if (searchTerm) {
        result = result.filter(f => 
          f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.phone?.includes(searchTerm)
        );
      }
      setFilteredFarmers(result);
    }
  }, [searchTerm, farmers]);

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFarmers(data || []);
      setFilteredFarmers(data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farmer?')) return;
    
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setFarmers(farmers.filter(f => f.id !== id));
      alert('Farmer deleted successfully!');
    } catch (error) {
      console.error('Error deleting farmer:', error);
      alert('Error deleting farmer');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>👨‍🌾 Manage Farmers</h1>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading farmers...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Farm Size</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFarmers.map(farmer => (
              <tr key={farmer.id}>
                <td>{farmer.full_name || 'N/A'}</td>
                <td>{farmer.email || 'N/A'}</td>
                <td>{farmer.phone || 'N/A'}</td>
                <td>{farmer.location || 'N/A'}</td>
                <td>{farmer.farm_size || 'N/A'} acres</td>
                <td>{new Date(farmer.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="delete-btn" onClick={() => handleDelete(farmer.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminFarmers;