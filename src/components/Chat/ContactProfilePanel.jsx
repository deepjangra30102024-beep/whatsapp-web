import React from 'react';
import { X } from 'lucide-react';

const ContactProfilePanel = ({ contact, onClose }) => {
  if (!contact) return null;

  return (
    <div className="contact-info-panel" style={{ width: '350px', flexShrink: 0, backgroundColor: '#111b21', borderLeft: '1px solid rgba(134,150,160,0.15)', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', backgroundColor: '#202c33', color: '#e9edef', borderBottom: '1px solid rgba(134,150,160,0.15)' }}>
        <button onClick={onClose} className="close-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '20px', color: '#aebac1' }}>
          <X size={24} />
        </button>
        <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 500 }}>Contact info</h2>
      </div>
      
      <div className="panel-content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#111b21' }}>
        
        <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(134,150,160,0.15)' }}>
          <img 
            src={contact.avatar || 'https://via.placeholder.com/200'} 
            alt={contact.name} 
            style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }} 
          />
          <h2 style={{ margin: 0, fontSize: '24px', color: '#e9edef' }}>{contact.name}</h2>
          {contact.isCommunity && <span style={{ color: '#8696a0', fontSize: '14px', marginTop: '5px' }}>Community</span>}
        </div>

        <div style={{ padding: '14px 30px 20px', borderBottom: '1px solid rgba(134,150,160,0.15)' }}>
          <span style={{ color: '#8696a0', fontSize: '14px', display: 'block', marginBottom: '8px' }}>About</span>
          <span style={{ fontSize: '17px', color: '#e9edef' }}>
            {contact.description || (contact.isCommunity ? 'No description provided.' : 'Hey there! I am using WhatsApp.')}
          </span>
        </div>

      </div>
    </div>
  );
};

export default ContactProfilePanel;
