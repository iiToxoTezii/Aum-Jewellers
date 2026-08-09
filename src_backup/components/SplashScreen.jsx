import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="splash-container"
        >
          {/* Elegant Background Pattern / Ambient Light */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
            className="splash-bg"
            style={{
              background: 'radial-gradient(circle at center, #333728 0%, transparent 70%)'
            }}
          />

          <div className="splash-content-wrap">
            {/* Logo Reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ 
                duration: 1.5, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="splash-logo-container"
            >
              <img 
                src="/logo_2.png" 
                alt="Aum Jewellers Logo" 
                className="splash-logo"
              />
            </motion.div>

            {/* Brand Name Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="splash-title-wrap"
            >
              <h1 className="splash-title gold-gradient-text font-display">
                Aum Jewellers
              </h1>
              <p className="splash-subtitle">
                Established 1980
              </p>
            </motion.div>

            {/* Premium Loading Indicator */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
              className="splash-loader"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
