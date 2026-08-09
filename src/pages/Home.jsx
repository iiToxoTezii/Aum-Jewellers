import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Award, Phone, Mail, MapPin, Sparkles, Globe, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const featuredProducts = [

    { 
      id: 2, 
      name: 'Divine Silver Necklace', 
      category: 'Silver', 
      image: '/images/silver jewellery/ai_gen_7.png', 
      description: 'Pure 925 silver necklace featuring traditional motifs for contemporary elegance.', 
      price: '₹ 12,500' 
    },
    { 
      id: 3, 
      name: 'Divine Gold Mangalsutra', 
      category: 'Gold', 
      image: '/images/Jewellery/Gold 2.png', 
      description: 'Handcrafted 22K gold mangalsutra with sacred black beads and a stunning floral gold pendant.', 
      price: '₹ 95,000' 
    },
    { 
      id: 4, 
      name: 'Heritage Giftables', 
      category: 'Gifting', 
      image: '/images/corporate/gift_1.png', 
      description: 'Celebrate special moments with our curated selection of pure silver and gold giftables.', 
      price: '₹ 5,000' 
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

      {/* Divider stripes before featured */}
      <div className="luxury-divider-stripes">
        <div className="luxury-stripe-line"></div>
        <div className="luxury-stripe-dot"></div>
        <div className="luxury-stripe-line"></div>
      </div>

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

      {/* Diamond Section [Coming Soon] */}
      <div className="luxury-divider-stripes">
        <div className="luxury-stripe-line"></div>
        <div className="luxury-stripe-dot"></div>
        <div className="luxury-stripe-line"></div>
      </div>

      <section className="section-padding relative overflow-hidden">
        <div className="premium-container">
          <div className="diamond-coming-soon-card">
            <div className="diamond-coming-soon-content text-center">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Sparkles className="trust-icon text-gold" style={{ width: '48px', height: '48px' }} />
              </div>
              <span className="eyebrow text-gold mb-2 block">Exquisite Luxury</span>
              <h2 className="text-4xl text-white font-display mb-4">Diamond <em>Collection</em></h2>
              <p className="opacity-60 text-small max-w-md mx-auto mb-8">
                Indulge in absolute brilliance. Our bespoke, hand-selected solitaire and diamond creations are arriving soon to redefine classic luxury.
              </p>
              <div className="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gifting Section */}
      <section className="section-padding dark-bg" style={{ paddingBottom: 0 }}>
        <div className="premium-container">
          <div className="gift-banner" style={{ background: 'linear-gradient(145deg, #1f1a10 0%, #2a2215 100%)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Gift className="text-gold" style={{ width: '48px', height: '48px' }} />
            </div>
            <span className="eyebrow text-gold mb-2 block">The Art of Giving</span>
            <h2 className="text-4xl text-white font-display mb-4">Gifting</h2>
            <p className="opacity-70 text-champagne max-w-lg mx-auto mb-8">
              Celebrate your special moments with our curated selection of timeless gifts. Perfect for weddings, anniversaries, and milestones.
            </p>
            <Link to="/collections" className="btn btn-gold">Explore Gifts</Link>
          </div>
        </div>
      </section>

      {/* SIP Section */}
      <section className="section-padding" style={{ paddingTop: '4rem' }}>
        <div className="premium-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sip-cta-card relative overflow-hidden"
          >
            <div className="bg-layer-deep">
              <img src="/images/sip/gold_savings_banner.png" alt="Gold Savings" className="bg-image bg-opacity-20" />
              <div className="bg-gradient-dark"></div>
            </div>
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
          <img src="/logo.svg" alt="Aum Jewellers" className="footer-logo" />
          <div className="footer-details text-center opacity-60 text-small mb-10" style={{ lineHeight: '2' }}>
             <p className="mb-2"><MapPin size={14} className="inline mr-2" /> Omkar Garden, Sinhagad Road, Manik Baug, Pune</p>
             <p className="mb-2"><Phone size={14} className="inline mr-2" /> +91 9320197788 <span className="mx-2">•</span> <Globe size={14} className="inline mr-2" /> www.aumjewellers.in</p>
             <p>Instagram: @aumjewellerspune1</p>
          </div>
          <p className="footer-copyright">© 2024 Aum Jewellers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
