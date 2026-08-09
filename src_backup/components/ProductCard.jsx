import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="product-card"
    >
      <div className="product-img-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <button className="wishlist-btn">
          <Heart size={18} />
        </button>
        <div className="product-badge">{product.category}</div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">Starting from {product.price}</span>
          <div className="product-actions">
            <a href={`https://wa.me/919321097788?text=I'm interested in ${product.name}`} className="action-icon whatsapp">
              <MessageCircle size={18} />
            </a>
            <Link to="/collections" className="action-icon details">
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
