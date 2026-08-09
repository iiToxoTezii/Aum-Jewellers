const fs = require('fs');
const file = 'c:/Aum Jewellers app/src/pages/AdminHub.jsx';
let content = fs.readFileSync(file, 'utf8');

const formToExtract = `        {/* Send Push Notification Form */}
        <div className="dashboard-card border-gold-20 mt-8">
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
        </div>`;
content = content.replace(formToExtract, '');

const newFunc = `
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

`;
content = content.replace('const renderSIPs = () => (', newFunc + 'const renderSIPs = () => (');

const oldTabs = `<button onClick={() => setActiveTab('collections')} className={\`admin-tab \${activeTab === 'collections' ? 'active' : ''}\`}>
          <Layout size={14} className="inline mr-2" /> Collections
        </button>
        <button onClick={() => setActiveTab('enquiries')} className={\`admin-tab \${activeTab === 'enquiries' ? 'active' : ''}\`}>
          <MessageSquare size={14} className="inline mr-2" /> Enquiries
        </button>`;
const newTabs = `<button onClick={() => setActiveTab('broadcasts')} className={\`admin-tab \${activeTab === 'broadcasts' ? 'active' : ''}\`}>
          <Bell size={14} className="inline mr-2" /> Broadcasts
        </button>`;
content = content.replace(oldTabs, newTabs);

const oldContent = `{activeTab === 'collections' && (
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
          )}`;
const newContent = `{activeTab === 'broadcasts' && renderBroadcasts()}`;
content = content.replace(oldContent, newContent);

fs.writeFileSync(file, content);
console.log('Update complete');
