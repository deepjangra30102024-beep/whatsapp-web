import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import AuthPage from './components/Auth/AuthPage';
import { contactsData } from './data/dummyData';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState(contactsData);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setContacts(prevContacts => 
        prevContacts.map(contact => {
          if (contact.id === data.contactId) {
            const exists = contact.messages?.some(m => m.id === data.message.id);
            if (!exists) {
               return { ...contact, messages: [...(contact.messages || []), data.message] };
            }
          }
          return contact;
        })
      );
    });

    return () => socket.off('receive_message');
  }, []);

  const activeContact = contacts.find(c => c.id === activeChatId);

  const handleSendMessage = (contactId, message) => {
    socket.emit('send_message', { contactId, message });
    
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, messages: [...(contact.messages || []), message] } 
          : contact
      )
    );
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentUser={currentUser}
        contacts={contacts} 
        activeChatId={activeChatId} 
        onSelectChat={(contact) => setActiveChatId(contact.id)} 
      />
      <ChatWindow 
        currentUser={currentUser}
        contact={activeContact} 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
}

export default App;
