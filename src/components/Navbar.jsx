import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';

const Navbar = () => {
  const { currentUser, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();

  const siteUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://aumjewellers.in';

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

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* GST Marquee Banner */}
      <div className="marquee-banner">
        <div className="marquee-text">
          3% GST APPLICABLE ON ALL TRANSACTIONS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 3% GST APPLICABLE ON ALL TRANSACTIONS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 3% GST APPLICABLE ON ALL TRANSACTIONS &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 3% GST APPLICABLE ON ALL TRANSACTIONS
        </div>
      </div>
      <div className="premium-container nav-container" style={{ width: '100%', gap: '0.5rem', flexWrap: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          {!isNative && (
            <a 
              href={siteUrl} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.15rem', 
                color: 'var(--color-gold)', 
                textDecoration: 'none', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                opacity: 0.9,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '0.25rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(199, 154, 107, 0.1)',
                border: '1px solid rgba(199, 154, 107, 0.2)'
              }} 
              className="hover:opacity-100 transition-opacity"
              title="Back to Website"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Back to Site</span>
              <span className="sm:hidden">Back</span>
            </a>
          )}
          <Link to="/" className="nav-logo-group" style={{ minWidth: 0, overflow: 'hidden' }}>
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="/logo.svg" 
              alt="Aum Jewellers" 
              className="nav-logo-img" 
              style={{ flexShrink: 0 }}
            />
            <div className="nav-logo-text-wrap" style={{ minWidth: 0 }}>
              <span className="nav-logo-title gold-gradient-text font-display" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Aum Jewellers
              </span>
              <span className="nav-logo-subtitle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Pune • Since 1980
              </span>
            </div>
          </Link>
        </div>

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
        </div>

        <div className="nav-desktop-actions">
          <Link to="/profile" className="nav-icon-link" style={{ padding: 0, width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(199, 154, 107, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={18} />
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="nav-mobile-toggle" style={{ flexShrink: 0 }}>
          <Link to="/profile" className="nav-icon-link" style={{ padding: 0, width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(199, 154, 107, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
