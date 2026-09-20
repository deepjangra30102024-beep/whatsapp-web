import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';

const StatusPanel = ({ currentUser, onClose }) => {
  const [statuses, setStatuses] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/statuses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStatuses(data);
        }
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      }
    };
    fetchStatuses();
  }, []);

  const handleAddStatus = async (e) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/statuses`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newStatusText })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newStatus = {
          id: data.id,
          text: data.text,
          timestamp: data.timestamp,
          user_id: currentUser.id,
          avatar: currentUser.avatar,
          name: currentUser.username
        };
        setStatuses([newStatus, ...statuses]);
        setNewStatusText('');
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Failed to create status", err);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const myStatuses = statuses.filter(s => s.user_id === currentUser.id);
  const recentUpdates = statuses.filter(s => s.user_id !== currentUser.id);

  return (
    <div className="slide-panel">
      <div className="panel-header">
        <button onClick={onClose} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h2>Status</h2>
      </div>
      <div className="panel-content status-content" style={{ position: 'relative' }}>
        
        {isCreating ? (
           <div className="create-status-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#111b21', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <h3 style={{ color: '#e9edef', margin: 0 }}>Create Status</h3>
                 <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer' }}>
                   <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleAddStatus} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <textarea 
                  placeholder="Type a status..." 
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#2a2f32', color: '#fff', border: 'none', borderRadius: '10px', padding: '20px', fontSize: '24px', outline: 'none', resize: 'none', textAlign: 'center' }}
                />
                <button type="submit" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#00a884', color: '#111b21', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Send
                </button>
              </form>
           </div>
        ) : null}

        <div className="status-section">
          <div className="my-status" style={{ display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer' }} onClick={() => setIsCreating(true)}>
            <div className="status-avatar-container" style={{ position: 'relative' }}>
              <img src={currentUser?.avatar || 'https://via.placeholder.com/150'} alt="My Status" className="status-avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              <div className="add-status-icon" style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00a884', borderRadius: '50%', padding: '2px', border: '2px solid #111b21' }}>
                <Plus size={16} color="#fff" />
              </div>
            </div>
            <div className="status-info" style={{ marginLeft: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#e9edef' }}>My status</h4>
              <p style={{ margin: 0, color: '#8696a0', fontSize: '14px' }}>
                {myStatuses.length > 0 ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}` : 'Tap to add status update'}
              </p>
            </div>
          </div>
        </div>

        {myStatuses.length > 0 && (
          <div className="my-statuses-list" style={{ padding: '0 15px 15px 15px' }}>
            {myStatuses.map(status => (
              <div key={status.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2a2f32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', border: '2px solid #00a884' }}>
                    <span style={{ color: '#fff', fontSize: '10px' }}>Txt</span>
                 </div>
                 <div>
                    <p style={{ margin: 0, color: '#e9edef', fontSize: '15px' }}>{status.text.length > 20 ? status.text.substring(0, 20) + '...' : status.text}</p>
                    <p style={{ margin: '2px 0 0 0', color: '#8696a0', fontSize: '12px' }}>{formatTime(status.timestamp)}</p>
                 </div>
              </div>
            ))}
          </div>
        )}

        <div className="status-divider" style={{ padding: '15px', color: '#00a884', textTransform: 'uppercase', fontSize: '14px', fontWeight: '500' }}>
          <span>Recent updates</span>
        </div>
        <div className="status-list">
          {recentUpdates.length > 0 ? (
            <div className="recent-updates-list" style={{ padding: '0 15px' }}>
              {recentUpdates.map(status => (
                <div key={status.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={status.avatar} alt={status.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px', border: '2px solid #00a884', padding: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#e9edef', fontSize: '16px' }}>{status.name}</h4>
                    <p style={{ margin: 0, color: '#e9edef', fontSize: '14px' }}>{status.text}</p>
                    <p style={{ margin: '2px 0 0 0', color: '#8696a0', fontSize: '12px' }}>{formatTime(status.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-status-message" style={{ padding: '0 15px', color: '#8696a0', textAlign: 'center' }}>
              <p>No recent updates to show right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
