import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'Gold Savings', path: '/sip' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="premium-container nav-container">
        <Link to="/" className="nav-logo-group">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src="/logo_2.png" 
            alt="Aum Jewellers" 
            className="nav-logo-img" 
          />
          <div className="nav-logo-text-wrap">
            <span className="nav-logo-title gold-gradient-text font-display">
              Aum Jewellers
            </span>
            <span className="nav-logo-subtitle">
              Pune • Since 1980
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="nav-desktop-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
              <span className={`nav-link-indicator ${location.pathname === link.path ? 'active' : ''}`} />
            </Link>
          ))}
          <div className="nav-desktop-actions">
            <Link to="/profile" className="nav-icon-link">
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="nav-mobile-toggle">
          <Link to="/profile" className="nav-icon-link">
            <User size={22} />
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-menu-btn"
          >
            {mobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="nav-mobile-overlay"
          >
            <div className="nav-mobile-links">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-mobile-link font-display ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-mobile-link font-display"
                >
                  My Account
                </Link>
              </motion.div>
            </div>
            
            <div className="nav-mobile-footer">
              <p className="nav-mobile-inquiry">Inquiry</p>
              <a href="tel:+919321097788" className="nav-mobile-phone">+91 93210 97788</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
