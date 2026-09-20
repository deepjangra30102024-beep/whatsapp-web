import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SearchBox from './SearchBox';
import ChatList from './ChatList';

const Sidebar = ({ currentUser, contacts, activeChatId, onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      <SidebarHeader currentUser={currentUser} />
      <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ChatList 
        contacts={filteredContacts} 
        activeChatId={activeChatId} 
        onSelectChat={onSelectChat} 
      />
    </div>
  );
};

export default Sidebar;
