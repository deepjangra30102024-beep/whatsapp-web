import React from 'react';
import ChatListItem from './ChatListItem';

const ChatList = ({ contacts, activeChatId, onSelectChat }) => {
  return (
    <div className="chat-list">
      {contacts.map((contact) => (
        <ChatListItem 
          key={contact.id} 
          contact={contact} 
          isActive={activeChatId === contact.id}
          onClick={() => onSelectChat(contact)}
        />
      ))}
    </div>
  );
};

export default ChatList;
