import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail, Heart, ShoppingBag, Settings, ShieldAlert, Key, Phone, MapPin, Calendar, Camera, Check, Edit3, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db, storage, isFirebaseOffline } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile Data State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: '',
    dob: '',
    photoURL: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser && !isFirebaseOffline) {
      fetchProfileData();
    }
  }, [currentUser]);

  const fetchProfileData = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          displayName: data.displayName || currentUser.displayName || '',
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob || '',
          photoURL: data.photoURL || currentUser.photoURL || ''
        });
      } else {
        // Initialize doc if missing
        setProfileData(prev => ({
          ...prev,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || ''
        }));
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update Firebase Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Update Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileData(prev => ({ ...prev, photoURL: url }));
      setMessage({ type: 'success', text: 'Photo uploaded! Save profile to apply.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed: ' + error.message });
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Please enter your email address first." });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({ type: 'success', text: "Reset link sent! Please check your inbox." });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error.message !== 'Sign in canceled') {
        setMessage({ type: 'error', text: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    if (isFirebaseOffline) {
      return (
        <div className="home-view flex items-center justify-center min-h-[80vh]">
          <div className="container max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card text-center !p-12">
                <ShieldAlert size={64} className="mx-auto text-gold mb-8 opacity-40" />
                <h2 className="text-white text-3xl mb-4">Secure Terminal</h2>
                <p className="opacity-60 text-sm leading-relaxed mb-10">Authentication services are currently in maintenance mode.</p>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="home-view min-h-[100dvh] pt-32 pb-20 relative">
        <div className="container max-w-md relative z-10" style={{ padding: '0 1.5rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card border-gold-20" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="text-center mb-10">
              <span className="eyebrow">Aum Jewellers</span>
              <h2 className="text-4xl text-white mt-2">{isLogin ? 'Sign In' : 'Join Us'}</h2>
            </div>
            
            {message.text && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-4 rounded-lg mb-6 text-xs text-center border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-gold/10 border-gold/20 text-gold'}`}>
                {message.text}
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col" style={{ gap: '1.5rem' }}>
              <div className="input-wrap">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Email Address</label>
                <input type="email" placeholder="name@email.com" className="premium-input" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
              <div className="input-wrap">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[0.6rem] uppercase tracking-widest opacity-40 block">Password</label>
                  {isLogin && <button type="button" onClick={handleForgotPassword} className="text-small text-gold uppercase tracking-widest" style={{ letterSpacing: '0.15em', opacity: 0.8, background: 'transparent', border: 'none', padding: 0 }}>Forgot Password?</button>}
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="premium-input w-full" value={password} onChange={(e) => setPassword(e.target.value)} required={isLogin} disabled={loading} style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', padding: 0 }} className="text-gold opacity-60 hover:opacity-100">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-gold w-full py-5 mt-2" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div style={{ height: '1.25rem' }}></div>

            <button onClick={handleGoogleLogin} className="btn btn-outline w-full py-4 flex items-center justify-center gap-3" disabled={loading}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
              <span className="text-xs uppercase tracking-widest">Continue with Google</span>
            </button>

            <p className="text-center mt-10 text-small opacity-70">
              {isLogin ? "New member?" : "Already a member?"}
              <button onClick={() => setIsLogin(!isLogin)} className="text-gold ml-2 uppercase tracking-widest" style={{ letterSpacing: '0.15em', fontWeight: 600, background: 'transparent', border: 'none', padding: 0 }} disabled={loading}>{isLogin ? 'Register Here' : 'Sign In'}</button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view pt-32 pb-20 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-card lg:col-span-1 text-center" style={{ padding: '3.5rem 2rem' }}>
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="w-full h-full rounded-full border-2 border-gold p-1">
                {profileData.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center"><User size={48} className="text-gold opacity-30" /></div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-gold rounded-full flex items-center justify-center text-olive border-4 border-[#333728] hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
            </div>

            <h3 className="text-large text-white font-display mb-3">{profileData.displayName || 'Client'}</h3>
            <div className="flex flex-col gap-3 opacity-60 text-small tracking-widest mb-10">
              <span className="flex items-center justify-center gap-2" style={{ padding: '0.5rem' }}><Mail size={14} /> {currentUser.email}</span>
              {profileData.phone && <span className="flex items-center justify-center gap-2" style={{ padding: '0.5rem' }}><Phone size={14} /> {profileData.phone}</span>}
            </div>
            
            <div className="flex flex-col gap-4 px-6">
              <button onClick={() => setIsEditing(!isEditing)} className={`btn w-full py-4 text-xs flex items-center justify-center gap-3 ${isEditing ? 'btn-outline' : 'btn-gold'}`}>
                {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Details</>}
              </button>
              <button onClick={logout} className="text-[0.6rem] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <LogOut size={12} /> Secure Logout
              </button>
            </div>
          </motion.div>

          {/* Details Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="dashboard-card">
                  <h4 className="text-xl font-display text-white mb-8">Update Personal Details</h4>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="input-wrap">
                      <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Full Name</label>
                      <input type="text" className="premium-input" value={profileData.displayName} onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} />
                    </div>
                    <div className="input-wrap">
                      <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Phone Number</label>
                      <input type="tel" className="premium-input" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+91" />
                    </div>
                    <div className="input-wrap md:col-span-2">
                      <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Delivery Address</label>
                      <textarea className="premium-input min-h-[100px] py-4" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="Street, Landmark, City, Pincode" />
                    </div>
                    <div className="input-wrap">
                      <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Date of Birth</label>
                      <input type="date" className="premium-input" value={profileData.dob} onChange={(e) => setProfileData({...profileData, dob: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button type="submit" disabled={loading} className="btn btn-gold w-full py-5 flex items-center justify-center gap-3">
                        {loading ? 'Saving Changes...' : <><Check size={20} /> Save Profile</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
                  {/* Account Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="dashboard-card !p-8 flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><MapPin size={24} /></div>
                      <div>
                        <h5 className="text-white text-sm mb-1">Primary Address</h5>
                        <p className="text-xs opacity-50 leading-relaxed">{profileData.address || 'No address specified yet.'}</p>
                      </div>
                    </div>
                    <div className="dashboard-card !p-8 flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Calendar size={24} /></div>
                      <div>
                        <h5 className="text-white text-sm mb-1">Membership Since</h5>
                        <p className="text-xs opacity-50 leading-relaxed">{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently Joined'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Empty Sections Placeholder */}
                  <div className="dashboard-card !p-20 text-center border-dashed border-gold/20 !bg-transparent">
                    <Heart size={48} className="mx-auto text-gold mb-6 opacity-10" />
                    <p className="opacity-40 text-sm italic mb-10 font-light">Your curated wishlist and order history will appear here.</p>
                    <Link to="/collections" className="btn btn-outline py-4 px-10 text-[0.65rem]">Discover Collections</Link>
                  </div>

                  {/* Quick Access */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/sip" className="dashboard-card !p-8 flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold"><ShoppingBag size={24} /></div>
                        <div>
                          <h4 className="text-white text-base">Savings Portfolio</h4>
                          <p className="text-[0.6rem] opacity-40 uppercase tracking-widest mt-1">Manage your gold SIP</p>
                        </div>
                      </div>
                      <Key size={18} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="dashboard-card !p-8 flex items-center gap-6 opacity-50">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white"><Settings size={24} /></div>
                      <div>
                        <h4 className="text-white text-base">Preferences</h4>
                        <p className="text-[0.6rem] uppercase tracking-widest mt-1">Notifications & Privacy</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
