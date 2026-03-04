import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CropCard.css';

const CropCard = ({ crop }) => {
  const navigate = useNavigate();

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

  return (
    <div className="crop-card" onClick={() => navigate(`/farmer/crop/${crop.id}`)}>
      <div className="crop-icon">{getCropIcon(crop.category)}</div>
      <h3>{crop.name}</h3>
      <p className="crop-category">{crop.category}</p>
      <p className="crop-season">{crop.season || 'All season'}</p>
      <p className="crop-duration">{crop.duration_days || '?'} days</p>
    </div>
  );
};

export default CropCard;