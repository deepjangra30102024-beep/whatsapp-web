import React from 'react';
import { Search, MoreVertical } from 'lucide-react';

const ChatHeader = ({ contact }) => {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <img src={contact.avatar} alt={contact.name} className="header-avatar" />
        <div className="chat-header-info">
          <span className="chat-header-name">{contact.name}</span>
          <span className="chat-header-status">
            {contact.lastSeen === 'online' ? 'online' : `last seen ${contact.lastSeen}`}
          </span>
        </div>
      </div>
      <div className="header-actions">
        <button title="Search"><Search size={20} /></button>
        <button title="Menu"><MoreVertical size={20} /></button>
      </div>
    </div>
  );
};

export default ChatHeader;
