import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ currentUser, contact, onSendMessage }) => {
  const messages = contact?.messages || [];

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser.id
    };
    
    onSendMessage(contact.id, newMessage);
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

  return (
    <div className="chat-window">
      <ChatHeader contact={contact} />
      <MessageList messages={messages} currentUser={currentUser} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
