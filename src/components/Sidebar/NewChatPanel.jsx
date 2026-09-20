import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import ChatListItem from './ChatListItem';

const NewChatPanel = ({ contacts, onClose, onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="slide-panel">
      <div className="panel-header new-chat-header">
        <button onClick={onClose} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <h2>New chat</h2>
      </div>
      <div className="panel-content new-chat-content">
        <div className="search-box">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search contacts" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="contacts-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <ChatListItem 
                key={contact.id} 
                contact={contact} 
                onClick={() => {
                  onSelectChat(contact);
                  onClose();
                }}
              />
            ))
          ) : (
            <div className="no-contacts">No contacts found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatPanel;
