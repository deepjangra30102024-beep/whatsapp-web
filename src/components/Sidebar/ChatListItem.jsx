import React from 'react';

const ChatListItem = ({ contact, isActive, onClick }) => {
  const lastMessage = contact.messages[contact.messages.length - 1];
  
  return (
    <div className={`chat-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <img src={contact.avatar} alt={contact.name} className="chat-item-avatar" />
      <div className="chat-item-info">
        <div className="chat-item-top">
          <span className="chat-item-name text-ellipsis">{contact.name}</span>
          <span className="chat-item-time">{lastMessage?.time || contact.lastSeen}</span>
        </div>
        <div className="chat-item-bottom">
          <span className="chat-item-msg text-ellipsis">
            {lastMessage?.text || "Started a new chat"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
