import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, TrendingUp, Package, MessageSquare, 
  Search, ExternalLink, Calendar, CreditCard, Layout, 
  Settings, BarChart3, Database, ChevronRight, UserCheck, Trash2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { 
  doc, updateDoc, collection, getDocs, 
  setDoc, query, orderBy, limit, where, deleteDoc
} from 'firebase/firestore';
import { isFirebaseOffline } from '../firebase/config';

const AdminHub = () => {
  const { isAdmin, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [goldRate, setGoldRate] = useState(7850);
  const [silverRate, setSilverRate] = useState(95);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (isAdmin && !isFirebaseOffline) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersSnap, sipsSnap, enquiriesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'payments')),
        getDocs(collection(db, 'enquiries'))
      ]);

      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sips = sipsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const enquiries = enquiriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setData({
        users,
        sips,
        enquiries,
        stats: {
          totalUsers: users.length,
          activeSips: sips.length,
          totalVolume: sips.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
          newEnquiries: enquiries.length
        }
      });
    } catch (error) {
      console.error("Admin Fetch Error:", error);
    }
    setLoading(false);
  };

  const updateRates = async () => {
    if (isFirebaseOffline) {
      alert("System is currently offline or in demo mode. Cannot save to Firestore.");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'rates'), {
        gold24: Number(goldRate),
        silver: Number(silverRate),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert('✓ Rates updated successfully across the platform!');
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const resetPlatformData = async () => {
    if (isFirebaseOffline) {
      alert("Cannot reset data in offline mode.");
      return;
    }
    
    const confirm1 = window.confirm("CRITICAL: This will PERMANENTLY ERASE all user profiles, payments, and enquiries. Continue?");
    if (!confirm1) return;
    
    const confirm2 = window.confirm("ARE YOU ABSOLUTELY SURE? This action is irreversible and will log out all current users.");
    if (!confirm2) return;

    setLoading(true);
    try {
      const collectionsToClear = ['users', 'payments', 'enquiries'];
      let totalDeleted = 0;
      
      for (const colName of collectionsToClear) {
        const snap = await getDocs(collection(db, colName));
        const deletePromises = snap.docs.map(d => deleteDoc(doc(db, colName, d.id)));
        await Promise.all(deletePromises);
        totalDeleted += snap.docs.length;
      }
      
      alert(`Success! ${totalDeleted} records cleared. The platform is now in a clean state.`);
      fetchAdminData();
    } catch (error) {
      alert("System Reset Error: " + error.message);
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
        fetchAdminData();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    setPromoting(false);
  };

  if (!isAdmin) {
    return (
      <div className="premium-container pt-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
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

  const renderOverview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view">
      <div className="admin-stats-grid mb-16">
        <div className="admin-stat-box dashboard-card !border-gold/10 group hover:!border-gold/30 transition-all">
          <div className="flex justify-between items-start">
            <Users size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">L1</div>
          </div>
          <div className="info">
            <span className="val gold-gradient-text text-4xl mb-2">{data.stats.totalUsers}</span>
            <span className="lbl tracking-[0.2em] font-medium">Registered Clients</span>
          </div>
        </div>
        <div className="admin-stat-box dashboard-card !border-gold/10 group hover:!border-gold/30 transition-all">
           <div className="flex justify-between items-start">
            <Package size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">SIP</div>
          </div>
          <div className="info">
            <span className="val gold-gradient-text text-4xl mb-2">{data.stats.activeSips}</span>
            <span className="lbl tracking-[0.2em] font-medium">Active Portfolios</span>
          </div>
        </div>
        <div className="admin-stat-box dashboard-card !border-gold/10 group hover:!border-gold/30 transition-all">
           <div className="flex justify-between items-start">
            <TrendingUp size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">INR</div>
          </div>
          <div className="info">
            <span className="val gold-gradient-text text-4xl mb-2">₹ {(data.stats.totalVolume / 100000).toFixed(2)}L</span>
            <span className="lbl tracking-[0.2em] font-medium">Accumulated Volume</span>
          </div>
        </div>
        <div className="admin-stat-box dashboard-card !border-gold/10 group hover:!border-gold/30 transition-all">
           <div className="flex justify-between items-start">
            <MessageSquare size={24} className="text-gold mb-6 opacity-80" />
            <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold text-[0.6rem] font-bold">NEW</div>
          </div>
          <div className="info">
            <span className="val gold-gradient-text text-4xl mb-2">{data.stats.newEnquiries}</span>
            <span className="lbl tracking-[0.2em] font-medium">Pending Requests</span>
          </div>
        </div>
      </div>

      <div className="admin-grid-layout">
        {/* Rate Control Card */}
        <div className="dashboard-card border-gold-20">
          <h3 className="mb-8 flex items-center gap-3 font-display"><TrendingUp size={20} className="text-gold" /> Live Price Controls</h3>
          <div className="flex flex-col gap-8">
            <div className="input-group">
              <label className="uppercase text-[0.6rem] opacity-50 tracking-widest mb-2 block">24K Gold Rate (Per Gram)</label>
              <div className="flex items-center gap-4">
                <span className="text-gold text-2xl font-display">₹</span>
                <input 
                  type="number" 
                  value={goldRate} 
                  onChange={(e) => setGoldRate(e.target.value)}
                  className="premium-input !mt-0 text-3xl font-display !bg-transparent !border-b !border-t-0 !border-l-0 !border-r-0"
                />
              </div>
            </div>
            <div className="input-group">
              <label className="uppercase text-[0.6rem] opacity-50 tracking-widest mb-2 block">Fine Silver Rate (Per Gram)</label>
              <div className="flex items-center gap-4">
                <span className="text-gold text-2xl font-display">₹</span>
                <input 
                  type="number" 
                  value={silverRate} 
                  onChange={(e) => setSilverRate(e.target.value)}
                  className="premium-input !mt-0 text-3xl font-display !bg-transparent !border-b !border-t-0 !border-l-0 !border-r-0"
                />
              </div>
            </div>
            <button 
              onClick={updateRates} 
              disabled={loading}
              className="btn btn-gold w-full py-5 rounded-xl shadow-xl"
            >
              {loading ? 'Propagating Rates...' : 'Apply Global Rates'}
            </button>
          </div>
        </div>

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

  const renderSIPs = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-view">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Email</th>
              <th>Amount</th>
              <th>Razorpay ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.sips.map((sip, i) => (
              <tr key={i}>
                <td className="text-xs opacity-40">#{sip.id.slice(0, 6)}</td>
                <td>{sip.email}</td>
                <td className="text-gold font-medium">₹ {sip.amount}</td>
                <td className="text-xs font-mono opacity-60">{sip.razorpay_payment_id}</td>
                <td className="opacity-40">{new Date(sip.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  return (
    <div className="admin-page-wrap min-h-screen relative">
      <div className="premium-container pt-48 pb-32 relative z-10">
        <div className="admin-header mb-16 p-10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border border-gold/20 shadow-2xl">
          <div className="title-group relative z-10">
            <span className="uppercase text-[0.65rem] tracking-[0.5em] text-gold font-bold mb-4 block">Central Command • Luxury Retail</span>
            <h2 className="text-5xl md:text-6xl text-white font-display uppercase tracking-widest mb-2">Admin <em className="text-gold italic font-serif">Hub</em></h2>
            <div className="h-1 w-20 bg-gold/30 rounded-full mt-4"></div>
          </div>
          <div className="flex flex-wrap items-center gap-6 relative z-10">
            <div className="admin-badge py-4 px-8 glass-effect !border-gold/30 shadow-2xl">
              <ShieldCheck size={18} className="text-gold" /> 
              <span className="text-[0.7rem] font-medium tracking-widest">{currentUser.email}</span>
            </div>
            <button 
              onClick={fetchAdminData} 
              className="p-4 bg-gold/10 rounded-full hover:bg-gold/20 transition-all border border-gold/20 shadow-lg group"
            >
              <Database size={18} className="text-gold group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

      <div className="admin-tabs">
        <button onClick={() => setActiveTab('overview')} className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}>
          <BarChart3 size={14} className="inline mr-2" /> Overview
        </button>
        <button onClick={() => setActiveTab('users')} className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}>
          <Users size={14} className="inline mr-2" /> Customers
        </button>
        <button onClick={() => setActiveTab('sip')} className={`admin-tab ${activeTab === 'sip' ? 'active' : ''}`}>
          <Package size={14} className="inline mr-2" /> SIP Records
        </button>
        <button onClick={() => setActiveTab('collections')} className={`admin-tab ${activeTab === 'collections' ? 'active' : ''}`}>
          <Layout size={14} className="inline mr-2" /> Collections
        </button>
        <button onClick={() => setActiveTab('enquiries')} className={`admin-tab ${activeTab === 'enquiries' ? 'active' : ''}`}>
          <MessageSquare size={14} className="inline mr-2" /> Enquiries
        </button>
        <button onClick={() => setActiveTab('access')} className={`admin-tab ${activeTab === 'access' ? 'active' : ''}`}>
          <UserCheck size={14} className="inline mr-2" /> Admin Access
        </button>
        <button onClick={() => setActiveTab('maintenance')} className={`admin-tab ${activeTab === 'maintenance' ? 'active' : ''}`}>
          <Settings size={14} className="inline mr-2" /> Maintenance
        </button>
      </div>

      <div className="admin-content-area">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'sip' && renderSIPs()}
          {activeTab === 'collections' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center opacity-40">
              <Package size={48} className="mx-auto mb-4" />
              <p>Collection management interface is coming soon.</p>
            </motion.div>
          )}
          {activeTab === 'enquiries' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center opacity-40">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <p>No active client enquiries found in data logs.</p>
           </motion.div>
          )}
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
    </div>
  );
};

export default AdminHub;
