import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalWithShipping = () => {
    return getTotalPrice() + 50;
  };

  return (
    <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
      <div className="cart-header">
        <h3>Shopping Cart ({cart.length})</h3>
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
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;