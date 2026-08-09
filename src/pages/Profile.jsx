import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail, Heart, ShoppingBag, Settings, ShieldAlert, Key, Phone, MapPin, Calendar, Camera, Check, Edit3, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db, storage, isFirebaseOffline } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
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

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };
  
  // Profile Data State
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: '',
    dob: ''
  });


  useEffect(() => {
    if (!currentUser || isFirebaseOffline) return;

    const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          displayName: data.displayName || currentUser.displayName || '',
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob || ''
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          displayName: currentUser.displayName || ''
        }));
      }
    }, (error) => console.error("Profile real-time error:", error));

    return () => unsubProfile();
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // Fire and forget updates to prevent hanging offline
      updateProfile(auth.currentUser, {
        displayName: profileData.displayName
      }).catch(err => console.error("Auth update err:", err));
      
      setDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("DB update err:", err));

      setIsEditing(false);
      showToast('success', 'Profile updated successfully!');
    } catch (error) {
      showToast('error', error.message);
    }
    setLoading(false);
  };



  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      
      await updateProfile(auth.currentUser, { photoURL: url });
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL: url }, { merge: true });
      
      showToast('success', 'Profile picture updated successfully!');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setUploadingAvatar(false);
    }
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
      showToast('success', "Reset link sent! Please check your inbox.");
    } catch (error) {
      showToast('error', error.message);
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
      <div className="home-view min-h-[100dvh] pt-32 pb-20 relative overflow-hidden" style={{
        backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(23, 26, 19, 0.98)), url('/images/Jewellery/sip_dashboard_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container max-w-md relative z-10" style={{ padding: '0 1.5rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card border-gold-20" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="text-center mb-10">
              <img src="/logo.svg" alt="Logo" className="mb-4" style={{ height: '90px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
              <span className="eyebrow">Aum Jewellers</span>
              <h2 className="text-2xl text-white mt-2">{isLogin ? 'Sign In' : 'Join Us'}</h2>
            </div>
            
            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl border backdrop-blur-md font-medium text-sm flex items-center gap-3 bg-black/80">
                   {message.type === 'error' ? <ShieldAlert size={18} className="text-red-400"/> : <Check size={18} className="text-gold" />}
                   <span className={message.type === 'error' ? "text-red-400" : "text-white"}>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="flex flex-col" style={{ gap: '1.5rem' }}>
              <div className="input-wrap">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-40 mb-2 block">Email Address</label>
                <input type="email" placeholder="name@email.com" className="premium-input" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
              <div className="input-wrap">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[0.6rem] uppercase tracking-widest opacity-40 block">Password</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="premium-input w-full" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required={isLogin} 
                    disabled={loading} 
                    style={{ paddingRight: '2.5rem' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ 
                      position: 'absolute', 
                      right: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'transparent', 
                      border: 'none', 
                      padding: 0,
                      zIndex: 10
                    }} 
                    className="text-gold opacity-80 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={handleForgotPassword} 
                      className="text-gold uppercase tracking-[0.15em] font-medium" 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        padding: 0, 
                        fontSize: '0.65rem',
                        opacity: 0.8
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
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

            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-champagne opacity-70">
              <span>{isLogin ? "New member?" : "Already a member?"}</span>
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-gold uppercase tracking-[0.18em] font-semibold hover:text-gold-light" 
                style={{ background: 'transparent', border: 'none', padding: 0 }} 
                disabled={loading}
              >
                {isLogin ? 'Register Here' : 'Sign In'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view pt-32 pb-20 relative overflow-hidden" style={{
      backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(23, 26, 19, 0.98)), url('/images/Jewellery/sip_dashboard_bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-card lg:col-span-1 text-center" style={{ padding: '3.5rem 2rem' }}>
            <div className="relative w-32 h-32 mx-auto mb-8 group">
              <div className="w-full h-full rounded-full border-2 border-gold p-1">
                <div 
                  id="profile-avatar-fallback"
                  className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-gold opacity-30" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-xs text-gold">...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-xl text-white font-display mb-3">{profileData.displayName || 'Client'}</h3>
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
            <AnimatePresence>
              {message.text && (
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl border backdrop-blur-md font-medium text-sm flex items-center gap-3 bg-black/80 w-[max-content] max-w-[90vw]">
                   {message.type === 'error' ? <ShieldAlert size={18} className="text-red-400 flex-shrink-0"/> : <Check size={18} className="text-gold flex-shrink-0" />}
                   <span className={message.type === 'error' ? "text-red-400" : "text-white"}>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="dashboard-card">
                  <div className="text-lg font-display text-white mb-8">Update Personal Details</div>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Avatar Upload Section inside Edit Details */}
                    <div className="md:col-span-2 flex items-center gap-6 mb-2">
                      <div className="w-20 h-20 rounded-full border-2 border-gold p-1 flex-shrink-0">
                         <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative">
                           {currentUser.photoURL ? (
                              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User size={32} className="text-gold opacity-30" />
                            )}
                            {uploadingAvatar && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-xs text-gold">...</span>
                              </div>
                            )}
                         </div>
                      </div>
                      <div>
                        <input 
                          type="file" 
                          id="avatar-upload" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          style={{ display: 'none' }} 
                          disabled={uploadingAvatar} 
                        />
                        <label 
                          htmlFor="avatar-upload" 
                          className="btn btn-outline py-2 px-5 text-xs cursor-pointer flex items-center gap-2 w-fit"
                          style={{ margin: 0 }}
                        >
                          {uploadingAvatar ? 'Uploading...' : <><Camera size={14} /> Change Profile Picture</>}
                        </label>
                        <p className="text-[0.6rem] opacity-40 mt-3 tracking-wide">Recommended: Square image, max 5MB</p>
                      </div>
                    </div>
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
                  {/* Account & Quick Access Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="dashboard-card !p-8 flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><MapPin size={24} /></div>
                      <div>
                        <div className="text-white font-medium text-sm mb-1">Primary Address</div>
                        <p className="text-xs opacity-50 leading-relaxed">{profileData.address || 'No address specified yet.'}</p>
                      </div>
                    </div>
                    <div className="dashboard-card !p-8 flex items-start gap-6">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold"><Calendar size={24} /></div>
                      <div>
                        <div className="text-white font-medium text-sm mb-1">Membership Since</div>
                        <p className="text-xs opacity-50 leading-relaxed">{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently Joined'}</p>
                      </div>
                    </div>
                    <Link to="/sip" className="dashboard-card !p-8 flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold"><ShoppingBag size={24} /></div>
                        <div>
                          <div className="text-white font-medium text-base">Savings Portfolio</div>
                          <p className="text-[0.6rem] opacity-40 uppercase tracking-widest mt-1">Manage your gold SIP</p>
                        </div>
                      </div>
                      <Key size={18} className="text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>

                  {/* Divider stripes before wishlist */}
                  <div className="luxury-divider-stripes" style={{ margin: '2rem auto' }}>
                    <div className="luxury-stripe-line"></div>
                    <div className="luxury-stripe-dot"></div>
                    <div className="luxury-stripe-line"></div>
                  </div>

                  <div className="dashboard-card !p-20 text-center border-dashed border-gold/20 !bg-transparent">
                    <Heart size={48} className="mx-auto text-gold mb-6 opacity-10" />
                    <p className="opacity-40 text-sm italic mb-10 font-light">Your curated wishlist and order history will appear here.</p>
                    <Link to="/collections" className="btn btn-outline py-4 px-10 text-[0.65rem]">Discover Collections</Link>
                  </div>

                  {/* App Links */}
                  <div className="flex justify-center items-center mt-12 gap-6 text-[0.65rem] uppercase tracking-widest opacity-40">
                    <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium shadow-[0_0_20px_rgba(199,154,107,0.3)] z-50 flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-gradient-to-r from-gold to-champagne text-dark'}`}
          >
            {message.type === 'error' ? <ShieldAlert size={16} /> : <Check size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
