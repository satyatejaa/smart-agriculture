import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase';
import './Weather.css';

const FarmerWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crops, setCrops] = useState([]);
  const [city, setCity] = useState('Delhi'); // Default city
  const [searchCity, setSearchCity] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);
  const [usingGPS, setUsingGPS] = useState(false);

  const apiKey = "671552ed0a83d9281238d13fe1b64015";
  const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
  const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
  const reverseGeoUrl = "https://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=";

  useEffect(() => {
    // Try to get user's location on component mount
    detectUserLocation();
    fetchCrops();
  }, []);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  // Detect user's location using browser's geolocation
  const detectUserLocation = () => {
    setUsingGPS(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get city name
            const geoResponse = await fetch(
              `${reverseGeoUrl}${apiKey}&lat=${latitude}&lon=${longitude}`
            );
            
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              if (geoData && geoData.length > 0) {
                const detectedCity = geoData[0].name;
                setCity(detectedCity);
                setSearchCity(detectedCity);
                setLocationDetected(true);
                setError(null);
              }
            }
          } catch (err) {
            console.log('Location detection failed, using default city');
            setCity('Delhi');
            setSearchCity('');
          } finally {
            setUsingGPS(false);
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          setUsingGPS(false);
          // Fallback to Delhi if user denies location
          setCity('Delhi');
          setSearchCity('');
        }
      );
    } else {
      setUsingGPS(false);
      setCity('Delhi');
      setSearchCity('');
    }
  };

  async function fetchWeather(cityName) {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `${weatherUrl}${cityName}&appid=${apiKey}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('City not found. Please check the city name.');
      }
      
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${forecastUrl}${cityName}&appid=${apiKey}`
      );
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        // Get one forecast per day (every 8th item for 3-hour intervals)
        const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0);
        setForecast(dailyForecast.slice(0, 5));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCrops() {
    const { data } = await supabase
      .from('crops')
      .select('name, category, season');
    setCrops(data || []);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity);
      fetchWeather(searchCity);
      setLocationDetected(false); // Turn off GPS indicator when manually searching
    }
  };

  const handleUseGPS = () => {
    detectUserLocation();
  };

  // Get crop-specific alerts based on weather
  const getCropAlerts = () => {
    if (!weather || !crops.length) return [];

    const alerts = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    const humidity = weather.main.humidity;

    crops.forEach(crop => {
      // Temperature alerts
      if (crop.name === 'Tomato' && temp > 35) {
        alerts.push({
          crop: 'Tomato',
          severity: 'warning',
          message: 'High temperature may affect fruit set. Increase irrigation.'
        });
      }
      if (crop.name === 'Potato' && temp > 30) {
        alerts.push({
          crop: 'Potato',
          severity: 'warning',
          message: 'High temperature can reduce tuber growth. Apply mulch.'
        });
      }
      if (crop.name === 'Wheat' && temp < 10) {
        alerts.push({
          crop: 'Wheat',
          severity: 'info',
          message: 'Cold weather suitable for vernalization.'
        });
      }

      // Rain alerts
      if (condition.includes('rain')) {
        if (crop.name === 'Chili') {
          alerts.push({
            crop: 'Chili',
            severity: 'warning',
            message: 'Rain during flowering can reduce fruit set. Cover if possible.'
          });
        }
        if (crop.name === 'Onion') {
          alerts.push({
            crop: 'Onion',
            severity: 'info',
            message: 'Good rain for bulb development.'
          });
        }
      }

      // Humidity alerts
      if (humidity > 80) {
        if (crop.name === 'Tomato' || crop.name === 'Potato') {
          alerts.push({
            crop: crop.name,
            severity: 'warning',
            message: 'High humidity risk of blight. Apply preventive fungicide.'
          });
        }
      }
    });

    return alerts.slice(0, 5); // Return top 5 alerts
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      clear: '☀️',
      clouds: '☁️',
      rain: '🌧️',
      thunderstorm: '⛈️',
      snow: '❄️',
      mist: '🌫️',
      haze: '🌫️'
    };
    return icons[condition] || '☀️';
  };

  const alerts = getCropAlerts();

  return (
    <div className="weather-page">
      <h1>🌤️ Weather Report</h1>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        
        <button 
          onClick={handleUseGPS} 
          className="gps-button"
          disabled={usingGPS}
        >
          {usingGPS ? '📍 Detecting...' : '📍 Use My Location'}
        </button>
      </div>

      {locationDetected && (
        <div className="location-info">
          <span className="location-badge">
            📍 Location detected: {city}
          </span>
        </div>
      )}

      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && <div className="error">❌ {error}</div>}

      {weather && !loading && (
        <>
          <div className="current-weather">
            <div className="weather-header">
              <h2>{weather.name}, {weather.sys.country}</h2>
              <div className="weather-icon">
                <span className="icon">{getWeatherIcon(weather.weather[0].main.toLowerCase())}</span>
                <span className="temp">{Math.round(weather.main.temp)}°C</span>
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail">
                <span>🌡️ Feels like</span>
                <strong>{Math.round(weather.main.feels_like)}°C</strong>
              </div>
              <div className="detail">
                <span>💧 Humidity</span>
                <strong>{weather.main.humidity}%</strong>
              </div>
              <div className="detail">
                <span>💨 Wind</span>
                <strong>{weather.wind.speed} km/h</strong>
              </div>
              <div className="detail">
                <span>☁️ Condition</span>
                <strong>{weather.weather[0].description}</strong>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div className="forecast">
              <h3>5-Day Forecast</h3>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-day">
                    <div className="day">
                      {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="forecast-icon">
                      {getWeatherIcon(day.weather[0].main.toLowerCase())}
                    </div>
                    <div className="forecast-temp">
                      {Math.round(day.main.temp)}°C
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crop-Specific Alerts */}
          {alerts.length > 0 && (
            <div className="crop-alerts">
              <h3>🌾 Crop-Specific Alerts</h3>
              <div className="alerts-list">
                {alerts.map((alert, index) => (
                  <div key={index} className={`alert ${alert.severity}`}>
                    <strong>{alert.crop}:</strong> {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FarmerWeather;