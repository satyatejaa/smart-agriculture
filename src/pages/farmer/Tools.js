import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import './Tools.css';

const supabaseUrl = 'https://wytdbpaaloxpyrkucyxt.supabase.co';
const supabaseKey = 'sb_publishable_2plwUslHaB-0i0XaxHtHqw_NjCQAwB2';
const supabase = createClient(supabaseUrl, supabaseKey);

const FarmerTools = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchTools();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  async function fetchTools() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'tool')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('✅ Tools loaded:', data.length);
        setTools(data);
        setFilteredTools(data);
        const uniqueCats = ['All', ...new Set(data.map(t => t.subcategory).filter(Boolean))];
        setCategories(uniqueCats);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tools.length > 0) {
      let result = tools;
      if (searchTerm) {
        result = result.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      if (selectedCategory !== 'All') {
        result = result.filter(tool => tool.subcategory === selectedCategory);
      }
      setFilteredTools(result);
    }
  }, [searchTerm, selectedCategory, tools]);

  const addToCart = (tool) => {
    const existingItem = cart.find(item => item.id === tool.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === tool.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...tool, quantity: 1 }];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`✅ ${tool.name} added to cart!`);
  };

  const removeFromCart = (toolId) => {
    const newCart = cart.filter(item => item.id !== toolId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (toolId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(toolId);
      return;
    }
    const newCart = cart.map(item =>
      item.id === toolId ? { ...item, quantity: newQuantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // FIXED IMAGE FUNCTION - Shows both local and uploaded images
  const getToolImage = (tool) => {
    // If tool has image_url from database (admin uploaded), use it
    if (tool.image_url) {
      return tool.image_url;
    }
    
    // For old tools with local images
    const localImages = {
      'Drip Irrigation Kit': '/images/tools/1.png',
      'Garden Hoe': '/images/tools/2.png',
      'Garden Rake': '/images/tools/3.png',
      'Hand Trowel': '/images/tools/4.png',
      'Measuring Tape': '/images/tools/5.png',
      'Organic Fertilizer': '/images/tools/6.png',
      'Pruning Shears': '/images/tools/7.png',
      'Soil Moisture Meter': '/images/tools/8.png',
      'Sprayer Pump': '/images/tools/9.png',
      'Watering Can': '/images/tools/10.png',
      'Wheelbarrow': '/images/tools/11.png',
      'Sickle': '/images/tools/12.png'
    };
    
    return localImages[tool.name] || null;
  };

  const handleImageError = (toolId) => {
    setImageErrors(prev => ({ ...prev, [toolId]: true }));
  };

  const getPlaceholderIcon = (tool) => {
    const icons = {
      'irrigation': '💧',
      'harvest': '🌾',
      'tilling': '⛏️',
      'spraying': '🧴',
      'measurement': '📏',
      'transport': '🛞',
      'soil': '🪴'
    };
    return icons[tool.subcategory] || '🛠️';
  };

  return (
    <div className="tools-page">
      <div className="tools-header">
        <h1>🔧 Farm Tools</h1>
        <button className="cart-button" onClick={() => setShowCart(!showCart)}>
          🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>
      
      <div className="tools-filters">
        <input
          type="text"
          placeholder="🔍 Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

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
                <div className="total-row"><span>Subtotal:</span><span>₹{getTotalPrice()}</span></div>
                <div className="total-row"><span>Shipping:</span><span>₹50</span></div>
                <div className="total-row grand-total"><span>Total:</span><span>₹{getTotalPrice() + 50}</span></div>
                <button className="checkout-btn" onClick={() => { setShowCart(false); navigate('/farmer/checkout'); }}>
                  Proceed to Checkout →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading tools...</div>
      ) : (
        <div className="tools-grid">
          {filteredTools.length > 0 ? (
            filteredTools.map(tool => (
              <div key={tool.id} className="tool-card">
                <div className="tool-image">
                  {!imageErrors[tool.id] && getToolImage(tool) ? (
                    <img 
                      src={getToolImage(tool)}
                      alt={tool.name}
                      className="tool-img"
                      onError={() => handleImageError(tool.id)}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>{getPlaceholderIcon(tool)}</span>
                    </div>
                  )}
                </div>
                <div className="tool-info">
                  <h3>{tool.name}</h3>
                  <p className="tool-category">{tool.subcategory || 'Tool'}</p>
                  <p className="tool-description">{tool.description || 'No description'}</p>
                  <div className="tool-footer">
                    <span className="tool-price">₹{tool.price}</span>
                    <span className="tool-stock">Stock: {tool.stock_quantity || 'In stock'}</span>
                  </div>
                  <button className="add-to-cart-btn" onClick={() => addToCart(tool)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No tools found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerTools;