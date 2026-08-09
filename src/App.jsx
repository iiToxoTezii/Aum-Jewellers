import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import Collections from './pages/Collections';
import SIPDashboard from './pages/SIPDashboard';
import Profile from './pages/Profile';
import AdminHub from './pages/AdminHub';
import CollectionDetail from './pages/CollectionDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import BottomNav from './components/BottomNav';
import PageWrapper from './components/PageWrapper';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import './index.css';

import { MessageCircle } from 'lucide-react';
import { db } from './firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import ForceUpdate from './components/ForceUpdate';

const AuthWrapper = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser && location.pathname !== '/profile' && location.pathname !== '/privacy-policy') {
    return <Profile />;
  }

  return children;
};

const HardwareBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || location.pathname === '/profile') {
        // Exit app if we are at the root or profile tab
        CapacitorApp.exitApp();
      } else {
        // Otherwise navigate back
        navigate(-1);
      }
    });

    return () => {
      handleBackButton.then(listener => listener.remove());
    };
  }, [navigate, location]);

  return null;
};

function App() {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);

  useEffect(() => {
    const checkAppVersion = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        const info = await CapacitorApp.getInfo();
        const currentBuild = parseInt(info.build, 10);
        
        const configRef = doc(db, 'settings', 'app_config');
        onSnapshot(configRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const minBuild = data.minBuildNumber || 0;
            if (currentBuild < minBuild) {
              setIsUpdateRequired(true);
            } else {
              setIsUpdateRequired(false);
            }
          }
        });
      } catch (e) {
        console.error("Failed to check app version:", e);
      }
    };
    checkAppVersion();

    const setupAdMob = async () => {
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          initializeForTesting: false,
        });

        await AdMob.showBanner({
          adId: 'ca-app-pub-6475155816196963/6137133129',
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 65, // Push it up above the bottom nav
          isTesting: false
        });
      } catch (e) {
        console.error('AdMob setup error:', e);
      }
    };

    const registerPushNotifications = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('Push notification permissions denied.');
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener('registration', async (token) => {
          console.log('FCM Token registered successfully:', token.value);
          localStorage.setItem('aum_fcm_token', token.value);
          window.dispatchEvent(new CustomEvent('fcmTokenReceived', { detail: token.value }));
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('FCM Token registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received in foreground:', notification);
        });
      } catch (e) {
        console.error('Push Notifications setup error:', e);
      }
    };

    if (Capacitor.isNativePlatform()) {
      registerPushNotifications();
      setupAdMob();
    }
  }, []);

  if (isUpdateRequired) {
    return <ForceUpdate />;
  }

  return (
    <Router>
      <HardwareBackButton />
      <ScrollToTop />
      <div className="app-container">
        <SplashScreen />
        <Navbar />
        <main className="main-content">
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/collections" element={<PageWrapper><Collections /></PageWrapper>} />
              <Route path="/collections/:id" element={<PageWrapper><CollectionDetail /></PageWrapper>} />
              <Route path="/sip" element={<PageWrapper><SIPDashboard /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><AdminHub /></PageWrapper>} />
              <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            </Routes>
          </AuthWrapper>
        </main>
        <BottomNav />
        
        {/* Floating WhatsApp Button */}
        <a 
          href="https://wa.me/919320197788?text=Hello, I have an inquiry." 
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
