import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import AuthPage from './components/Auth/AuthPage';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };
  const [contacts, setContacts] = useState([]);
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

  useEffect(() => {
    if (!currentUser) return;
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeChatId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/messages/${activeChatId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: data } : c));
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeChatId, currentUser]);

  const activeContact = contacts.find(c => c.id === activeChatId);

  const handleSendMessage = (contactId, message) => {
    socket.emit('send_message', { contactId, message, senderId: currentUser.id });
    
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, messages: [...(contact.messages || []), message] } 
          : contact
      )
    );
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
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
