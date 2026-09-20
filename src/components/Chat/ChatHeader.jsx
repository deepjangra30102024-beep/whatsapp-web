import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, MoreVertical, Users, X, Check, ArrowLeft } from 'lucide-react';
const ChatHeader = ({ contact, currentUser, contacts, onSearch, onClearMessages, onRemoveMember, onAddMembers, onBack, onToggleContactInfo }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMemberUI, setShowAddMemberUI] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const closeSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  const handleClearMessages = () => {
    setIsMenuOpen(false);
    if (window.confirm("Are you sure you want to clear all messages?")) {
      if (onClearMessages) onClearMessages(contact.id);
    }
  };

  const getMemberDetails = () => {
    if (!contact?.isCommunity || !contact?.members) return [];
    return contact.members.map(memberId => {
      if (memberId === currentUser.id) return { ...currentUser, isMe: true };
      const found = contacts?.find(c => c.id === memberId);
      return found ? { ...found, isMe: false } : { id: memberId, name: 'Unknown User', avatar: window.DEFAULT_AVATAR || 'https://via.placeholder.com/150', isMe: false };
    });
  };

  const isOwner = contact?.isCommunity && String(contact?.created_by) === String(currentUser?.id);

  return (
    <div className="header" style={{ position: 'relative' }}>
      
      {isSearching ? (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', backgroundColor: '#202c33', padding: '5px' }}>
          <Search size={20} color="#8696a0" style={{ margin: '0 10px' }} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
            style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#e9edef', outline: 'none', fontSize: '15px' }}
          />
          <button onClick={closeSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#8696a0" />
          </button>
        </div>
      ) : (
        <>
          <div 
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}
            onClick={() => {
              if (contact.isCommunity) {
                setShowMembers(true);
              } else if (onToggleContactInfo) {
                onToggleContactInfo();
              }
            }}
          >
            <button className="mobile-back-btn" onClick={(e) => { e.stopPropagation(); if(onBack) onBack(); }} style={{ marginRight: '10px' }}>
              <ArrowLeft size={24} color="#8696a0" />
            </button>
            <img src={contact.avatar} alt={contact.name} className="header-avatar" style={{ borderRadius: contact.isCommunity ? '10px' : '50%' }} />
            <div className="chat-header-info">
              <span className="chat-header-name" style={{ display: 'flex', alignItems: 'center' }}>
                {contact.name}
                {contact.isCommunity && <Users size={16} style={{ marginLeft: '8px', color: '#8696a0' }} />}
              </span>
              <span className="chat-header-status">
                {contact.isCommunity 
                  ? `${contact.members?.length || 0} members${contact.pendingMembers?.length > 0 ? `, ${contact.pendingMembers.length} pending` : ''}` 
                  : (contact.isOnline ? 'online' : (contact.lastSeen ? (contact.lastSeen === 'online' ? 'online' : `last seen ${contact.lastSeen}`) : ''))}
              </span>
            </div>
          </div>
          <div className="header-actions" style={{ position: 'relative' }}>
            <button title="Search" onClick={() => setIsSearching(true)}><Search size={20} /></button>
            <button title="Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}><MoreVertical size={20} /></button>
            
            {isMenuOpen && (
              <div ref={menuRef} style={{ position: 'absolute', top: '40px', right: '10px', backgroundColor: '#233138', borderRadius: '3px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 100, minWidth: '150px' }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: '10px 0' }}>
                  {contact.isCommunity && (
                    <li 
                      onClick={() => { setIsMenuOpen(false); setShowMembers(true); }} 
                      style={{ padding: '10px 20px', color: '#e9edef', cursor: 'pointer', fontSize: '14px' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#182229'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Community Info
                    </li>
                  )}
                  <li 
                    onClick={handleClearMessages} 
                    style={{ padding: '10px 20px', color: '#e9edef', cursor: 'pointer', fontSize: '14px' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#182229'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Clear messages
                  </li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {showMembers && createPortal(
        <div className="members-modal-overlay" onClick={() => setShowMembers(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(11, 20, 26, 0.85)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="members-modal" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#202c33', width: '400px', maxWidth: '90%', 
            borderRadius: '3px', display: 'flex', flexDirection: 'column', 
            maxHeight: '80vh', color: '#e9edef', zIndex: 10000
          }}>
            <div className="members-modal-header" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '20px', borderBottom: '1px solid #2a3942'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Community Info</h3>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMembers(false); }} style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', padding: '8px', zIndex: 10001 }}>
                <X size={20} style={{ pointerEvents: 'none' }} />
              </button>
            </div>
            <div className="members-modal-content" style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <img src={contact.avatar} alt={contact.name} style={{ width: '120px', height: '120px', borderRadius: '10px', objectFit: 'cover', marginBottom: '15px' }} />
                <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#e9edef' }}>{contact.name}</h2>
                <p style={{ margin: 0, color: '#8696a0', fontSize: '14px' }}>Community • {contact.members?.length || 0} members</p>
              </div>

              {contact.description && (
                <div style={{ backgroundColor: '#111b21', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#00a884', fontSize: '14px' }}>Description</h4>
                  <p style={{ margin: 0, color: '#e9edef', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{contact.description}</p>
                </div>
              )}

              <div style={{ backgroundColor: '#111b21', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#8696a0', fontSize: '14px' }}>Members</h4>
                  {isOwner && (
                    <button 
                      onClick={() => setShowAddMemberUI(!showAddMemberUI)}
                      style={{ backgroundColor: 'transparent', color: '#00a884', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    >
                      {showAddMemberUI ? 'Cancel' : 'Add member'}
                    </button>
                  )}
                </div>
                {showAddMemberUI ? (
                  <div className="add-member-ui" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#202c33', borderRadius: '5px' }}>
                      {contacts.filter(c => !contact.members?.includes(c.id)).map(c => (
                        <div key={c.id} onClick={() => {
                          if (selectedNewMembers.includes(c.id)) {
                            setSelectedNewMembers(selectedNewMembers.filter(id => id !== c.id));
                          } else {
                            setSelectedNewMembers([...selectedNewMembers, c.id]);
                          }
                        }} style={{ display: 'flex', alignItems: 'center', padding: '10px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #8696a0', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: selectedNewMembers.includes(c.id) ? '#00a884' : 'transparent', borderColor: selectedNewMembers.includes(c.id) ? '#00a884' : '#8696a0' }}>
                            {selectedNewMembers.includes(c.id) && <Check size={14} color="#111b21" strokeWidth={3} />}
                          </div>
                          <img src={c.avatar} alt={c.name} style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }} />
                          <span style={{ color: '#e9edef' }}>{c.name}</span>
                        </div>
                      ))}
                      {contacts.filter(c => !contact.members?.includes(c.id)).length === 0 && (
                        <div style={{ padding: '15px', color: '#8696a0', textAlign: 'center' }}>No new contacts to add</div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        if (selectedNewMembers.length > 0 && onAddMembers) {
                          onAddMembers(contact.id, selectedNewMembers);
                          setShowAddMemberUI(false);
                          setSelectedNewMembers([]);
                        }
                      }}
                      style={{ padding: '10px', borderRadius: '5px', cursor: 'pointer', backgroundColor: selectedNewMembers.length > 0 ? '#00a884' : '#3b4043', color: selectedNewMembers.length > 0 ? '#111b21' : '#8696a0', border: 'none', fontWeight: '500', transition: 'all 0.2s' }}
                      disabled={selectedNewMembers.length === 0}
                    >
                      Add Selected
                    </button>
                  </div>
                ) : (
                  <div className="members-modal-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {getMemberDetails().length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#8696a0' }}>No members found.</div>
                    ) : (
                      getMemberDetails().map(member => (
                        <div key={member.id} className="member-item" style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
                          <img src={member.avatar} alt={member.name || member.username} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} />
                          <div className="member-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <span className="member-name" style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: '#e9edef' }}>
                              {member.name || member.username} {member.isMe ? '(You)' : ''}
                              {String(contact.created_by) === String(member.id) && <span style={{ backgroundColor: 'rgba(0, 168, 132, 0.1)', color: '#00a884', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Admin</span>}
                            </span>
                          </div>
                          {isOwner && !member.isMe && (
                            <button 
                              type="button"
                              className="remove-member-btn"
                              style={{ backgroundColor: 'transparent', color: '#f15c6d', border: '1px solid #f15c6d', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', zIndex: 10001, position: 'relative' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onRemoveMember) onRemoveMember(contact.id, member.id);
                              }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ChatHeader;
