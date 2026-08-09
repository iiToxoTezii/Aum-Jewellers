import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAe16VSoRTrWJ6OUJtoHosloWlHOjAhH4Q",
  authDomain: "aum-jewellers-app.firebaseapp.com",
  projectId: "aum-jewellers-app",
  storageBucket: "aum-jewellers-app.firebasestorage.app",
  messagingSenderId: "468732933333",
  appId: "1:468732933333:web:7f273c3be58a95b4381e5c",
  measurementId: "G-JS4W8FZM3N"
};

let app;
let auth;
let db;
let storage;
export let isFirebaseOffline = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentSingleTabManager()})
  });
  storage = getStorage(app);
  
  // Set persistence to local (survives app restarts)
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth persistence error:", error);
  });
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
  isFirebaseOffline = true;
  app = {};
  auth = { 
    onAuthStateChanged: (cb) => { cb(null); return () => {}; },
    signOut: async () => {},
    currentUser: null
  };
  db = {};
  storage = {};
}

export { app, auth, db, storage };
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const facebookProvider = new FacebookAuthProvider();
