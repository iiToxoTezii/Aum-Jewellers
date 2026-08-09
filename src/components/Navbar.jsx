import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronLeft, Menu, X, Home, Grid, Landmark, ShieldAlert, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';

const Navbar = () => {
  const { currentUser, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Collections', path: '/collections', icon: Grid },
    { name: 'Gold Savings (SIP)', path: '/sip', icon: Landmark },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Hub', path: '/admin', icon: ShieldAlert });
  }

  return (
    <>
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

          {/* Mobile Actions & Menu Toggle */}
          <div className="nav-mobile-toggle" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link to="/profile" className="nav-icon-link" style={{ padding: 0, width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(199, 154, 107, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={18} />
              )}
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'rgba(199, 154, 107, 0.1)',
                border: '1px solid rgba(199, 154, 107, 0.3)',
                borderRadius: '6px',
                color: 'var(--color-gold)',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* App Mobile Side Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '80%',
                maxWidth: '300px',
                height: '100%',
                backgroundColor: 'var(--color-bg-dark)',
                borderLeft: '1px solid rgba(199, 154, 107, 0.2)',
                padding: '5rem 1.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ borderBottom: '1px solid rgba(199, 154, 107, 0.15)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                <span className="eyebrow" style={{ fontSize: '0.6rem' }}>Navigation Menu</span>
                <h3 className="gold-gradient-text font-display" style={{ fontSize: '1.2rem', margin: '0.2rem 0 0' }}>Aum Jewellers</h3>
              </div>

              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      color: isActive ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: isActive ? 'rgba(199, 154, 107, 0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(199, 154, 107, 0.3)' : '1px solid transparent',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? '600' : '400'
                    }}
                  >
                    <IconComponent size={18} className={isActive ? 'text-gold' : 'opacity-60'} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              {!isNative && (
                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(199, 154, 107, 0.15)' }}>
                  <a
                    href={siteUrl}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      color: 'var(--color-gold)',
                      backgroundColor: 'rgba(199, 154, 107, 0.08)',
                      border: '1px solid rgba(199, 154, 107, 0.2)',
                      textDecoration: 'none',
                      fontSize: '0.85rem'
                    }}
                  >
                    <ExternalLink size={16} />
                    <span>Back to Main Website</span>
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
