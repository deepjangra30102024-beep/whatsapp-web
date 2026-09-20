import React, { useState, useRef } from 'react';
import { ArrowLeft, Users, Check, Camera } from 'lucide-react';

const CommunitiesPanel = ({ communities = [], currentUser, contacts = [], onCreateCommunity, onClose, onSelectChat }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    
    if (onCreateCommunity) {
      onCreateCommunity(newCommName, newCommDesc, selectedContacts, avatar);
    }
    
    setNewCommName('');
    setNewCommDesc('');
    setSelectedContacts([]);
    setAvatar(null);
    setIsCreating(false);
    onClose();
  };

  const toggleContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  return (
    <div className="slide-panel">
      <div className="panel-header">
        <button onClick={onClose} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h2>Communities</h2>
      </div>
      <div className="panel-content communities-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {!isCreating ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {communities.length > 0 ? (
              <div className="communities-list" style={{ overflowY: 'auto', flex: 1 }}>
                {communities.map(comm => (
                  <div 
                    key={comm.id} 
                    style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} 
                    onClick={() => {
                      if (onSelectChat) onSelectChat(comm);
                      onClose();
                    }}
                  >
                    <img src={comm.avatar || 'https://via.placeholder.com/150/00a884/FFFFFF?text=Users'} alt={comm.name} style={{ width: '50px', height: '50px', borderRadius: '10px', marginRight: '15px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#e9edef', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comm.name}</h4>
                      <p style={{ margin: 0, color: '#8696a0', fontSize: '13px' }}>
                        Created by: {comm.created_by === currentUser?.id ? 'You' : (comm.created_by_name || 'Unknown')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="community-hero" style={{ flex: 1 }}>
                <div className="hero-icon">
                  <Users size={48} color="#fff" />
                </div>
                <h3>Introducing communities</h3>
                <p>Easily organize your related groups and send announcements. Now, your communities, like neighborhoods or schools, can have their own space.</p>
              </div>
            )}
            <div style={{ padding: '20px', borderTop: '1px solid #202c33', textAlign: 'center' }}>
              <button className="start-community-btn" onClick={() => setIsCreating(true)} style={{ width: '100%', padding: '10px', borderRadius: '24px', backgroundColor: '#00a884', color: '#111b21', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Start your community
              </button>
            </div>
          </div>
        ) : (
          <div className="create-community-form" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '15px' }}>Create new community</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2a2f32', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px solid #8696a0' }}
                >
                  {avatar ? (
                    <img src={avatar} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={30} color="#8696a0" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                />
              </div>

              <input 
                type="text" 
                placeholder="Community name" 
                value={newCommName} 
                onChange={(e) => setNewCommName(e.target.value)}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#2a2f32', color: '#d1d7db', outline: 'none' }}
              />
              <textarea 
                placeholder="Community description" 
                value={newCommDesc} 
                onChange={(e) => setNewCommDesc(e.target.value)}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#2a2f32', color: '#d1d7db', minHeight: '80px', outline: 'none', resize: 'vertical' }}
              />
              
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#e9edef' }}>Add Members</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#111b21', borderRadius: '5px', border: '1px solid #3b4043' }}>
                   {contacts.length > 0 ? contacts.map(c => (
                     <div key={c.id} onClick={() => toggleContact(c.id)} style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #8696a0', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedContacts.includes(c.id) ? '#00a884' : 'transparent', borderColor: selectedContacts.includes(c.id) ? '#00a884' : '#8696a0' }}>
                          {selectedContacts.includes(c.id) && <Check size={14} color="#111b21" strokeWidth={3} />}
                       </div>
                       <img src={c.avatar} alt={c.name} style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }} />
                       <span style={{ color: '#e9edef' }}>{c.name}</span>
                     </div>
                   )) : (
                     <div style={{ padding: '15px', color: '#8696a0', textAlign: 'center' }}>No contacts found</div>
                   )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '15px' }}>
                <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#3b4043', color: '#d1d7db', border: 'none' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#00a884', color: '#111b21', border: 'none', fontWeight: '500' }}>Create</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPanel;
