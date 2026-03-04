import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './AdminPages.css';

const AdminCrops = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    season: '',
    duration_days: '',
    guide: ''
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (crops.length > 0) {
      let result = crops;
      if (searchTerm) {
        result = result.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory !== 'All') {
        result = result.filter(c => c.category === selectedCategory);
      }
      setFilteredCrops(result);
    }
  }, [searchTerm, selectedCategory, crops]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCrops(data || []);
      setFilteredCrops(data || []);
      
      const uniqueCats = ['All', ...new Set(data.map(c => c.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (error) {
      console.error('Error fetching crops:', error);
      alert('Error fetching crops: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `crops/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    try {
      console.log('📤 Uploading crop image:', fileName);
      
      const { error } = await supabase.storage
        .from('crop-images')
        .upload(fileName, imageFile);
      
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName);
      
      console.log('✅ Image uploaded, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
      return null;
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Crop name is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.season.trim()) {
      setError('Season is required');
      return false;
    }
    if (!formData.duration_days || formData.duration_days <= 0) {
      setError('Valid duration is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      let imageUrl = editingCrop?.image_url || null;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const cropData = {
        name: formData.name.trim(),
        category: formData.category,
        season: formData.season.trim(),
        duration_days: parseInt(formData.duration_days),
        guide: formData.guide || null,
        image_url: imageUrl
      };

      console.log('Saving crop:', cropData);

      let result;
      if (editingCrop) {
        result = await supabase
          .from('crops')
          .update(cropData)
          .eq('id', editingCrop.id)
          .select();
      } else {
        result = await supabase
          .from('crops')
          .insert([cropData])
          .select();
      }

      if (result.error) throw result.error;
      
      alert(editingCrop ? 'Crop updated successfully!' : 'Crop added successfully!');
      
      setShowModal(false);
      resetForm();
      fetchCrops();
    } catch (error) {
      console.error('Error saving crop:', error);
      setError('Error saving crop: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCrops(crops.filter(c => c.id !== id));
      alert('Crop deleted successfully!');
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Error deleting crop: ' + error.message);
    }
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name || '',
      category: crop.category || '',
      season: crop.season || '',
      duration_days: crop.duration_days || '',
      guide: typeof crop.guide === 'string' ? crop.guide : JSON.stringify(crop.guide || '')
    });
    setImagePreview(crop.image_url);
    setShowModal(true);
    setError('');
  };

  const resetForm = () => {
    setEditingCrop(null);
    setFormData({
      name: '',
      category: '',
      season: '',
      duration_days: '',
      guide: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>🌾 Manage Crops</h1>
        <button className="add-btn" onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          ➕ Add New Crop
        </button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading && crops.length === 0 ? (
        <div className="loading">Loading crops...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Season</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrops.length > 0 ? (
              filteredCrops.map(crop => (
                <tr key={crop.id}>
                  <td>
                    {crop.image_url ? (
                      <img src={crop.image_url} alt={crop.name} className="table-image" />
                    ) : (
                      <div className="table-image-placeholder">🌾</div>
                    )}
                  </td>
                  <td>{crop.name}</td>
                  <td>{crop.category}</td>
                  <td>{crop.season}</td>
                  <td>{crop.duration_days} days</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openEditModal(crop)}>
                        ✏️ Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(crop.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No crops found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '20px' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Crop Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grain">Grain</option>
                    <option value="Herb">Herb</option>
                    <option value="Spice">Spice</option>
                    <option value="Leafy">Leafy</option>
                    <option value="Fiber">Fiber</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Season *</label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    placeholder="e.g., Rabi, Kharif, All season"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Duration (days) *</label>
                <input
                  type="number"
                  name="duration_days"
                  value={formData.duration_days}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Crop Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="crop-image"
                  />
                  <label htmlFor="crop-image" style={{ cursor: 'pointer' }}>
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    ) : (
                      <div>📸 Click to upload image</div>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Guide (JSON format)</label>
                <textarea
                  name="guide"
                  value={formData.guide}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder='{"stages": ["stage1", "stage2"], "soil": "soil requirements", "watering": "watering needs"}'
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingCrop ? 'Update Crop' : 'Add Crop')}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
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

export default AdminCrops;