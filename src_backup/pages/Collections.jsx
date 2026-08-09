import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Collections = () => {
  const categories = [
    { 
      id: 'gold', 
      name: 'Pure Gold', 
      desc: 'Heritage pieces crafted in pure 22K hallmarked gold, featuring timeless artistry and regal motifs.', 
      img: '/images/collections/gold_premium.png' 
    },
    { 
      id: 'diamond', 
      name: 'Diamond Solitaires', 
      desc: 'Coming Soon - Breathtaking diamond sets and solitaire collections for a touch of brilliant elegance.', 
      img: '/images/collections/diamond_collection_1777533449213.png',
      isComingSoon: true
    },
    { 
      id: 'silver', 
      name: 'Modern Silver', 
      desc: 'Contemporary and traditional silver collections crafted in 925 purity for the modern lifestyle.', 
      img: '/images/collections/silver_premium.png' 
    },
    { 
        id: 'bridal', 
        name: 'Regal Bridal', 
        desc: 'The Wedding Edit: From intricate Polki and Kundan to breathtaking diamond sets for your special day.', 
        img: '/images/Jewellery/bridal_1.png' 
      },
    { 
      id: 'corporate', 
      name: 'Corporate Giftables', 
      desc: 'Custom-crafted pure silver and gold coins meticulously embossed with your company insignia.', 
      img: '/images/collections/corporate_premium.png' 
    },
  ];

  return (
    <div className="collections-view">
      <section className="relative overflow-hidden pt-40 pb-32" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        
        <div className="premium-container relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <span className="eyebrow text-gold">Heritage</span>
            <h1 className="text-5xl md:text-7xl text-white font-display mb-6">Our <em>Collections</em></h1>
            <p className="max-w-2xl mx-auto opacity-80 text-lg leading-relaxed text-champagne">
              Discover a legacy of elegance and trust spanning over four decades. 
              Every piece tells a unique story of heritage and master craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="premium-container py-24 relative z-10">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div 
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className={`card ${cat.isComingSoon ? 'opacity-80' : ''}`}
          >
            <div className="card-img-wrap" style={{ position: 'relative', aspectRatio: '4/5', width: '100%', overflow: 'hidden' }}>
              <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="card-overlay" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '70%', background: 'linear-gradient(to top, rgba(38,42,30,0.98) 0%, rgba(38,42,30,0.8) 40%, transparent 100%)', zIndex: 2 }}></div>
              {cat.isComingSoon && (
                <span className="coming-soon-badge" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(51, 55, 40, 0.88)', color: '#C79A6B', padding: '0.4rem 0.9rem', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', zIndex: 10 }}>Coming Soon</span>
              )}
              
              <div className="card-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem', zIndex: 10 }}>
                <h3 className="text-white text-large mb-3">{cat.name}</h3>
                <p className="opacity-80 text-small mb-6 leading-relaxed text-champagne" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.desc}</p>
                <div className="flex items-center justify-between">
                  {!cat.isComingSoon ? (
                    <Link to={`/collections/${cat.id}`} className="card-link btn btn-gold !py-3 !px-8 text-[0.65rem]">View Pieces</Link>
                  ) : (
                    <span className="card-link opacity-40">Coming Soon</span>
                  )}
                  <a href={`https://wa.me/919320197788?text=Hi, I am interested in ${cat.name}`} className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-olive transition-all">
                    <MessageCircle size={18} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="dashboard-card mt-20 p-12 text-center border-gold-20"
      >
        <span className="eyebrow">Personalized Service</span>
        <h3 className="text-3xl text-white mb-4">Bespoke Design Consultation</h3>
        <p className="opacity-70 max-w-xl mx-auto mb-10">
          Work with our master designers to craft custom jewellery that is uniquely yours, tailored to your exact specifications.
        </p>
        <a href="tel:+919320197788" className="btn btn-gold">Call to Enquire</a>
      </motion.div>
      </div>
    </div>
  );
};

export default Collections;
