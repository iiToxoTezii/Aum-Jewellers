import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db, isFirebaseOffline } from '../firebase/config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_RATES = { gold24: 7850, gold22: 7200, silver: 95 };

export const useRates = () => {
  const queryClient = useQueryClient();

  const { data: rates = DEFAULT_RATES, isLoading } = useQuery({
    queryKey: ['rates'],
    queryFn: async () => {
      if (isFirebaseOffline) return DEFAULT_RATES;
      try {
        const docRef = doc(db, 'config', 'rates');
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return {
            gold24: data.gold24,
            gold22: Math.round(data.gold24 * 0.92),
            silver: data.silver
          };
        }
      } catch (error) {
        console.error("useRates: Failed to fetch initial rates:", error);
      }
      return DEFAULT_RATES;
    },
    initialData: DEFAULT_RATES
  });

  // Setup real-time listener to keep the cache updated in real time
  useEffect(() => {
    if (isFirebaseOffline) return;

    try {
      const unsubscribe = onSnapshot(doc(db, 'config', 'rates'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const updatedRates = {
            gold24: data.gold24,
            gold22: Math.round(data.gold24 * 0.92),
            silver: data.silver
          };
          queryClient.setQueryData(['rates'], updatedRates);
        }
      }, (error) => {
        console.error("useRates: Firestore real-time listener error:", error);
      });

      return unsubscribe;
    } catch (error) {
      console.error("useRates: Failed to setup real-time listener:", error);
    }
  }, [queryClient]);

  return { rates, loading: isLoading };
};

