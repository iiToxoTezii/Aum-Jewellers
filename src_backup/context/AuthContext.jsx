import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, isFirebaseOffline, googleProvider } from '../firebase/config';
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('aum_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const isNative = Capacitor.isNativePlatform();

  // Handle User Data Sync
  const syncUserData = async (user) => {
    if (!user) {
      setUserData(null);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      let finalData;
      if (userDoc.exists()) {
        finalData = userDoc.data();
        // Ensure milanjain1422 always has admin even if doc exists
        if (user.email === 'milanjain1422@gmail.com' && !finalData.isAdmin) {
          await setDoc(userRef, { isAdmin: true }, { merge: true });
          finalData.isAdmin = true;
        }
      } else {
        finalData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: user.email === 'milanjain1422@gmail.com',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, finalData);
      }
      setUserData(finalData);
      localStorage.setItem('aum_user_data', JSON.stringify(finalData));
    } catch (error) {
      console.error("User Data Sync Error:", error);
      // Fallback for admin check even if DB fails
      const fallback = { isAdmin: user.email === 'milanjain1422@gmail.com', email: user.email };
      setUserData(fallback);
    }
  };

  useEffect(() => {
    if (isFirebaseOffline) {
      setLoading(false);
      return () => {};
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      if (isNative) {
        // Native Authentication Flow
        const result = await FirebaseAuthentication.signInWithGoogle();
        const credential = GoogleAuthProvider.credential(result.idToken);
        return await signInWithCredential(auth, credential);
      } else {
        // Web Flow (Dev/PWA)
        const { signInWithPopup } = await import('firebase/auth');
        return await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isNative) {
        await FirebaseAuthentication.signOut();
      }
      await auth.signOut();
      localStorage.removeItem('aum_user_data');
      setUserData(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const value = {
    currentUser,
    userData,
    isAdmin: userData?.isAdmin || currentUser?.email === 'milanjain1422@gmail.com',
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

