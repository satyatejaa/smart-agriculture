import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './AdminPages.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'tool',
    subcategory: '',
    price: '',
    description: '',
    stock_quantity: '',
    safety_info: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      let result = products;
      if (searchTerm) {
        result = result.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory !== 'All') {
        result = result.filter(p => p.category === selectedCategory);
      }
      setFilteredProducts(result);
    }
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
      setFilteredProducts(data || []);
      
      const uniqueCats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products: ' + error.message);
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
  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  try {
    console.log('📤 Uploading:', fileName);
    
    const {  error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);
    
    if (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    console.log('✅ Uploaded, URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error: ' + error.message);
    return null;
  }
};

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.subcategory.trim()) {
      setError('Subcategory is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.stock_quantity || formData.stock_quantity < 0) {
      setError('Valid stock quantity is required');
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
      let imageUrl = editingProduct?.image_url || null;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory.trim().toLowerCase(),
        price: parseFloat(formData.price),
        description: formData.description?.trim() || null,
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: imageUrl,
        safety_info: formData.safety_info?.trim() || null
      };

      console.log('Saving product:', productData);

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
      }

      if (result.error) throw result.error;
      
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'tool',
      subcategory: product.subcategory || '',
      price: product.price || '',
      description: product.description || '',
      stock_quantity: product.stock_quantity || '',
      safety_info: product.safety_info || ''
    });
    setImagePreview(product.image_url);
    setShowModal(true);
    setError('');
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'tool',
      subcategory: '',
      price: '',
      description: '',
      stock_quantity: '',
      safety_info: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📦 Manage Products</h1>
        <button className="add-btn" onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
          ➕ Add New Product
        </button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="🔍 Search products..."
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

      {loading && products.length === 0 ? (
        <div className="loading">Loading products...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="table-image" />
                    ) : (
                      <div className="table-image-placeholder">
                        {product.category === 'tool' ? '🔧' : '🧪'}
                      </div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.subcategory}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock_quantity}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openEditModal(product)}>
                        ✏️ Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No products found
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
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: '20px' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
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
                    <option value="tool">Tool</option>
                    <option value="pesticide">Pesticide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subcategory *</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="e.g., irrigation, insecticide"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {formData.category === 'pesticide' && (
                <div className="form-group">
                  <label>Safety Information</label>
                  <textarea
                    name="safety_info"
                    value={formData.safety_info}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Warning: Wear gloves, toxic to bees, etc."
                  />
                </div>
              )}

              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="product-image"
                  />
                  <label htmlFor="product-image" style={{ cursor: 'pointer' }}>
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

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
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

export default AdminProducts;