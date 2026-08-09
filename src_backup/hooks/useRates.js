import { useState, useEffect } from 'react';
import { db, isFirebaseOffline } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export const useRates = () => {
  const [rates, setRates] = useState({ gold24: 7850, gold22: 7200, silver: 95 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseOffline) {
      // In offline mode, use default mock rates and skip Firebase listener
      setLoading(false);
      return () => {};
    }

    try {
      const unsubscribe = onSnapshot(doc(db, 'config', 'rates'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setRates({
            gold24: data.gold24,
            gold22: Math.round(data.gold24 * 0.92), // Approximation if not provided
            silver: data.silver
          });
        }
        setLoading(false);
      }, (error) => {
        console.error("useRates: Firestore listener error:", error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("useRates: Failed to setup Firestore listener:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  return { rates, loading };
};
