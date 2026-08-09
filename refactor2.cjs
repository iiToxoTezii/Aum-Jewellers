const fs = require('fs');
const file = 'c:/Aum Jewellers app/src/pages/AdminHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rewrite the main return block
const startPattern = `  return (
    <div className="admin-page-wrap min-h-screen relative overflow-hidden" style={{
      backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.8), rgba(23, 26, 19, 0.95)), url('/images/Jewellery/jewellery_mockup_2.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>`;
const newReturn = `  return (
    <div className="admin-dashboard-layout" style={{
      backgroundImage: "linear-gradient(rgba(23, 26, 19, 0.85), rgba(10, 10, 10, 0.98)), url('/images/Jewellery/jewellery_mockup_2.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>`;
content = content.replace(startPattern, newReturn);

const regex = /<div className="premium-container pt-56 pb-32 relative z-10">([\s\S]*?)<div className="admin-content-area">/g;

const newSidebar = `
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <div className="mb-10 mt-4 px-2">
          <span className="uppercase text-[0.6rem] tracking-[0.4em] text-gold font-bold mb-2 block">Command Center</span>
          <h2 className="text-2xl text-white font-display uppercase tracking-widest">Admin <em className="text-gold italic font-serif">Hub</em></h2>
          <div className="h-0.5 w-12 bg-gold/30 rounded-full mt-3"></div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <button onClick={() => setActiveTab('overview')} className={\`admin-sidebar-tab \${activeTab === 'overview' ? 'active' : ''}\`}>
            <BarChart3 size={16} /> Overview
          </button>
          <button onClick={() => setActiveTab('users')} className={\`admin-sidebar-tab \${activeTab === 'users' ? 'active' : ''}\`}>
            <Users size={16} /> Customers
          </button>
          <button onClick={() => setActiveTab('sip')} className={\`admin-sidebar-tab \${activeTab === 'sip' ? 'active' : ''}\`}>
            <Package size={16} /> SIP Records
          </button>
          <button onClick={() => setActiveTab('broadcasts')} className={\`admin-sidebar-tab \${activeTab === 'broadcasts' ? 'active' : ''}\`}>
            <Bell size={16} /> Broadcasts
          </button>
          <button onClick={() => setActiveTab('access')} className={\`admin-sidebar-tab \${activeTab === 'access' ? 'active' : ''}\`}>
            <UserCheck size={16} /> Admin Access
          </button>
          
          <div className="mt-8 mb-2 px-4 uppercase text-[0.55rem] tracking-[0.2em] opacity-40">System</div>
          
          <button onClick={() => setActiveTab('maintenance')} className={\`admin-sidebar-tab \${activeTab === 'maintenance' ? 'active' : ''}\`}>
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
`;

content = content.replace(regex, newSidebar);

content = content.replace(/className="admin-stat-box dashboard-card !border-gold\/10 group hover:!border-gold\/30 transition-all"/g, 'className="admin-glass-card group"');
content = content.replace(/className="val gold-gradient-text text-4xl mb-2"/g, 'className="admin-metric-value"');
content = content.replace(/className="lbl tracking-\[0.2em\] font-medium"/g, 'className="admin-metric-label"');

fs.writeFileSync(file, content);
console.log('Update complete');
