import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import SearchBox from './SearchBox';
import ChatList from './ChatList';
import CommunitiesPanel from './CommunitiesPanel';
import StatusPanel from './StatusPanel';
import NewChatPanel from './NewChatPanel';
import ProfilePanel from './ProfilePanel';

const Sidebar = ({ currentUser, contacts, communities = [], activeChatId, onSelectChat, onUpdateProfile, onCreateCommunity }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState('default'); // default, communities, status, new_chat, profile

  const combinedList = [...(communities || []), ...contacts];
  const filteredContacts = combinedList.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar" style={{ position: 'relative', overflow: 'hidden' }}>
      <SidebarHeader 
        currentUser={currentUser} 
        setActivePanel={setActivePanel}
      />
      <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ChatList 
        contacts={filteredContacts} 
        activeChatId={activeChatId} 
        onSelectChat={onSelectChat} 
      />
      
      <div className={`panel-container ${activePanel === 'communities' ? 'open' : ''}`}>
        <CommunitiesPanel communities={communities} currentUser={currentUser} contacts={contacts} onCreateCommunity={onCreateCommunity} onClose={() => setActivePanel('default')} onSelectChat={onSelectChat} />
      </div>
      <div className={`panel-container ${activePanel === 'status' ? 'open' : ''}`}>
        <StatusPanel currentUser={currentUser} onClose={() => setActivePanel('default')} />
      </div>
      <div className={`panel-container ${activePanel === 'new_chat' ? 'open' : ''}`}>
        <NewChatPanel contacts={contacts} onClose={() => setActivePanel('default')} onSelectChat={onSelectChat} />
      </div>
      <div className={`panel-container ${activePanel === 'profile' ? 'open' : ''}`}>
        <ProfilePanel currentUser={currentUser} onClose={() => setActivePanel('default')} onUpdateProfile={onUpdateProfile} />
      </div>
    </div>
  );
};

export default Sidebar;
