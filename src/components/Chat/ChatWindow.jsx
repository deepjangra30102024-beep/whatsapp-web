import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ContactProfilePanel from './ContactProfilePanel';

const ChatWindow = ({ currentUser, contacts, contact, onSendMessage, onClearMessages, onDeleteMessage, onRemoveMember, onAddMembers, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const messages = contact?.messages || [];

  const handleSendMessage = (text, attachment) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser.id
    };
    
    onSendMessage(contact.id, newMessage, attachment);
  };

  if (!contact) {
    return (
      <div className="empty-chat">
        <img 
          src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa66cgOpezt.png" 
          alt="WhatsApp Web" 
          style={{ width: '320px', marginBottom: '24px' }}
        />
        <h1 className="empty-chat-title">Welcome, {currentUser.username}!</h1>
        <p className="empty-chat-desc">
          Select a chat to start messaging.<br/>
          Messages are synced via Socket.io and SQLite.
        </p>
      </div>
    );
  }

  const filteredMessages = messages.filter(msg => 
    msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      <div className="chat-window" style={{ flex: 1, minWidth: 0 }}>
        <ChatHeader 
          contact={contact}
          currentUser={currentUser}
          contacts={contacts}
          onSearch={(query) => setSearchQuery(query)} 
          onClearMessages={onClearMessages}
          onRemoveMember={onRemoveMember}
          onAddMembers={onAddMembers}
          onBack={onBack}
          onToggleContactInfo={() => setShowContactInfo(!showContactInfo)}
        />
        <MessageList messages={filteredMessages} currentUser={currentUser} onDeleteMessage={onDeleteMessage} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
      {showContactInfo && (
        <ContactProfilePanel contact={contact} onClose={() => setShowContactInfo(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
