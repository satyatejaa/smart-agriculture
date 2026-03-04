import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentCrops.css';

const RecentCrops = ({ crops }) => {
  const navigate = useNavigate();

  if (!crops || crops.length === 0) {
    return <p className="no-crops">No crops to display</p>;
  }

  return (
    <div className="recent-crops">
      <h2>Your Crops</h2>
      <div className="crops-list">
        {crops.map(crop => (
          <div 
            key={crop.id} 
            className="crop-item"
            onClick={() => navigate(`/farmer/crop/${crop.id}`)}
          >
            <h3>{crop.name}</h3>
            <p><span>Category:</span> {crop.category}</p>
            <p><span>Season:</span> {crop.season}</p>
            <p><span>Duration:</span> {crop.duration_days} days</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: '45%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCrops;