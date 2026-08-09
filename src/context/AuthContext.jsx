/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, isFirebaseOffline, googleProvider } from '../firebase/config';
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    if (isFirebaseOffline) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    let unsubscribeDoc = null;

    // Check for SSO handoff tokens in URL
    const checkSsoTokens = async () => {
      try {
        const fullUrl = window.location.href;
        const matchGoogle = /[?&]googleToken=([^&#]*)/.exec(fullUrl);
        if (matchGoogle) {
          const googleToken = decodeURIComponent(matchGoogle[1]);
          const credential = GoogleAuthProvider.credential(googleToken);
          await signInWithCredential(auth, credential);
          // Clean URL parameter
          let cleanUrl = fullUrl.replace(/[?&]googleToken=[^&#]*/, '');
          cleanUrl = cleanUrl.replace(/\?#/, '#').replace(/\?$/, '');
          window.history.replaceState(null, '', cleanUrl);
        }
      } catch (err) {
        console.error("SSO Token Handshake Error:", err);
      }
    };

    checkSsoTokens();

    // Subscribe to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const token = localStorage.getItem('aum_fcm_token');
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              isAdmin: user.email === 'milanjain1422@gmail.com',
              fcmToken: token || null,
              createdAt: new Date().toISOString()
            });
          } else {
            const updates = {};
            if (user.email === 'milanjain1422@gmail.com' && !userDoc.data().isAdmin) {
               updates.isAdmin = true;
            }
            const token = localStorage.getItem('aum_fcm_token');
            if (token && userDoc.data().fcmToken !== token) {
               updates.fcmToken = token;
            }
            if (Object.keys(updates).length > 0) {
               await setDoc(userRef, updates, { merge: true });
            }
          }

          unsubscribeDoc = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setUserData(data);
              localStorage.setItem('aum_user_data', JSON.stringify(data));
            }
          });
        } catch (error) {
           console.error("User Data Sync Error:", error);
           const fallback = { isAdmin: user.email === 'milanjain1422@gmail.com', email: user.email };
           setUserData(fallback);
        }
      } else {
        setUserData(null);
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  useEffect(() => {
    const handleToken = async (e) => {
      const token = e.detail;
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { fcmToken: token }, { merge: true });
          if (currentUser.email === 'milanjain1422@gmail.com') {
             alert("✅ Push Notifications Token Synced to Firebase!");
          }
        } catch (err) {
          console.error("Failed to save token on event", err);
        }
      }
    };
    window.addEventListener('fcmTokenReceived', handleToken);
    return () => window.removeEventListener('fcmTokenReceived', handleToken);
  }, [currentUser]);

  const loginWithGoogle = async () => {
    try {
      if (isNative) {
        // Native Authentication Flow
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken || result.idToken; // handle both v7 and v8 plugin result structure
        const credential = GoogleAuthProvider.credential(idToken);
        return await signInWithCredential(auth, credential);
      } else {
        // Web Flow (Dev/PWA)

        return await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      let msg = error.message || String(error);
      if (isNative) {
        msg += "\n\n[Capacitor Native Google Sign-In]: Please ensure your SHA-1 fingerprint (both Debug and Production keys) has been registered in the Firebase Console and that the updated google-services.json is inside your android/app/ folder.";
      }
      alert("Sign-In Error: " + msg);
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
      {children}
    </AuthContext.Provider>
  );
};
