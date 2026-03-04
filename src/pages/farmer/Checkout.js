import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const FarmerCheckout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    } else {
      navigate('/farmer/tools');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 50; // Add shipping
  };

  const placeOrder = () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      localStorage.removeItem('cart');
      alert('Order placed successfully!');
      navigate('/farmer/dashboard');
      setLoading(false);
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate('/farmer/tools')} className="continue-shopping-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-grid">
        {/* Delivery Form */}
        <div className="checkout-form">
          <h2>📦 Delivery Details</h2>
          
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <div className="form-group">
            <label>Address <span className="required">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="House number, street, landmark"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode <span className="required">*</span></label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                maxLength="6"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select 
              name="paymentMethod" 
              value={formData.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="cod">Cash on Delivery</option>
              <option value="card">Credit/Debit Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>🛒 Order Summary</h2>
          
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span>₹50</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>

          <button 
            onClick={placeOrder}
            disabled={loading}
            className="place-order-btn"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>

          <button 
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerCheckout;