import React from 'react';
import { Users } from 'lucide-react';

const ChatListItem = ({ contact, isActive, onClick }) => {
  const lastMessage = contact.messages?.[contact.messages.length - 1];
  
  return (
    <div className={`chat-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <img src={contact.avatar} alt={contact.name} className="chat-item-avatar" style={{ borderRadius: contact.isCommunity ? '10px' : '50%' }} />
      <div className="chat-item-info">
        <div className="chat-item-top">
          <span className="chat-item-name text-ellipsis" style={{ display: 'flex', alignItems: 'center' }}>
            {contact.name}
            {contact.isCommunity && <Users size={14} style={{ marginLeft: '5px', color: '#8696a0' }} />}
          </span>
          <span className="chat-item-time">{lastMessage?.time || contact.lastSeen || ''}</span>
        </div>
        <div className="chat-item-bottom">
          <span className="chat-item-msg text-ellipsis">
            {contact.isCommunity && !lastMessage ? "Community created" : (lastMessage?.text || "Started a new chat")}
          </span>
          {contact.unreadCount > 0 && (
            <span className="chat-item-unread" style={{
              backgroundColor: '#00a884',
              color: '#111b21',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '0 6px',
              marginLeft: '10px'
            }}>
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
