import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Collections from './pages/Collections';
import SIPDashboard from './pages/SIPDashboard';
import Profile from './pages/Profile';
import AdminHub from './pages/AdminHub';
import CollectionDetail from './pages/CollectionDetail';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import './index.css';

import { MessageCircle } from 'lucide-react';

const AuthWrapper = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser && location.pathname !== '/profile') {
    return <Profile />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <SplashScreen />
        <Navbar />
        <main className="main-content">
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:id" element={<CollectionDetail />} />
              <Route path="/sip" element={<SIPDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminHub />} />
            </Routes>
          </AuthWrapper>
        </main>
        <BottomNav />
        
        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/919321097788?text=Hello, I have an inquiry." 
          className="floating-whatsapp"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <MessageCircle size={28} color="#ffffff" />
        </a>
      </div>
    </Router>
  );
}

export default App;
