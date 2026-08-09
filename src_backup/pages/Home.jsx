import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Award, Phone, Mail, MapPin, Sparkles, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRates } from '../hooks/useRates';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { rates } = useRates();

  const featuredProducts = [
    { 
      id: 1, 
      name: 'Heritage Bridal Set', 
      category: 'Gold', 
      image: '/images/Jewellery/Gold 1.png', 
      description: 'Solid 22K gold bridal set with intricate temple carvings and antique finish.', 
      price: '₹ 1,85,000' 
    },
    { 
      id: 2, 
      name: 'Divine Silver Necklace', 
      category: 'Silver', 
      image: '/images/silver jewellery/gen_9_necklace.png', 
      description: 'Pure 925 silver necklace featuring traditional motifs for contemporary elegance.', 
      price: '₹ 12,500' 
    },
    { 
      id: 3, 
      name: 'Eternal Gold Bangles', 
      category: 'Gold', 
      image: '/images/Jewellery/Gold 2.png', 
      description: 'Exquisite pair of handcrafted gold bangles with delicate floral engravings.', 
      price: '₹ 95,000' 
    }
  ];

  return (
    <div className="home-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="premium-container">
          <div className="hero-content">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="eyebrow text-gold mb-4 block"
            >
              Since 1980 • Legacy of Trust
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-title"
            >
              Artistry in every <em>Detail</em>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hero-desc"
            >
              Discover our exclusive collections of handcrafted gold and silver jewellery, where traditional heritage meets modern elegance.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hero-actions"
            >
              <Link to="/collections" className="btn btn-gold">Explore Collections</Link>
              <Link to="/sip" className="btn btn-outline">Gold Savings</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gold Rates Ticker */}
      <section className="gold-ticker-container">
        <div className="premium-container">
          <div className="flex-ticker">
            <div className="ticker-item">
              <span className="ticker-label">Gold 24K</span>
              <span className="ticker-value">₹ {rates.gold24 || '...'}</span>
            </div>
            <div className="ticker-divider"></div>
            <div className="ticker-item">
              <span className="ticker-label">Gold 22K</span>
              <span className="ticker-value">₹ {rates.gold22 || '...'}</span>
            </div>
            <div className="ticker-divider"></div>
            <div className="ticker-item">
              <span className="ticker-label">Silver</span>
              <span className="ticker-value">₹ {rates.silver || '...'}</span>
            </div>
            <div className="ticker-status">
              <div className="status-dot"></div>
              Live Rates
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section section-padding">
        <div className="premium-container">
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck className="trust-icon mx-auto" />
              <h3>100% Hallmarked</h3>
              <p>Every piece is certified and hallmarked for absolute purity.</p>
            </div>
            <div className="trust-item">
              <Award className="trust-icon mx-auto" />
              <h3>Expert Craftsmanship</h3>
              <p>Hand-finished by master artisans with decades of experience.</p>
            </div>
            <div className="trust-item">
              <Star className="trust-icon mx-auto" />
              <h3>Transparent Pricing</h3>
              <p>Based on live market rates with no hidden costs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="section-padding dark-bg">
        <div className="premium-container">
          <div className="featured-header">
            <div>
              <span className="eyebrow">Exquisite</span>
              <h2 className="featured-title">Featured <em>Edits</em></h2>
            </div>
            <Link to="/collections" className="arrow-link">View All <ArrowRight size={16} /></Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SIP Section */}
      <section className="section-padding">
        <div className="premium-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sip-cta-card"
          >
            <div className="sip-cta-content relative z-10">
              <span className="eyebrow text-gold">Savings Plan</span>
              <h2 className="text-4xl text-white mb-6">Secure your future in <em>Gold</em></h2>
              <p className="text-champagne opacity-70 mb-10 max-w-sm">Start your monthly gold accumulation plan with as little as ₹2,000 and build your legacy.</p>
              <Link to="/sip" className="btn btn-gold">Start Saving Now</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="premium-container footer-content">
          <img src="/Logo 2.png" alt="Aum Jewellers" className="footer-logo" />
          <div className="footer-details text-center opacity-60 text-small mb-10" style={{ lineHeight: '2' }}>
             <p className="mb-2"><MapPin size={14} className="inline mr-2" /> Omkar Garden, Sinhagad Road, Manik Baug, Pune</p>
             <p className="mb-2"><Phone size={14} className="inline mr-2" /> +91 9321097788 <span className="mx-2">•</span> <Globe size={14} className="inline mr-2" /> www.aumjewellers.in</p>
             <p>Instagram: @aumjewellerspune1</p>
          </div>
          <p className="footer-copyright">© 2024 Aum Jewellers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
