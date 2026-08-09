import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, TrendingUp, Package, MessageSquare, 
  Search, ExternalLink, Calendar, CreditCard, Layout, 
  Settings, BarChart3, Database, ChevronRight, UserCheck, Trash2, AlertTriangle, Check, User, Download, Bell, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { 
  doc, updateDoc, collection, getDocs, setDoc, deleteDoc, query, where, writeBatch, addDoc, onSnapshot, serverTimestamp, collectionGroup, arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { isFirebaseOffline } from '../firebase/config';


const AdminHub = () => {
  const { isAdmin, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(null);

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const [data, setData] = useState({
    users: [],
    sips: [],
    enquiries: [],
    stats: {
      totalUsers: 0,
      activeSips: 0,
      totalVolume: 0,
      newEnquiries: 0
    }
  });
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [minBuildNumber, setMinBuildNumber] = useState('');
  const [updatingBuild, setUpdatingBuild] = useState(false);

  const [manualPayment, setManualPayment] = useState({
    email: '',
    amount: '',
    plan: 'Premium Flexible Bishi Plan',
    source: 'Cash',
    explicitGoldBooked: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!manualPayment.email || !manualPayment.amount) return;
    if (isFirebaseOffline) {
      showToast('error', "System is offline. Cannot record manual payment.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const emailKey = manualPayment.email.toLowerCase().trim();
      let uid = 'unknown_user';
      const matchedUser = data.users.find(u => u.email?.toLowerCase().trim() === emailKey);
      if (matchedUser) {
        uid = matchedUser.id;
      }

      const isoDate = new Date(manualPayment.date).toISOString();
      const amountNum = Number(manualPayment.amount);

      addDoc(collection(db, 'clients', emailKey, 'sip_records'), {
        uid: uid,
        email: emailKey,
        amount: amountNum,
        explicitGoldBooked: manualPayment.plan === 'Premium Flexible Bishi Plan' ? Number(manualPayment.explicitGoldBooked) : 0,
        type: 'SIP',
        plan: manualPayment.plan,
        date: isoDate,
        createdAt: serverTimestamp(),
        source: manualPayment.source
      }).catch(err => console.error('Offline sync error:', err));



      showToast('success', `✓ Payment of ₹${amountNum} recorded for ${emailKey}!`);
      setManualPayment({ ...manualPayment, amount: '', explicitGoldBooked: '' });
    } catch (err) {
      showToast('error', "Error recording payment: " + err.message);
    }
    setSubmittingPayment(false);
  };

  const [uploadingPhysicalCard, setUploadingPhysicalCard] = useState(false);
  const [physicalCardEmail, setPhysicalCardEmail] = useState('');
  const [physicalCardMonth, setPhysicalCardMonth] = useState('');
  const [physicalCardPlan, setPhysicalCardPlan] = useState('Premium Flexible Bishi Plan');

  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (isFirebaseOffline) {
      showToast('error', "System is offline. Cannot send notification.");
      return;
    }
    if (!notificationTitle || !notificationBody) return;

    setSendingNotification(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title: notificationTitle,
        body: notificationBody,
        createdAt: serverTimestamp(),
        sentBy: currentUser?.email || 'admin'
      });
      showToast('success', "Broadcast notification sent to the queue!");
      setNotificationTitle('');
      setNotificationBody('');
    } catch (err) {
      console.error(err);
      showToast('error', "Failed to broadcast: " + err.message);
    }
    setSendingNotification(false);
  };

  const handlePhysicalCardUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.cardImage.files[0];
    const email = physicalCardEmail;
    const month = physicalCardMonth;
    const plan = physicalCardPlan;
    if (!file || !email || !month || !plan) return;

    if (isFirebaseOffline) {
      showToast('error', "System is offline. Cannot upload card.");
      return;
    }

    setUploadingPhysicalCard(true);
    try {
      showToast('success', 'Compressing image...');
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2500,
        useWebWorker: true,
        initialQuality: 0.9
      };
      const compressedFile = await imageCompression(file, options);

      const cardRef = ref(storage, `cards/${email.toLowerCase()}_${plan.replace(/\s+/g, '_')}_${month}`);
      await uploadBytes(cardRef, compressedFile);
      const downloadUrl = await getDownloadURL(cardRef);

      const userObj = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userObj) {
        await updateDoc(doc(db, 'users', userObj.id), {
          physicalCards: arrayUnion({ month: month, plan: plan, url: downloadUrl, uploadedAt: new Date().toISOString() })
        });
        showToast('success', `Physical card for ${month} (${plan}) uploaded successfully.`);
        e.target.reset();
        setPhysicalCardEmail('');
        setPhysicalCardMonth('');
      } else {
        showToast('error', "User not found. Ensure the user has logged in at least once.");
      }
    } catch (err) {
      console.error("Card Upload Error:", err);
      showToast('error', "Failed to upload physical card: " + err.message);
    }
    setUploadingPhysicalCard(false);
  };

  useEffect(() => {
    if (!isAdmin || isFirebaseOffline) return;

    setLoading(true);

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({ 
        ...prev, 
        users,
        stats: { ...prev.stats, totalUsers: users.length }
      }));
    }, (error) => console.error("Admin real-time error:", error));
    
    const unsubPayments = onSnapshot(collectionGroup(db, 'sip_records'), (snap) => {
      const sips = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      sips.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort latest first
      setData(prev => ({
        ...prev,
        sips,
        stats: {
          ...prev.stats,
          activeSips: sips.length,
          totalVolume: sips.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
        }
      }));
    }, (error) => console.error("Admin real-time error:", error));
    
    const unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snap) => {
      const enquiries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({
        ...prev,
        enquiries,
        stats: {
          ...prev.stats,
          newEnquiries: enquiries.length
        }
      }));
    }, (error) => console.error("Admin real-time error:", error));

    const unsubConfig = onSnapshot(doc(db, 'settings', 'app_config'), (docSnap) => {
      if (docSnap.exists()) {
        setMinBuildNumber(docSnap.data().minBuildNumber?.toString() || '0');
      }
    });

    const t = setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubUsers();
      unsubPayments();
      unsubEnquiries();
      unsubConfig();
      clearTimeout(t);
    };
  }, [isAdmin]);



  const handleUpdateMinBuild = async () => {
    if (isFirebaseOffline) {
      showToast('error', "System is offline. Cannot update settings.");
      return;
    }
    setUpdatingBuild(true);
    try {
      await setDoc(doc(db, 'settings', 'app_config'), {
        minBuildNumber: parseInt(minBuildNumber, 10)
      }, { merge: true });
      showToast('success', 'Minimum required app build updated successfully.');
    } catch (e) {
      showToast('error', 'Error updating build number: ' + e.message);
    }
    setUpdatingBuild(false);
  };

  const resetPlatformData = async () => {
    if (isFirebaseOffline) {
      alert("Cannot reset data in offline mode.");
      return;
    }
    
    const confirm1 = window.confirm("CRITICAL: This will PERMANENTLY ERASE all user profiles, payments, and enquiries. Continue?");
    if (!confirm1) return;
    
    const confirm2 = window.confirm("ARE YOU ABSOLUTELY SURE? This action is irreversible.");
    if (!confirm2) return;

    setLoading(true);
    try {
      let totalDeleted = 0;

      // 1. Delete all sip_records (subcollections)
      const sipSnap = await getDocs(collectionGroup(db, 'sip_records'));
      const sipPromises = sipSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(sipPromises);
      totalDeleted += sipSnap.docs.length;

      // 2. Delete all clients (parent docs)
      const clientsSnap = await getDocs(collection(db, 'clients'));
      const clientsPromises = clientsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(clientsPromises);
      totalDeleted += clientsSnap.docs.length;

      // 3. Delete notifications
      const notifSnap = await getDocs(collection(db, 'notifications'));
      const notifPromises = notifSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(notifPromises);
      totalDeleted += notifSnap.docs.length;

      // 4. Delete enquiries
      const enqSnap = await getDocs(collection(db, 'enquiries'));
      const enqPromises = enqSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(enqPromises);
      totalDeleted += enqSnap.docs.length;

      // 5. Delete old payments
      const paySnap = await getDocs(collection(db, 'payments'));
      const payPromises = paySnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(payPromises);
      totalDeleted += paySnap.docs.length;

      // 6. Delete users EXCEPT current admin
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersPromises = usersSnap.docs.map(d => {
        if (d.id !== currentUser.uid) {
          return deleteDoc(d.ref);
        }
        return updateDoc(d.ref, {
          physicalCards: [],
          phone: '',
          address: '',
          dob: ''
        });
      });
      await Promise.all(usersPromises);
      totalDeleted += (usersSnap.docs.length - 1);
      
      alert(`Success! ${totalDeleted} records cleared. The platform is now in a clean state for production.`);
    } catch (error) {
      alert("System Reset Error: " + error.message);
      console.error(error);
    }
    setLoading(false);
  };

  const promoteToAdmin = async () => {
    if (!newAdminEmail) return;
    if (isFirebaseOffline) {
      alert("Cannot update permissions in offline mode.");
      return;
    }

    setPromoting(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', newAdminEmail.toLowerCase().trim()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert("User not found. They must have logged in at least once.");
      } else {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true });
        alert(`✓ Success! ${newAdminEmail} is now an Admin.`);
        setNewAdminEmail('');
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    setPromoting(false);
  };


  const handleImageUpload = async (sipId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (isFirebaseOffline) {
      showToast('error', "System is offline. Cannot upload images.");
      return;
    }

    setUploadingImage(sipId);
    try {
      showToast('success', 'Compressing receipt...');
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2500,
        useWebWorker: true,
        initialQuality: 0.9
      };
      const compressedFile = await imageCompression(file, options);

      const imageRef = ref(storage, `receipts/${sipId}_${file.name}`);
      await uploadBytes(imageRef, compressedFile);
      const url = await getDownloadURL(imageRef);
      
      await updateDoc(doc(db, 'payments', sipId), {
        receiptUrl: url
      });
      showToast('success', '✓ Receipt uploaded successfully!');
    } catch (err) {
      showToast('error', "Error uploading image: " + err.message);
    }
    setUploadingImage(null);
  };

  if (!isAdmin) {
    return (
      <div className="premium-container pt-48 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="hero-title">Access <em>Denied</em></h2>
          <p className="hero-desc mx-auto">This terminal is restricted to Aum Jewellers administrators.</p>
          <div className="admin-badge mt-8">
            <ShieldCheck size={16} /> Restricted Area
          </div>
        </motion.div>
      </div>
    );
  }

  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const oldPaymentsSnap = await getDocs(collection(db, 'payments'));
      let count = 0;
      for (const docSnap of oldPaymentsSnap.docs) {
        const data = docSnap.data();
        if (data.email) {
          const emailKey = data.email.toLowerCase().trim();
          await setDoc(doc(db, 'clients', emailKey, 'sip_records', docSnap.id), {
            ...data,
            createdAt: serverTimestamp()
          });
          // Delete old doc to clean up
          await deleteDoc(doc(db, 'payments', docSnap.id));
          count++;
        }
      }
      showToast('success', `Migrated ${count} records!`);
    } catch (e) {
      showToast('error', 'Migration failed: ' + e.message);
    }
    setIsMigrating(false);
  };

  const renderOverview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view">
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display">Overview</h3>
        <button 
          onClick={handleMigration} 
          disabled={isMigrating}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs tracking-wider"
        >
          {isMigrating ? "MIGRATING..." : "MIGRATE OLD DATA"}
        </button>
      </div>
      <div className="admin-stats-grid mb-16">
        <div className="admin-glass-card group">
          <div className="flex justify-between items-start">
            <Users size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">L1</div>
          </div>
          <div className="info">
            <span className="admin-metric-value">{data.stats.totalUsers}</span>
            <span className="admin-metric-label">Registered Clients</span>
          </div>
        </div>
        <div className="admin-glass-card group">
           <div className="flex justify-between items-start">
            <Package size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">SIP</div>
          </div>
          <div className="info">
            <span className="admin-metric-value">{data.stats.activeSips}</span>
            <span className="admin-metric-label">Active Portfolios</span>
          </div>
        </div>
        <div className="admin-glass-card group">
           <div className="flex justify-between items-start">
            <TrendingUp size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">INR</div>
          </div>
          <div className="info">
            <span className="admin-metric-value">₹ {(data.stats.totalVolume / 100000).toFixed(2)}L</span>
            <span className="admin-metric-label">Accumulated Volume</span>
          </div>
        </div>
        <div className="admin-glass-card group">
           <div className="flex justify-between items-start">
            <MessageSquare size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">NEW</div>
          </div>
          <div className="info">
            <span className="admin-metric-value">{data.stats.newEnquiries}</span>
            <span className="admin-metric-label">Pending Requests</span>
          </div>
        </div>
      </div>

      <div className="admin-grid-layout">

        {/* Quick Recent Activity */}
        <div className="dashboard-card">
          <h3 className="mb-8 flex items-center gap-3 font-display"><Calendar size={20} className="text-gold" /> Recent Enquiries</h3>
          <div className="recent-list flex flex-col gap-4">
            {data.enquiries.length > 0 ? data.enquiries.slice(0, 4).map((enq, i) => (
              <div key={i} className="recent-item p-4 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{enq.name || 'Anonymous'}</p>
                  <p className="text-xs opacity-50">{enq.subject || 'Jewellery Enquiry'}</p>
                </div>
                <ChevronRight size={16} className="opacity-30" />
              </div>
            )) : (
              <p className="text-sm opacity-40 text-center py-10">No recent enquiries found.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-[0.6rem] text-gold">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                    {user.displayName || 'Guest'}
                  </div>
                </td>
                <td className="opacity-60">{user.email}</td>
                <td>
                  <span className={`status-badge ${user.isAdmin ? 'admin' : 'customer'}`}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="opacity-40">{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '---'}</td>
                <td><ExternalLink size={14} className="text-gold cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  
  const renderBroadcasts = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view max-w-2xl mx-auto">
      <div className="dashboard-card border-gold-20">
        <h3 className="mb-6 flex items-center gap-3 font-display"><Bell size={20} className="text-gold" /> Broadcast Push Notification</h3>
        <p className="text-xs text-white/50 mb-6">Send a custom message to all registered users. This will pop up on their devices instantly.</p>
        <form onSubmit={handleSendNotification} className="flex flex-col gap-4">
          <div className="input-group">
            <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Notification Title</label>
            <input type="text" required className="premium-input w-full bg-white/5 border border-white/10" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} placeholder="e.g. Special Offer!" />
          </div>
          <div className="input-group">
            <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Message Body</label>
            <textarea required rows="3" className="premium-input w-full bg-white/5 border border-white/10 p-4" value={notificationBody} onChange={(e) => setNotificationBody(e.target.value)} placeholder="Type your announcement here..."></textarea>
          </div>
          <button type="submit" disabled={sendingNotification} className="btn btn-gold w-full mt-2 py-4">
            {sendingNotification ? 'Broadcasting...' : 'Send Broadcast'}
          </button>
        </form>
      </div>
    </motion.div>
  );

const renderSIPs = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view">
      
      <div className="max-w-2xl mx-auto mb-12">
        {/* Manual Payment Form */}
        <div className="dashboard-card border-gold-20">
          <h3 className="mb-6 flex items-center gap-3 font-display"><CreditCard size={20} className="text-gold" /> Quick Manual Entry</h3>
          <form onSubmit={handleManualPayment} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group col-span-2">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Client Email</label>
                <input 
                  type="email"
                  list="client-emails"
                  className="premium-input w-full bg-white/5 border border-white/10" 
                  value={manualPayment.email}
                  onChange={(e) => setManualPayment({...manualPayment, email: e.target.value})}
                  required
                  placeholder="client@example.com"
                />
                <datalist id="client-emails">
                  {Array.from(new Set([...data.users.map(u => u.email), ...data.sips.map(s => s.email)])).filter(Boolean).map((email, i) => (
                    <option key={i} value={email} />
                  ))}
                </datalist>
              </div>
              <div className="input-group">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Amount (₹)</label>
                <input type="number" required className="premium-input" value={manualPayment.amount} onChange={(e) => setManualPayment({...manualPayment, amount: e.target.value})} placeholder="5000" />
              </div>
              <div className="input-group">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Date</label>
                <input type="date" required className="premium-input" value={manualPayment.date} onChange={(e) => setManualPayment({...manualPayment, date: e.target.value})} />
              </div>
              <div className="input-group col-span-2">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">SIP Plan</label>
                <select className="premium-input w-full bg-white/5 border border-white/10" value={manualPayment.plan} onChange={(e) => setManualPayment({...manualPayment, plan: e.target.value})}>
                  <option value="Basic 12M Plan" className="text-dark">Basic 12M Plan</option>
                  <option value="Premium Flexible Bishi Plan" className="text-dark">Premium Flexible Bishi Plan</option>
                </select>
              </div>
              {manualPayment.plan === 'Premium Flexible Bishi Plan' && (
                <div className="input-group col-span-2">
                  <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block text-gold">Gold Booked (Grams)</label>
                  <input type="number" step="0.001" required className="premium-input border-gold/50" value={manualPayment.explicitGoldBooked} onChange={(e) => setManualPayment({...manualPayment, explicitGoldBooked: e.target.value})} placeholder="e.g. 1.250" />
                </div>
              )}
              <div className="input-group col-span-2">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Payment Source</label>
                <select className="premium-input w-full bg-white/5 border border-white/10" value={manualPayment.source} onChange={(e) => setManualPayment({...manualPayment, source: e.target.value})}>
                  <option value="Cash" className="text-dark">Cash (In-Store)</option>
                  <option value="UPI" className="text-dark">UPI / QR Scan</option>
                  <option value="Card" className="text-dark">Card / POS</option>
                  <option value="Bank Transfer" className="text-dark">Bank Transfer / NEFT</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submittingPayment} className="btn btn-gold w-full mt-2 py-4">
              {submittingPayment ? 'Recording...' : 'Record Payment Securely'}
            </button>
          </form>
        </div>

        {/* Physical Card Upload Form */}
        <div className="dashboard-card border-gold-20 mt-8">
          <h3 className="mb-6 flex items-center gap-3 font-display"><Check size={20} className="text-gold" /> Upload Physical Card</h3>
          <form onSubmit={handlePhysicalCardUpload} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group col-span-2">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Client Email</label>
                <input 
                  type="email"
                  list="client-emails-card"
                  className="premium-input w-full bg-white/5 border border-white/10" 
                  value={physicalCardEmail}
                  onChange={(e) => setPhysicalCardEmail(e.target.value)}
                  required
                  placeholder="client@example.com"
                />
                <datalist id="client-emails-card">
                  {Array.from(new Set([...data.users.map(u => u.email), ...data.sips.map(s => s.email)])).filter(Boolean).map((email, i) => (
                    <option key={i} value={email} />
                  ))}
                </datalist>
              </div>
              <div className="input-group col-span-1">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Month</label>
                <input 
                  type="month"
                  className="premium-input w-full bg-white/5 border border-white/10" 
                  value={physicalCardMonth}
                  onChange={(e) => setPhysicalCardMonth(e.target.value)}
                  required
                />
              </div>
              <div className="input-group col-span-1">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Plan</label>
                <select 
                  className="premium-input w-full bg-white/5 border border-white/10"
                  value={physicalCardPlan}
                  onChange={(e) => setPhysicalCardPlan(e.target.value)}
                >
                  <option value="Premium Flexible Bishi Plan" className="text-dark">Premium Flexible Bishi Plan</option>
                  <option value="Basic 12M Plan" className="text-dark">Basic 12M Plan</option>
                </select>
              </div>
              <div className="input-group col-span-2">
                <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">Card Image</label>
                <input type="file" name="cardImage" accept="image/*" required className="premium-input w-full bg-white/5 border border-white/10 p-2" />
              </div>
            </div>
            <button type="submit" disabled={uploadingPhysicalCard} className="btn btn-outline w-full mt-2 py-4">
              {uploadingPhysicalCard ? 'Uploading...' : 'Upload Physical Card'}
            </button>
          </form>
        </div>


      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Email</th>
              <th>Amount</th>
              <th>Source / Plan</th>
              <th>Date</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {data.sips.map((sip, i) => (
              <tr key={i}>
                <td className="text-xs opacity-40">#{sip.id.slice(0, 6)}</td>
                <td>{sip.email}</td>
                <td className="text-gold font-medium">₹ {sip.amount}</td>
                <td className="text-xs font-mono opacity-60">{sip.source || sip.razorpay_payment_id || 'Manual'}<br/><span className="text-[0.6rem] text-gold uppercase">{sip.plan || 'Standard'}</span></td>
                <td className="opacity-40">{new Date(sip.date).toLocaleDateString()}</td>
                <td>
                  {sip.receiptUrl ? (
                    <a href={sip.receiptUrl} target="_blank" rel="noreferrer" className="text-[0.6rem] text-gold border border-gold/30 px-3 py-1.5 rounded bg-gold/5 hover:bg-gold/20 transition-colors">View</a>
                  ) : (
                    <div className="relative inline-block">
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(sip.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload Receipt" />
                      <button disabled={uploadingImage === sip.id} className="text-[0.6rem] bg-white/5 hover:bg-white/10 transition-colors border border-white/10 px-3 py-1.5 rounded">
                        {uploadingImage === sip.id ? '...' : '+ Add'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white p-6 text-center" style={{ backgroundColor: '#171A13' }}>
        <div>
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-display text-gold mb-2">Access Denied</h2>
          <p className="text-gray-400">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout" style={{
      backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(10, 10, 10, 0.98)), url('/images/Jewellery/jewellery_mockup_2.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-full shadow-2xl border backdrop-blur-md font-medium text-sm flex items-center gap-3 bg-black/80">
             {message.type === 'error' ? <AlertTriangle size={18} className="text-red-400"/> : <Check size={18} className="text-gold" />}
             <span className={message.type === 'error' ? "text-red-400" : "text-white"}>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="mb-10 mt-4 px-2">
          <span className="uppercase text-[0.6rem] tracking-[0.4em] text-gold font-bold mb-2 block">Command Center</span>
          <h2 className="text-2xl text-white font-display uppercase tracking-widest">Admin <em className="text-gold italic font-serif">Hub</em></h2>
          <div className="h-0.5 w-12 bg-gold/30 rounded-full mt-3"></div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <button onClick={() => setActiveTab('overview')} className={`admin-sidebar-tab ${activeTab === 'overview' ? 'active' : ''}`}>
            <BarChart3 size={16} /> Overview
          </button>
          <button onClick={() => setActiveTab('users')} className={`admin-sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}>
            <Users size={16} /> Customers
          </button>
          <button onClick={() => setActiveTab('sip')} className={`admin-sidebar-tab ${activeTab === 'sip' ? 'active' : ''}`}>
            <Package size={16} /> SIP Records
          </button>
          <button onClick={() => setActiveTab('broadcasts')} className={`admin-sidebar-tab ${activeTab === 'broadcasts' ? 'active' : ''}`}>
            <Bell size={16} /> Broadcasts
          </button>
          <button onClick={() => setActiveTab('access')} className={`admin-sidebar-tab ${activeTab === 'access' ? 'active' : ''}`}>
            <UserCheck size={16} /> Admin Access
          </button>
          
          <div className="mt-8 mb-2 px-4 uppercase text-[0.55rem] tracking-[0.2em] opacity-40">System</div>
          
          <button onClick={() => setActiveTab('maintenance')} className={`admin-sidebar-tab ${activeTab === 'maintenance' ? 'active' : ''}`}>
            <Settings size={16} /> Maintenance
          </button>
        </div>
        
        <div className="mt-auto px-2 pb-4">
          <div className="admin-badge py-3 px-4 glass-effect !border-gold/30 shadow-2xl w-full flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-gold" /> 
            <span className="text-[0.6rem] font-medium tracking-widest truncate">{currentUser.email}</span>
          </div>
        </div>
      </div>

      <div className="admin-main-content">

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'sip' && renderSIPs()}
          {activeTab === 'broadcasts' && renderBroadcasts()}
          {activeTab === 'access' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view max-w-xl mx-auto">
              <div className="dashboard-card border-gold-20">
                <h3 className="text-xl font-display mb-6">Manage Administrator Access</h3>
                <p className="text-sm opacity-60 mb-8">Elevate existing users to administrator status. They will have full access to rates, customer data, and system controls.</p>
                
                <div className="input-wrap mb-6">
                  <label className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-2 block">User Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="premium-input !bg-white/5 border-white/10"
                  />
                </div>
                
                <button 
                  onClick={promoteToAdmin}
                  disabled={promoting || !newAdminEmail}
                  className="btn btn-gold w-full py-4 text-xs"
                >
                  {promoting ? 'Updating Registry...' : 'Grant Admin Privileges'}
                </button>
                
                <div className="mt-8 p-4 bg-gold/5 border border-gold/10 rounded-lg">
                  <p className="text-[0.65rem] opacity-70 leading-relaxed italic">
                    Note: Users must have signed into the app at least once before they can be promoted to Admin.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'maintenance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view max-w-2xl mx-auto">
              <div className="dashboard-card border-gold/30 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <Package size={24} className="text-gold" />
                  <h3 className="text-xl font-display text-white">App Version Control</h3>
                </div>
                <p className="text-sm opacity-70 mb-6">Set the minimum required build number. Users with older versions will be forced to update the app. (Current App Build is 6)</p>
                <div className="flex gap-4">
                  <input type="number" className="premium-input flex-1" value={minBuildNumber} onChange={(e) => setMinBuildNumber(e.target.value)} placeholder="Minimum Build (e.g. 6)" />
                  <button onClick={handleUpdateMinBuild} disabled={updatingBuild} className="btn btn-gold px-8">
                    {updatingBuild ? 'Saving...' : 'Save Rule'}
                  </button>
                </div>
              </div>

              <div className="dashboard-card border-red-500/30">
                <div className="flex items-center gap-4 mb-8 text-red-500">
                  <AlertTriangle size={32} />
                  <div>
                    <h3 className="text-xl font-display text-white">Platform Reset Terminal</h3>
                    <p className="text-xs opacity-50 uppercase tracking-widest">Emergency Maintenance Only</p>
                  </div>
                </div>
                
                <p className="mb-10 text-sm opacity-70 leading-relaxed">
                  Executing a platform reset will purge all transactional data and customer profiles from the live database. This is used for clearing test data before production or resolving critical data corruption.
                </p>

                <div className="bg-white/5 p-6 rounded-lg mb-10 border border-white/5">
                  <h4 className="text-xs uppercase tracking-widest mb-4 opacity-40">Impacted Collections:</h4>
                  <ul className="text-sm flex flex-col gap-2">
                    <li className="flex items-center gap-2"><Trash2 size={12} className="text-red-500" /> Users & Admin Profiles</li>
                    <li className="flex items-center gap-2"><Trash2 size={12} className="text-red-500" /> SIP Payment History</li>
                    <li className="flex items-center gap-2"><Trash2 size={12} className="text-red-500" /> Client Enquiry Logs</li>
                  </ul>
                </div>

                <button 
                  onClick={resetPlatformData}
                  disabled={loading}
                  className="btn w-full !bg-red-600 !text-white hover:!bg-red-700 py-6 rounded-xl flex items-center justify-center gap-3 font-bold"
                >
                  {loading ? 'Executing Wipe...' : <><Trash2 size={20} /> Reset All Platform Data</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminHub;

