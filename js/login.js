import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: ["AIzaSy", "Ae16VSoRTr", "WJ6OUJtoHosloWlHOjAhH4Q"].join(""),
  authDomain: "aum-jewellers-app.firebaseapp.com",
  projectId: "aum-jewellers-app",
  storageBucket: "aum-jewellers-app.firebasestorage.app",
  messagingSenderId: "468732933333",
  appId: "1:468732933333:web:7f273c3be58a95b4381e5c",
  measurementId: "G-JS4W8FZM3N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let loginModal = null;
let loginForm = null;
let loginError = null;
let loginSubmitBtn = null;

function showLoginModal(e) {
  if (e) e.preventDefault();
  if (loginModal) {
    loginModal.classList.add('active');
  }
}

function hideLoginModal() {
  if (loginModal) {
    loginModal.classList.remove('active');
    loginError.textContent = '';
    loginForm.reset();
  }
}

function updateUIForLogin(user) {
  // Hide Login buttons (mobile and desktop)
  document.querySelectorAll('.login-btn-nav').forEach(el => el.style.display = 'none');
  
  // Show Dashboard links
  document.querySelectorAll('.dashboard-link-nav').forEach(el => el.style.display = '');

  // Show Logout links
  document.querySelectorAll('.logout-btn-nav').forEach(el => el.style.display = '');

  // Update profile icons
  document.querySelectorAll('.profile-icon-nav').forEach(el => {
    el.style.display = 'flex';
    if (user.photoURL) {
      el.innerHTML = `<img src="${user.photoURL}" alt="Profile" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }
  });
}

function updateUIForLogout() {
  // Show Login buttons
  document.querySelectorAll('.login-btn-nav').forEach(el => el.style.display = '');
  
  // Hide Dashboard links
  document.querySelectorAll('.dashboard-link-nav').forEach(el => el.style.display = 'none');

  // Hide Logout links
  document.querySelectorAll('.logout-btn-nav').forEach(el => el.style.display = 'none');

  // Hide profile icons
  document.querySelectorAll('.profile-icon-nav').forEach(el => el.style.display = 'none');
}

document.addEventListener('DOMContentLoaded', () => {
  loginModal = document.getElementById('login-modal');
  if (!loginModal) return; // Modal not on this page

  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  loginSubmitBtn = document.getElementById('login-submit-btn');

  const closeBtn = document.querySelector('.login-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', hideLoginModal);

  // Close on outside click
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      hideLoginModal();
    }
  });

  // Attach login button listeners
  document.querySelectorAll('.login-btn-nav').forEach(btn => {
    btn.addEventListener('click', showLoginModal);
  });

  // Listen for login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        loginError.textContent = 'Please fill in all fields.';
        return;
      }

      loginSubmitBtn.textContent = 'Signing in...';
      loginSubmitBtn.disabled = true;

      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        hideLoginModal();
      } catch (error) {
        console.error("Auth Error:", error);
        loginError.textContent = 'Invalid email or password. Please try again.';
      } finally {
        loginSubmitBtn.textContent = 'Sign In';
        loginSubmitBtn.disabled = false;
      }
    });
  }

  // Handle Google Login
  const googleBtn = document.getElementById('login-google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      
      const provider = new GoogleAuthProvider();
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithPopup(auth, provider);
        hideLoginModal();
      } catch (error) {
        console.error("Google Auth Error:", error);
        loginError.textContent = 'Google sign in failed. Please try again.';
      }
    });
  }

  // Attach logout button listeners
  document.querySelectorAll('.logout-btn-nav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut(auth);
    });
  });
});

// Watch Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUIForLogin(user);
  } else {
    updateUIForLogout();
  }
});
