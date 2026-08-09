import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Browser } from '@capacitor/browser';

const ForceUpdate = () => {
  const handleUpdateClick = async () => {
    try {
      // Direct user to Google Play Store using Capacitor Browser
      await Browser.open({ url: 'market://details?id=com.aumjewellers.app' });
    } catch (e) {
      console.log('Falling back to https URL for Play Store');
      await Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.aumjewellers.app' });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#171A13] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full bg-white/5 border border-gold/20 p-8 rounded-2xl backdrop-blur-md"
      >
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-gold" />
        </div>
        
        <h2 className="text-2xl font-display text-white mb-4">Update Required</h2>
        
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          A new version of the Aum Jewellers app is available. Please update to the latest version to continue using the app securely and access new features.
        </p>
        
        <button 
          onClick={handleUpdateClick}
          className="w-full bg-gold text-dark font-medium py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
        >
          Update Now <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
};

export default ForceUpdate;
