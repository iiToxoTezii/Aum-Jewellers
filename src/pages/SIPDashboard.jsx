import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Wallet, Info, CheckCircle, Download, ArrowDownLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRates } from '../hooks/useRates';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const WalletCard = ({ planName, payments, isPremium, totalSaved, totalGold }) => {
  const maxInstalments = isPremium ? 12 : 13; 
  const currentInstalments = payments.length;
  const progress = Math.min(currentInstalments / maxInstalments, 1);
  const circ = 314.16; // 2 * PI * 50
  const strokeDashoffset = circ - (circ * progress);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`dashboard-card relative p-6 md:p-8 overflow-hidden w-full`}
      style={{ minHeight: '200px' }}
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center h-full relative z-10 gap-2 sm:gap-4">
        
        {/* Left Side: Stats */}
        <div className="flex flex-col justify-between h-full flex-1">
          <div>
            <h3 className="text-white/80 text-[0.65rem] md:text-xs uppercase tracking-widest mb-2 font-medium flex items-center gap-2">
              {isPremium ? <Award size={14} /> : <Wallet size={14} />} {planName}
            </h3>
            <div className="text-white text-3xl md:text-4xl font-display font-bold">
              {isPremium ? `${totalGold.toFixed(3)}g` : `₹ ${totalSaved.toLocaleString()}`}
            </div>
            {isPremium && <div className="text-white/80 text-xs mt-2">₹ {totalSaved.toLocaleString()} Accumulated</div>}
          </div>
          <div className="mt-8">
            <div className="text-white/60 text-[0.55rem] uppercase tracking-widest mb-1">Instalments Paid</div>
            <div className="text-white text-sm font-medium tracking-wide">{currentInstalments} <span className="opacity-50">/ {maxInstalments}</span></div>
          </div>
        </div>

        {/* Right Side: Circle */}
        <div className="progress-ring-wrap relative flex-shrink-0" style={{ width: '120px', height: '120px' }}>
          <svg className="progress-ring drop-shadow-xl" width="120" height="120">
            {/* The base track */}
            {!isPremium ? (
              <>
                {/* 12M Track with gap */}
                <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" strokeDasharray={`284 314.16`} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                {/* +1M Dark Segment */}
                <circle cx="60" cy="60" r="50" stroke="rgba(0,0,0,0.5)" strokeWidth="6" fill="none" strokeDasharray={`20 314.16`} strokeDashoffset={-290} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
              </>
            ) : (
              <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
            )}
            
            {/* The fill */}
            <motion.circle 
              className="ring-fill" 
              cx="60" cy="60" r="50" 
              stroke="#ffffff" 
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
              style={{ strokeDasharray: circ, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />

            {/* Premium Stamps */}
            {isPremium && (
              <>
                <circle cx="60" cy="60" r="50" stroke="#000000" strokeWidth="12" fill="none" strokeDasharray={`2 312.16`} strokeDashoffset={0} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', opacity: 0.5 }} />
                <circle cx="60" cy="60" r="50" stroke="#000000" strokeWidth="12" fill="none" strokeDasharray={`2 312.16`} strokeDashoffset={-(circ * 0.25)} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', opacity: 0.5 }} />
                <circle cx="60" cy="60" r="50" stroke="#000000" strokeWidth="12" fill="none" strokeDasharray={`2 312.16`} strokeDashoffset={-(circ * 0.50)} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', opacity: 0.5 }} />
              </>
            )}
          </svg>

          {/* Premium Labels */}
          {isPremium && (
            <>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>12M</div>
              <div style={{ position: 'absolute', top: '50%', right: '-15px', transform: 'translateY(-50%)', fontSize: '0.5rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>3M</div>
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>6M</div>
            </>
          )}

          {/* Basic Label */}
          {!isPremium && (
            <div style={{ position: 'absolute', top: '-2px', left: '2px', fontSize: '0.5rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>+1M</div>
          )}
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-xl text-white font-display leading-none">{Math.round(progress * 100)}%</span>
            <span style={{ fontSize: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', color: 'rgba(255,255,255,0.8)' }}>Maturity</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const TransactionsCard = ({ planName, payments, isPremium }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-white text-xl mb-4 flex items-center gap-3 font-display">
        <Calendar size={20} className="text-gold" /> 
        {planName} Transactions
      </h3>
      
      <div className="relative border-l border-gold/20 ml-2 pl-6 pb-4 max-h-[500px] overflow-y-auto pr-4">
        {payments.map((p, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-6 relative"
          >
            <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-dark border-2 border-gold flex items-center justify-center z-10">
              <ArrowDownLeft size={10} className="text-gold" />
            </div>
            <div className="dashboard-card !p-4 border border-white/5 bg-gradient-to-r from-white/5 to-transparent hover:border-gold/30 transition-colors">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-display text-lg">₹ {p.amount.toLocaleString()}</span>
                    {p.source && <span className="px-2 py-0.5 rounded text-[0.6rem] uppercase tracking-widest bg-white/10 text-white/70">{p.source}</span>}
                  </div>
                  <div className="text-xs text-champagne">
                    {new Date(p.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="md:text-right">
                  <div className="text-[0.65rem] uppercase tracking-widest opacity-50 mb-1">
                    {isPremium ? 'Gold Value Locked' : 'Accumulated Value'}
                  </div>
                  <div className="text-gold font-medium">
                    {isPremium 
                      ? `${p.calculatedGoldTillDate?.toFixed(3) || '0.000'} g`
                      : `₹ ${(p.calculatedAmountTillDate?.toLocaleString() || '-')}`
                    }
                  </div>
                </div>
                <div className="md:ml-4 flex-shrink-0">
                  {p.receiptUrl ? (
                    <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-outline !py-1.5 !px-3 text-[0.6rem] flex items-center gap-2">
                      <Download size={12} /> Receipt
                    </a>
                  ) : (
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[0.6rem] uppercase tracking-widest opacity-50 flex items-center gap-1">
                      <CheckCircle size={10} /> Verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {payments.length === 0 && (
          <div className="text-center opacity-50 py-4 text-xs italic">No transactions found for this plan.</div>
        )}
      </div>
    </div>
  );
};

const SIPDashboard = () => {
  const { currentUser, userData } = useAuth();
  const { rates } = useRates();
  
  const [basicPayments, setBasicPayments] = useState([]);
  const [premiumPayments, setPremiumPayments] = useState([]);
  const [basicTotalAmt, setBasicTotalAmt] = useState(0);
  const [premiumTotalGold, setPremiumTotalGold] = useState(0);
  const [premiumTotalAmt, setPremiumTotalAmt] = useState(0);
  
  const [queryError, setQueryError] = useState(null);
  const [selectedPlanCard, setSelectedPlanCard] = useState('Premium Flexible Bishi Plan');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const availablePlansInCards = userData?.physicalCards 
    ? [...new Set(userData.physicalCards.map(c => c.plan || 'Basic 12M Plan'))] 
    : [];

  const handleDownloadCard = () => {
    if (userData?.physicalCards && userData.physicalCards.length > 0) {
      if (!selectedMonth) {
        alert("Please select a month to download.");
        return;
      }
      const card = userData.physicalCards.find(c => 
        c.month === selectedMonth && (c.plan === selectedPlanCard || !c.plan)
      );
      if (card) {
        window.open(card.url, '_blank');
      } else {
        alert("Card not found for the selected month and plan.");
      }
    } else if (userData?.physicalCardUrl) {
      window.open(userData.physicalCardUrl, '_blank');
    } else {
      alert("No physical card available. Please contact the admin.");
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const q = collection(db, 'clients', currentUser.email.toLowerCase(), 'sip_records');

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setQueryError(null);
      let paymentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      paymentData = paymentData.filter(p => p.type === 'SIP');
      paymentData.sort((a, b) => new Date(b.date) - new Date(a.date));

      let bPayments = [];
      let pPayments = [];

      paymentData.forEach(p => {
        if (p.plan === 'Premium Flexible Bishi Plan') {
          pPayments.push(p);
        } else {
          bPayments.push(p); 
        }
      });

      let runningBasicAmt = 0;
      for (let i = bPayments.length - 1; i >= 0; i--) {
        runningBasicAmt += (bPayments[i].amount || 0);
        bPayments[i].calculatedAmountTillDate = runningBasicAmt;
      }
      setBasicTotalAmt(runningBasicAmt);

      let runningPremiumGold = 0;
      let runningPremiumAmt = 0;
      for (let i = pPayments.length - 1; i >= 0; i--) {
        runningPremiumAmt += (pPayments[i].amount || 0);
        runningPremiumGold += (pPayments[i].explicitGoldBooked || pPayments[i].goldWeight || (pPayments[i].amount / 6500) || 0);
        pPayments[i].calculatedGoldTillDate = runningPremiumGold;
        pPayments[i].calculatedAmountTillDate = runningPremiumAmt;
      }
      setPremiumTotalAmt(runningPremiumAmt);
      setPremiumTotalGold(runningPremiumGold);
      
      setBasicPayments(bPayments);
      setPremiumPayments(pPayments);
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching real-time payments:", error);
      setQueryError(error.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="home-view">
        <header className="page-header relative overflow-hidden" style={{
          minHeight: '35vh', 
          paddingTop: '120px', 
          paddingBottom: '40px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.75), rgba(23, 26, 19, 0.95)), url('/images/Jewellery/bridal_4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
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

  const hasNoPayments = basicPayments.length === 0 && premiumPayments.length === 0;
  const hasTwoPlans = basicPayments.length > 0 && premiumPayments.length > 0;

  if (isLoading) {
    return (
      <div className="sip-view relative min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasNoPayments) {
    return (
      <div className="sip-view relative min-h-screen bg-dark">
        <div className="mandala-bg" style={{ position: 'fixed', opacity: 0.04 }}></div>
        <section className="gold-intro gold-intro-premium relative overflow-hidden flex flex-col items-center pt-32 pb-20" style={{
          minHeight: '100vh',
          backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(23, 26, 19, 0.98)), url('/images/Jewellery/bridal_4.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container relative z-10 flex flex-col items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="dashboard-card !p-8 border border-gold/20 shadow-2xl relative overflow-hidden mb-16"
              style={{ backdropFilter: 'blur(20px)', maxWidth: '800px', width: '100%', background: 'linear-gradient(145deg, rgba(199,154,107,0.05) 0%, rgba(0,0,0,0.6) 100%)' }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 shrink-0 bg-black/60 rounded-full flex items-center justify-center border border-gold/30 shadow-[0_0_30px_rgba(199,154,107,0.15)]">
                  <Info size={28} className="text-gold" />
                </div>
                <div>
                  <h2 className="text-white text-xl mb-2 font-display">No Active Portfolio</h2>
                  <p className="text-champagne leading-relaxed text-sm mb-4">
                    We couldn't find any active Gold SIP payments linked to <strong className="text-gold">{currentUser.email}</strong>.
                  </p>
                  <div className="text-champagne leading-relaxed text-sm">
                    <p className="mb-4">Once you have logged in, make sure to send your email ID along with your name to our WhatsApp number:</p>
                    <a href="https://wa.me/919320197788" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg mb-4" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <MessageCircle size={20} />
                      <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', lineHeight: 1 }}>WhatsApp Us: 93201 97788</span>
                    </a>
                    <p>Your data will soon be available for you to see on the website in real time.</p>
                  </div>
                  {queryError && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs">
                      <strong>Connection Error:</strong> {queryError}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="text-center mb-12">
              <span className="eyebrow text-gold">Explore Our Plans</span>
              <h3 className="section-heading text-white">Start Your Gold <em>Journey</em></h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="dashboard-card !p-8 md:!p-10 border border-gold/20 bg-black/40 hover:border-gold/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-gold font-display text-2xl">Basic 12M Plan</h4>
                  <Wallet size={28} className="text-gold opacity-50" />
                </div>
                <div className="h-px bg-white/10 w-full mb-6"></div>
                <p className="text-champagne leading-relaxed mb-6">
                  A disciplined 12-month savings plan where your commitment is rewarded. Pay a fixed amount for 12 months, and <strong>the store will gift you the 1 month's instalment!</strong>
                </p>
                <div className="bg-gold/5 border border-gold/10 p-4 rounded-xl">
                  <p className="text-sm text-white/80"><span className="text-gold font-medium">Example:</span> If you pay ₹1,000 for 12 months, your total contribution is ₹12,000. The store will provide an additional ₹1,000, bringing your total purchasing power to ₹13,000.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="dashboard-card !p-8 md:!p-10 border border-gold/40 bg-gold/5 hover:border-gold transition-colors relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gold text-dark text-[0.6rem] font-bold uppercase tracking-widest py-1 px-4 rounded-bl-xl">Most Popular</div>
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-gold font-display text-2xl">Premium Flexible Bishi</h4>
                  <Award size={28} className="text-gold opacity-50" />
                </div>
                <div className="h-px bg-white/10 w-full mb-6"></div>
                <p className="text-champagne leading-relaxed mb-4">
                  Enjoy the ultimate flexibility. Accumulate gold over time and withdraw whenever it suits your needs, with escalating discounts on making charges based on your duration.
                </p>
                <div className="bg-gold/5 border border-gold/10 p-4 rounded-xl mb-6">
                  <p className="text-sm text-white/80">
                    <span className="text-gold font-medium">Gold Booking:</span> In this plan, your gold is securely booked according to the exact payment you make each month at the prevailing gold rate!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const cardsForSelectedPlan = userData?.physicalCards 
    ? userData.physicalCards.filter(c => c.plan === selectedPlanCard || !c.plan) 
    : [];

  return (
    <div className="sip-view relative" style={{
      backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(23, 26, 19, 0.98)), url('/images/Jewellery/sip_dashboard_bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <div className="mandala-bg" style={{ position: 'fixed', opacity: 0.04 }}></div>
      
      <section className="gold-intro gold-intro-premium relative overflow-hidden" style={{
        paddingTop: '8rem', 
        paddingBottom: '10rem'
      }}>
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="eyebrow text-gold">Exclusive Membership</span>
            <div className="flex flex-col items-center justify-center gap-6">
              <h2 className="section-heading text-white m-0">Your Gold <em>Portfolio</em></h2>
              
              <div className="flex flex-col md:flex-row items-center gap-3 mt-2 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                {userData?.physicalCards && userData.physicalCards.length > 0 ? (
                  <>
                    {availablePlansInCards.length > 1 && (
                      <select 
                        className="premium-input !py-2 !px-3 !bg-transparent border border-gold/30 text-gold text-xs rounded-lg"
                        value={selectedPlanCard}
                        onChange={(e) => {
                          setSelectedPlanCard(e.target.value);
                          setSelectedMonth('');
                        }}
                      >
                        <option value="Premium Flexible Bishi Plan" className="text-dark">Premium Card</option>
                        <option value="Basic 12M Plan" className="text-dark">Basic Card</option>
                      </select>
                    )}
                    <select 
                      className="premium-input !py-2 !px-3 !bg-transparent border border-gold/30 text-gold text-xs rounded-lg"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="" className="text-dark">Select Month</option>
                      {cardsForSelectedPlan.map((c, i) => (
                        <option key={i} value={c.month} className="text-dark">{new Date(c.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleDownloadCard}
                      className="btn btn-outline !p-2 !px-4 rounded-lg text-gold border-gold/30 hover:bg-gold/10 flex items-center gap-2 text-xs"
                      title="Download Portfolio Card"
                    >
                      <Download size={14} /> Download
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleDownloadCard}
                    className="btn btn-outline !p-2 !px-4 rounded-lg text-gold border-gold/30 hover:bg-gold/10 flex items-center gap-2 text-xs"
                    title="Download Portfolio Card"
                  >
                    <Download size={14} /> Download Physical Card
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      <div id="sip-portfolio-section" className="container" style={{ marginTop: '-6rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        
        {/* Wallet Cards Stack */}
        <div className={`grid grid-cols-1 ${hasTwoPlans ? 'md:grid-cols-2' : ''} gap-8 mb-16 justify-center max-w-5xl mx-auto`}>
          {premiumPayments.length > 0 && (
            <div style={{ maxWidth: hasTwoPlans ? '100%' : '600px', margin: '0 auto', width: '100%' }}>
              <WalletCard 
                planName="Premium Flexible Bishi" 
                payments={premiumPayments} 
                isPremium={true} 
                totalSaved={premiumTotalAmt}
                totalGold={premiumTotalGold}
              />
            </div>
          )}
          {basicPayments.length > 0 && (
            <div style={{ maxWidth: hasTwoPlans ? '100%' : '600px', margin: '0 auto', width: '100%' }}>
              <WalletCard 
                planName="Basic 12M Plan" 
                payments={basicPayments} 
                isPremium={false} 
                totalSaved={basicTotalAmt}
                totalGold={0}
              />
            </div>
          )}
        </div>

        {/* Transactions & Stats Row */}
        <div className={`grid grid-cols-1 ${hasTwoPlans ? 'md:grid-cols-2' : ''} gap-12 md:gap-8 max-w-5xl mx-auto`}>
          {premiumPayments.length > 0 && (
            <TransactionsCard 
              planName="Premium Bishi" 
              payments={premiumPayments} 
              isPremium={true}
            />
          )}
          {basicPayments.length > 0 && (
            <TransactionsCard 
              planName="Basic 12M" 
              payments={basicPayments} 
              isPremium={false}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default SIPDashboard;
