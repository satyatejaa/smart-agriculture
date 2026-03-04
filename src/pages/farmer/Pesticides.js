import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabase';
import './Pesticides.css';

const FarmerPesticides = () => {
  const navigate = useNavigate();
  const [pesticides, setPesticides] = useState([]);
  const [filteredPesticides, setFilteredPesticides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchPesticides();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  async function fetchPesticides() {
    setLoading(true);
    try {
      console.log('📡 Fetching pesticides...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'pesticide')
        .order('name');
      
      console.log('📦 Pesticides response:', { data, error });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} pesticides`);
        setPesticides(data);
        setFilteredPesticides(data);
        
        // Extract unique subcategories (insecticide, fungicide, etc.)
        const uniqueCats = ['All', ...new Set(data.map(p => p.subcategory).filter(Boolean))];
        setCategories(uniqueCats);
      } else {
        console.log('⚠️ No pesticides found');
        setPesticides([]);
        setFilteredPesticides([]);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle search and filter
  useEffect(() => {
    if (pesticides.length > 0) {
      let result = pesticides;
      
      if (searchTerm) {
        result = result.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.safety_info && p.safety_info.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (selectedCategory !== 'All') {
        result = result.filter(p => p.subcategory === selectedCategory);
      }
      
      setFilteredPesticides(result);
    }
  }, [searchTerm, selectedCategory, pesticides]);

  const addToCart = (pesticide) => {
    const existingItem = cart.find(item => item.id === pesticide.id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === pesticide.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...pesticide, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Show feedback
    alert(`✅ ${pesticide.name} added to cart!`);
  };

  const removeFromCart = (pesticideId) => {
    const newCart = cart.filter(item => item.id !== pesticideId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (pesticideId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(pesticideId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === pesticideId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalWithShipping = () => {
    return getTotalPrice() + 50; // Add ₹50 shipping
  };

  // Function to get image path based on pesticide name
  const getPesticideImage = (pesticideName) => {
    // Map pesticide names to image filenames
    const imageMap = {
      'Bacillus Thuringiensis': '1.png',
      'Chlorpyrifos': '2.png',
      'Copper Oxychloride': '3.png',
      'Copper Oxychloride (500g)': '4.png',
      'Cypermethrin': '5.png',
      'Emamectin Benzoate': '6.png',
      'Imidacloprid': '7.png',
      'Mancozeb': '8.png',
      'Neem Oil': '9.png',
      'Neem Oil (1L)': '10.png',
      'Propiconazole': '11.png',
      'Sulfur Spray': '12.png'
    };

    return imageMap[pesticideName] || 'default.png';
  };

  // Handle image error
  const handleImageError = (pesticideId) => {
    setImageErrors(prev => ({ ...prev, [pesticideId]: true }));
  };

  return (
    <div className="pesticides-page">
      <div className="pesticides-header">
        <h1>🧪 Pesticides & Agrochemicals</h1>
        <button 
          className="cart-button"
          onClick={() => setShowCart(!showCart)}
        >
          🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>
      
      {/* Safety Notice */}
      <div className="safety-notice">
        <span className="warning-icon">⚠️</span>
        <p>Always wear protective gear (gloves, mask) when handling pesticides. Follow instructions carefully.</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="pesticides-filters">
        <input
          type="text"
          placeholder="🔍 Search pesticides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>Shopping Cart ({cart.length} items)</h3>
            <button onClick={() => setShowCart(false)}>×</button>
          </div>
          
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="cart-item-actions">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>₹50</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>₹{getTotalWithShipping()}</span>
                </div>
                
                <button 
                  className="checkout-btn"
                  onClick={() => {
                    setShowCart(false);
                    navigate('/farmer/checkout');
                  }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pesticides Grid */}
      {loading ? (
        <div className="loading">Loading pesticides...</div>
      ) : (
        <div className="pesticides-grid">
          {filteredPesticides.length > 0 ? (
            filteredPesticides.map(pesticide => (
              <div key={pesticide.id} className="pesticide-card">
                <div className="pesticide-image">
                  {!imageErrors[pesticide.id] ? (
                    <img 
                      src={`/images/pesticides/${getPesticideImage(pesticide.name)}`}
                      alt={pesticide.name}
                      className="pesticide-img"
                      onError={() => handleImageError(pesticide.id)}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>🧪</span>
                    </div>
                  )}
                </div>
                
                <div className="pesticide-info">
                  <h3>{pesticide.name}</h3>
                  <p className="pesticide-category">{pesticide.subcategory || 'Pesticide'}</p>
                  
                  <p className="pesticide-description">{pesticide.description || 'No description available'}</p>
                  
                  {pesticide.safety_info && (
                    <div className="safety-info">
                      <span className="safety-icon">⚠️</span>
                      <p>{pesticide.safety_info}</p>
                    </div>
                  )}
                  
                  <div className="pesticide-footer">
                    <span className="pesticide-price">₹{pesticide.price}</span>
                    <span className="pesticide-stock">
                      {pesticide.stock_quantity > 0 
                        ? `Stock: ${pesticide.stock_quantity}` 
                        : 'Out of stock'}
                    </span>
                  </div>
                  
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(pesticide)}
                    disabled={pesticide.stock_quantity === 0}
                  >
                    {pesticide.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No pesticides found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerPesticides;