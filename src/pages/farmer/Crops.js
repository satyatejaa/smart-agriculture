import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Crops.css';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = 'https://wytdbpaaloxpyrkucyxt.supabase.co';
const supabaseKey = 'sb_publishable_2plwUslHaB-0i0XaxHtHqw_NjCQAwB2';
const supabase = createClient(supabaseUrl, supabaseKey);

const FarmerCrops = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching crops from Supabase...');
      
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name');
      
      console.log('📦 Response:', { data, error });
      
      if (error) {
        console.error('❌ Error:', error);
        setCrops([]);
        setFilteredCrops([]);
      } else if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} crops`);
        console.log('First crop:', data[0]);
        setCrops(data);
        setFilteredCrops(data);
        
        const uniqueCats = ['All', ...new Set(data.map(c => c.category).filter(Boolean))];
        setCategories(uniqueCats);
      } else {
        console.log('⚠️ No crops found in database');
        setCrops([]);
        setFilteredCrops([]);
      }
    } catch (err) {
      console.error('💥 Exception:', err);
      setCrops([]);
      setFilteredCrops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (crops.length > 0) {
      let result = crops;
      
      if (searchTerm) {
        result = result.filter(crop => 
          crop.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory !== 'All') {
        result = result.filter(crop => crop.category === selectedCategory);
      }
      
      setFilteredCrops(result);
    }
  }, [searchTerm, selectedCategory, crops]);

  const handleCropClick = (crop) => {
    setSelectedCrop(crop);
  };

  const handleViewDetails = (cropId, e) => {
    e.stopPropagation();
    navigate(`/farmer/crop/${cropId}`);
  };

  const closeDetail = () => {
    setSelectedCrop(null);
  };

  const renderGuide = (guide) => {
    if (!guide) return null;
    
    if (typeof guide === 'string') {
      try {
        guide = JSON.parse(guide);
      } catch {
        return <p>{guide}</p>;
      }
    }
    
    return (
      <div className="guide-content">
        {guide.stages && (
          <div className="guide-section">
            <h4>🌱 Growth Stages</h4>
            <ul>
              {guide.stages.map((stage, i) => (
                <li key={i}>{stage}</li>
              ))}
            </ul>
          </div>
        )}
        {guide.soil && (
          <div className="guide-section">
            <h4>🪴 Soil</h4>
            <p>{guide.soil}</p>
          </div>
        )}
        {guide.watering && (
          <div className="guide-section">
            <h4>💧 Watering</h4>
            <p>{guide.watering}</p>
          </div>
        )}
      </div>
    );
  };

  // Get crop image - FIRST from database, THEN from local files
  const getCropImage = (crop) => {
    // If crop has image_url from database (admin uploaded), use it
    if (crop.image_url) {
      return crop.image_url;
    }
    
    // Otherwise, use local images
    const localImages = {
      'Apple': '/images/crops/apple.png',
      'Banana': '/images/crops/banana.png',
      'Brinjal': '/images/crops/eggplant.png',
      'Cabbage': '/images/crops/cabbage.png',
      'Carrot': '/images/crops/carrot.png',
      'Cauliflower': '/images/crops/califlower.png',
      'Chili': '/images/crops/chilli.png',
      'Coriander': '/images/crops/coriander.png',
      'Cucumber': '/images/crops/cucumber.png',
      'Ginger': '/images/crops/ginger.png',
      'Grapes': '/images/crops/grapes.png',
      'Mango': '/images/crops/mango.png',
      'Mint': '/images/crops/mint.png',
      'Onion': '/images/crops/onion.png',
      'Orange': '/images/crops/orange.png',
      'Papaya': '/images/crops/papaya.png',
      'Pomegranate': '/images/crops/pomegranate.png',
      'Potato': '/images/crops/potato.png',
      'Rice': '/images/crops/rice.png',
      'Spinach': '/images/crops/spinach.png',
      'Tomato': '/images/crops/tomato.png',
      'Wheat': '/images/crops/wheat.png',
      'Pineapple': '/images/crops/pineapple.png',
      'Watermelon': '/images/crops/watermelon.png',
      'Muskmelon': '/images/crops/muskmelon.png',
      'Guava': '/images/crops/guava.png',
      'Lychee': '/images/crops/lychee.png',
      'Jackfruit': '/images/crops/jackfruit.png',
      'Custard Apple': '/images/crops/custard-apple.png',
      'Sapota': '/images/crops/sapota.png',
      'Dragon Fruit': '/images/crops/dragon-fruit.png',
      'Fig': '/images/crops/fig.png',
      'Cotton': '/images/crops/cotton.png'
    };
    
    return localImages[crop.name] || null;
  };

  const handleImageError = (cropId) => {
    setImageErrors(prev => ({ ...prev, [cropId]: true }));
  };

  const getPlaceholderIcon = (category) => {
    const icons = {
      'Vegetable': '🥬',
      'Grain': '🌾',
      'Fruit': '🍎',
      'Herb': '🌿',
      'Leafy': '🥬',
      'Spice': '🌶️',
      'Fiber': '🌿'
    };
    return icons[category] || '🌱';
  };

  return (
    <div className="crops-page">
      <h1>🌾 Crop Library</h1>
      
      <div className="crops-filters">
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
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading crops...</div>
      ) : (
        <div className="crops-grid">
          {filteredCrops.length > 0 ? (
            filteredCrops.map(crop => (
              <div 
                key={crop.id} 
                className="crop-card"
                onClick={() => handleCropClick(crop)}
              >
                {/* Image Section */}
                <div className="crop-image-section">
                  {!imageErrors[crop.id] && getCropImage(crop) ? (
                    <img 
                      src={getCropImage(crop)}
                      alt={crop.name}
                      className="crop-image"
                      onError={() => handleImageError(crop.id)}
                    />
                  ) : (
                    <div className="crop-image-placeholder">
                      <span className="placeholder-icon">{getPlaceholderIcon(crop.category)}</span>
                      <span className="placeholder-text">Image coming soon</span>
                    </div>
                  )}
                </div>
                
                <div className="crop-info">
                  <h3>{crop.name}</h3>
                  <p className="crop-category">{crop.category}</p>
                  <p className="crop-season">{crop.season || 'All season'}</p>
                  <p className="crop-duration">{crop.duration_days || '?'} days</p>
                  
                  <button 
                    className="view-details-btn"
                    onClick={(e) => handleViewDetails(crop.id, e)}
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No crops found matching your criteria.</p>
          )}
        </div>
      )}

      {selectedCrop && (
        <div className="crop-detail-modal" onClick={closeDetail}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetail}>×</button>
            
            <div className="modal-header">
              <div className="modal-image-placeholder">
                {!imageErrors[selectedCrop.id] && getCropImage(selectedCrop) ? (
                  <img 
                    src={getCropImage(selectedCrop)}
                    alt={selectedCrop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                ) : (
                  <span className="placeholder-icon">{getPlaceholderIcon(selectedCrop.category)}</span>
                )}
              </div>
              <div className="modal-title">
                <h2>{selectedCrop.name}</h2>
                <p>{selectedCrop.category} • {selectedCrop.season || 'All season'} • {selectedCrop.duration_days || '?'} days</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="farming-guide">
                <h3>📋 Quick Guide</h3>
                {selectedCrop.guide ? renderGuide(selectedCrop.guide) : <p>Guide coming soon...</p>}
              </div>
              
              <button 
                className="full-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/farmer/crop/${selectedCrop.id}`);
                }}
              >
                View Complete Farming Guide →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCrops;