import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabase';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [farmer, setFarmer] = useState(null);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    farm_size: '',
    location: ''
  });

  // Wrap fetchFarmerProfile in useCallback to prevent recreation on every render
  const fetchFarmerProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('farmers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFarmer(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            farm_size: data.farm_size || '',
            location: data.location || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []); // Empty dependencies since it doesn't use any props/state

  useEffect(() => {
    fetchFarmerProfile();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchFarmerProfile]); // Now fetchFarmerProfile is stable due to useCallback

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('farmers')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            farm_size: formData.farm_size ? parseFloat(formData.farm_size) : null,
            location: formData.location
          })
          .eq('id', user.id);

        if (error) throw error;

        await fetchFarmerProfile();
        
        alert('Profile updated successfully!');
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('farmer-auth');
    supabase.auth.signOut();
    navigate('/farmer/login');
  };

  const getInitials = () => {
    if (farmer?.full_name) {
      return farmer.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return 'F';
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <div className="profile-icon" onClick={() => setIsOpen(!isOpen)}>
        {farmer?.avatar_url ? (
          <img src={farmer.avatar_url} alt="Profile" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">
            {getInitials()}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <strong>{farmer?.full_name || 'Farmer'}</strong>
            <small>{farmer?.email || ''}</small>
          </div>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item" onClick={() => {
            setShowEditModal(true);
            setIsOpen(false);
          }}>
            👤 Edit Profile
          </button>
          <button className="dropdown-item" onClick={() => {
            navigate('/farmer/dashboard');
            setIsOpen(false);
          }}>
            📊 Dashboard
          </button>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Farm Size (acres)</label>
                <input
                  type="number"
                  name="farm_size"
                  value={formData.farm_size}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City/Village"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={updating}>
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;