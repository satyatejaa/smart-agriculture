import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './CropDetail.css';

// Initialize Supabase
const supabaseUrl = 'https://wytdbpaaloxpyrkucyxt.supabase.co';
const supabaseKey = 'sb_publishable_2plwUslHaB-0i0XaxHtHqw_NjCQAwB2';
const supabase = createClient(supabaseUrl, supabaseKey);

const FarmerCropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [relatedCrops, setRelatedCrops] = useState([]);

useEffect(() => {
  fetchCropDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);
  const fetchCropDetails = async () => {
    setLoading(true);
    try {
      // Fetch main crop
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setCrop(data);

      // Fetch related crops (same category)
      const { data: related } = await supabase
        .from('crops')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);

      setRelatedCrops(related || []);

    } catch (error) {
      console.error('Error fetching crop:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseGuide = (guide) => {
    if (!guide) return {};
    if (typeof guide === 'string') {
      try {
        return JSON.parse(guide);
      } catch {
        return { description: guide };
      }
    }
    return guide;
  };

  const getCropIcon = (category) => {
    const icons = {
      'Vegetable': '🥬',
      'Grain': '🌾',
      'Fruit': '🍎',
      'Herb': '🌿',
      'Leafy': '🥬',
      'Spice': '🌶️'
    };
    return icons[category] || '🌱';
  };

  if (loading) {
    return <div className="loading-spinner">Loading crop details...</div>;
  }

  if (!crop) {
    return <div className="error-message">Crop not found</div>;
  }

  const guide = parseGuide(crop.guide);

  return (
    <div className="crop-detail-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Crops
      </button>

      {/* Hero Section */}
      <div className="crop-hero">
        <div className="crop-hero-image">
          <div className="hero-image-placeholder">
            <span>{getCropIcon(crop.category)}</span>
          </div>
        </div>
        <div className="crop-hero-info">
          <h1>{crop.name}</h1>
          <div className="crop-meta">
            <span className="badge">{crop.category}</span>
            <span className="badge">{crop.season || 'All Season'}</span>
            <span className="badge">{crop.duration_days || '?'} Days</span>
          </div>
          <p className="crop-description">
            {guide.description || `Complete guide to growing ${crop.name} from seed to harvest.`}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'stages' ? 'active' : ''}`}
          onClick={() => setActiveTab('stages')}
        >
          🌱 Growth Stages
        </button>
        <button 
          className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          💡 Requirements
        </button>
        <button 
          className={`tab ${activeTab === 'pests' ? 'active' : ''}`}
          onClick={() => setActiveTab('pests')}
        >
          🐛 Pests & Diseases
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-card">
              <h3>🌿 About {crop.name}</h3>
              <p>{guide.about || `${crop.name} is a ${crop.category.toLowerCase()} crop grown primarily in ${crop.season || 'various'} season. It takes approximately ${crop.duration_days || '?'} days from planting to harvest.`}</p>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <h4>📅 Best Planting Time</h4>
                <p>{guide.planting_time || crop.season || 'All season'}</p>
              </div>
              <div className="info-card">
                <h4>⏱️ Time to Harvest</h4>
                <p>{crop.duration_days || '?'} days</p>
              </div>
              <div className="info-card">
                <h4>🌡️ Ideal Temperature</h4>
                <p>{guide.temperature || '20-30°C'}</p>
              </div>
              <div className="info-card">
                <h4>💧 Water Needs</h4>
                <p>{guide.watering || 'Moderate'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Growth Stages Tab */}
        {activeTab === 'stages' && (
          <div className="stages-tab">
            <h3>🌱 Complete Growth Journey</h3>
            <div className="timeline">
              {guide.stages && guide.stages.length > 0 ? (
                guide.stages.map((stage, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="stage-number">{index + 1}</span>
                    </div>
                    <div className="timeline-content">
                      <h4>{stage.name || `Stage ${index + 1}: ${stage}`}</h4>
                      <p>{stage.description || `Details about ${stage} stage...`}</p>
                      {stage.duration && (
                        <span className="stage-duration">Duration: {stage.duration} days</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-item">
                  <div className="timeline-marker">1</div>
                  <div className="timeline-content">
                    <h4>Seed Selection & Sowing</h4>
                    <p>Choose high-quality seeds. Sow in well-prepared soil.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="requirements-tab">
            <div className="requirements-grid">
              <div className="req-card soil">
                <h4>🪴 Soil Requirements</h4>
                <p>{guide.soil || 'Well-drained loamy soil rich in organic matter'}</p>
                <ul>
                  <li>pH Level: {guide.ph || '6.0 - 7.0'}</li>
                  <li>Texture: {guide.soil_texture || 'Loamy'}</li>
                  <li>Preparation: {guide.soil_prep || 'Deep plowing with compost addition'}</li>
                </ul>
              </div>

              <div className="req-card fertilizer">
                <h4>🧪 Fertilizer Schedule</h4>
                <ul>
                  {guide.fertilizers ? (
                    guide.fertilizers.map((f, i) => <li key={i}>{f}</li>)
                  ) : (
                    <>
                      <li>Basal dose: NPK (50:25:25) kg/acre</li>
                      <li>Top dressing: Urea at 30 and 60 days</li>
                      <li>Organic: Farmyard manure 10 tons/acre</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="req-card irrigation">
                <h4>💧 Irrigation Schedule</h4>
                <p>{guide.watering || 'Regular irrigation schedule:'}</p>
                <ul>
                  <li>Germination: Light watering daily</li>
                  <li>Vegetative: Every 5-7 days</li>
                  <li>Flowering: Every 3-4 days</li>
                  <li>Reduce before harvest</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Pests & Diseases Tab */}
        {activeTab === 'pests' && (
          <div className="pests-tab">
            <h3>🐛 Common Pests</h3>
            <div className="pests-grid">
              <div className="pest-card">
                <h4>Aphids</h4>
                <p>Small insects that suck plant sap</p>
                <div className="treatment">
                  <strong>Treatment:</strong> Neem oil spray, insecticidal soap
                </div>
              </div>
              <div className="pest-card">
                <h4>Fruit Borer</h4>
                <p>Caterpillars that bore into fruits</p>
                <div className="treatment">
                  <strong>Treatment:</strong> Emamectin benzoate, pheromone traps
                </div>
              </div>
              <div className="pest-card">
                <h4>Leaf Miners</h4>
                <p>Larvae that tunnel through leaves</p>
                <div className="treatment">
                  <strong>Treatment:</strong> Remove affected leaves, spinosad
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>🦠 Common Diseases</h3>
            <div className="pests-grid">
              <div className="pest-card disease">
                <h4>Powdery Mildew</h4>
                <p>White powdery spots on leaves</p>
                <div className="treatment">
                  <strong>Treatment:</strong> Sulfur spray, good air circulation
                </div>
              </div>
              <div className="pest-card disease">
                <h4>Blight</h4>
                <p>Dark spots on leaves and fruits</p>
                <div className="treatment">
                  <strong>Treatment:</strong> Copper fungicide, crop rotation
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Crops Section */}
      {relatedCrops.length > 0 && (
        <div className="related-crops">
          <h3>You might also like:</h3>
          <div className="related-grid">
            {relatedCrops.map(rel => (
              <div 
                key={rel.id} 
                className="related-card"
                onClick={() => navigate(`/farmer/crop/${rel.id}`)}
              >
                <div className="related-icon">{getCropIcon(rel.category)}</div>
                <h4>{rel.name}</h4>
                <p>{rel.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCropDetail;