import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Calendar, Wallet, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { useRates } from '../hooks/useRates';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { isFirebaseOffline } from '../firebase/config';
import { Link } from 'react-router-dom';

const SIPDashboard = () => {
  const { currentUser } = useAuth();
  const { rates } = useRates();
  const [amount, setAmount] = useState(5000);
  const { openCheckout } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalGold, setTotalGold] = useState(0);

  useEffect(() => {
    if (currentUser && !isFirebaseOffline) {
      fetchPayments();
    }
  }, [currentUser]);

  const fetchPayments = async () => {
    try {
      const q = query(
        collection(db, 'payments'),
        where('uid', '==', currentUser.uid),
        where('type', '==', 'SIP'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const paymentData = querySnapshot.docs.map(doc => doc.data());
      setPayments(paymentData);
      
      const total = paymentData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setTotalSaved(total);
      
      // Rough gold calculation if weight wasn't stored at time of payment
      const gold = paymentData.reduce((acc, curr) => acc + (curr.goldWeight || (curr.amount / 6500)), 0);
      setTotalGold(gold);
    } catch (e) {
      console.error("Error fetching payments:", e);
    }
  };

  const handlePayment = async () => {
    if (isFirebaseOffline) {
      alert("System is offline. Payments cannot be processed securely at this time.");
      return;
    }

    const razorpayKey = "rzp_test_Sn68rqRinDyGDR";

    const options = {
      key: razorpayKey, 
      amount: amount * 100, 
      currency: "INR",
      name: "Aum Jewellers",
      description: "Gold SIP Monthly Payment",
      image: "/images/Logo.png",
      handler: async (response) => {
        setLoading(true);
        try {
          const goldWeight = Number((amount / rates.gold24).toFixed(3));
          await addDoc(collection(db, 'payments'), {
            uid: currentUser.uid,
            email: currentUser.email,
            amount: Number(amount),
            goldWeight: goldWeight,
            razorpay_payment_id: response.razorpay_payment_id,
            type: 'SIP',
            date: new Date().toISOString()
          });
          alert('✓ Payment Successful! Gold Accumulated: ' + goldWeight + 'g');
          fetchPayments();
        } catch (e) {
          alert('Error saving payment: ' + e.message);
        }
        setLoading(false);
      },
      prefill: {
        name: currentUser.displayName || "",
        email: currentUser.email || "",
      },
      theme: { color: "#333728" },
    };
    openCheckout(options);
  };

  const stats = [
    { label: 'Total Savings', value: `₹ ${totalSaved.toLocaleString()}`, icon: <Wallet size={20} /> },
    { label: 'Gold Weight', value: `${totalGold.toFixed(3)}g`, icon: <Award size={20} /> },
    { label: 'Instalments', value: `${payments.length} Payments`, icon: <Calendar size={20} /> },
  ];

  const plans = [
    { name: 'Starter Plan', min: '₹ 2,000', benefit: '25% Off Making Charges', months: '3 Months' },
    { name: 'Growth Plan', min: '₹ 5,000', benefit: '50% Off Making Charges', months: '6 Months' },
    { name: 'Legacy Plan', min: '₹ 10,000', benefit: '100% Off Making Charges', months: '12 Months' },
  ];

  if (!currentUser) {
    return (
      <div className="home-view">
        <header className="page-header" style={{ minHeight: '75vh', paddingTop: '80px' }}>
             <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header-content text-center"
            >
                <span className="eyebrow text-white">Invest in Purity</span>
                <h2 className="heading-large text-white">Aum Gold <em>Savings</em></h2>
                <p className="text-champagne mb-10 max-w-md mx-auto">Secure your future by accumulating 24K gold monthly. Lock in today's rates and build your legacy.</p>
                <Link to="/profile" className="btn btn-gold">Sign In to Start</Link>
            </motion.div>
        </header>
      </div>
    );
  }

  return (
    <div className="sip-view relative">
      <section className="gold-intro gold-intro-premium relative overflow-hidden" style={{ paddingTop: '6rem', paddingBottom: '12rem' }}>
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="eyebrow text-gold">Exclusive Membership</span>
            <h2 className="section-heading text-white">Your Gold <em>Portfolio</em></h2>
          </motion.div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-8rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-card lg:col-span-1 flex flex-col items-center justify-center py-12"
          >
            <div className="progress-ring-wrap mb-8">
              <svg className="progress-ring" width="180" height="180">
                <circle className="ring-bg" cx="90" cy="90" r="82" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <motion.circle 
                  className="ring-fill" 
                  cx="90" cy="90" r="82" 
                  stroke="#C79A6B" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: 515 }}
                  animate={{ strokeDashoffset: 515 - (515 * Math.min(payments.length / 12, 1)) }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  style={{ strokeDasharray: 515 }}
                />
              </svg>
              <div className="progress-text text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span className="text-4xl text-gold font-display block">{Math.round(Math.min(payments.length / 12, 1) * 100)}%</span>
                <span className="text-[0.6rem] uppercase tracking-widest opacity-50">Maturity</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-white text-xl mb-1">Standard 12M Plan</h3>
              <p className="text-[0.7rem] uppercase tracking-widest text-gold">{payments.length} / 12 Instalments</p>
            </div>
          </motion.div>

          {/* Stats & Payment */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="dashboard-card !p-6 flex items-center gap-4 border-gold-10"
                >
                  <div className="text-gold opacity-70">{stat.icon}</div>
                  <div>
                    <span className="text-[0.6rem] uppercase tracking-widest opacity-50 block">{stat.label}</span>
                    <span className="text-white font-medium">{stat.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="dashboard-card !p-8 border-gold-20"
            >
              <h3 className="text-white text-xl mb-6 flex items-center gap-3">
                <TrendingUp size={20} className="text-gold" /> Add Monthly Contribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="input-wrap">
                  <label className="text-[0.65rem] uppercase tracking-widest opacity-40 mb-2 block">Contribution Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="premium-input font-display text-2xl !bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-50">Estimated Gold Weight:</span>
                    <span className="text-gold font-medium">{(amount / (rates.gold24 || 6500)).toFixed(3)}g</span>
                  </div>
                  <button 
                    onClick={handlePayment} 
                    disabled={loading}
                    className="btn btn-gold w-full py-4 text-sm"
                  >
                    {loading ? 'Processing...' : 'Complete Payment'}
                  </button>
                </div>
              </div>
              <p className="mt-6 text-[0.7rem] italic opacity-40 flex items-center gap-2">
                <Info size={12} /> Live market rates will be locked at the moment of payment success.
              </p>
            </motion.div>
          </div>
        </div>

        {/* SIP Plans */}
        <section className="mt-20 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <span className="eyebrow">Investment Tiers</span>
            <h3 className="text-white text-3xl flex items-center justify-center gap-3">
              <Award size={24} className="text-gold" /> Available SIP Plans
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`dashboard-card !p-10 text-center border-gold-10 hover:border-gold/30 transition-all ${payments.length >= parseInt(plan.months) ? 'border-gold !bg-gold/10' : ''}`}
              >
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <TrendingUp size={28} />
                    </div>
                </div>
                <span className="text-gold font-display text-3xl mb-2 block">{plan.months}</span>
                <h4 className="text-white uppercase tracking-[0.3em] text-[0.65rem] mb-6 font-semibold">{plan.name}</h4>
                <div className="h-px bg-white/10 w-12 mx-auto mb-6"></div>
                <p className="text-sm text-champagne mb-4 leading-relaxed">{plan.benefit}</p>
                <p className="text-[0.6rem] opacity-40 uppercase tracking-widest font-medium">Min. {plan.min} / month</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Transaction History */}
        <div className="mt-16">
          <h3 className="text-white text-2xl mb-8 flex items-center gap-3">
            <Calendar size={24} className="text-gold" /> Recent Contributions
          </h3>
          <div className="dashboard-card !p-0 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4 text-[0.65rem] uppercase tracking-widest opacity-40 font-medium">Date</th>
                  <th className="p-4 text-[0.65rem] uppercase tracking-widest opacity-40 font-medium">Amount</th>
                  <th className="p-4 text-[0.65rem] uppercase tracking-widest opacity-40 font-medium">Gold (g)</th>
                  <th className="p-4 text-[0.65rem] uppercase tracking-widest opacity-40 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.length > 0 ? payments.map((p, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-xs">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-medium text-white">₹ {p.amount.toLocaleString()}</td>
                    <td className="p-4 text-xs text-gold">{p.goldWeight?.toFixed(3) || '-'}</td>
                    <td className="p-4 text-xs"><span className="text-green-400 opacity-80 uppercase text-[0.6rem] tracking-widest">Successful</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center opacity-40 text-sm italic">No contributions found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPDashboard;
