import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import AuthPage from './components/Auth/AuthPage';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2RmZTVlNyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=';
export const DEFAULT_COMMUNITY_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2RmZTVlNyI+PHBhdGggZD0iTTE2IDExYzEuNjYgMCAyLjk5LTEuMzQgMi45OS0zUzE3LjY2IDUgMTYgNWMtMS42NiAwLTMgMS4zNC0zIDNzMS4zNCAzIDMgM3ptLTggMGMxLjY2IDAgMi45OS0xLjM0IDIuOTktM1M5LjY2IDUgOCA1QzYuMzQgNSA1IDYuMzQgNSA4czEuMzQgMyAzIDN6bTAgMmMtMi4zMyAwLTcgMS4xNy03IDMuNVYxOWgxNHYtMi41YzAtMi4zMy00LjY3LTMuNS03LTMuNXptOCAwYy0uMjkgMC0uNjIuMDItLjk3LjA1IDEuMTYuODQgMS45NyAxLjk3IDEuOTcgMy40NVYxOWg2di0yLjVjMC0yLjMzLTQuNjctMy41LTctMy41eiIvPjwvc3ZnPg==';

window.DEFAULT_AVATAR = DEFAULT_AVATAR;

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (!parsed.avatar || parsed.avatar.includes('pravatar.cc')) parsed.avatar = DEFAULT_AVATAR;
      return parsed;
    }
    return null;
  });

  const handleLoginSuccess = (user) => {
    if (!user.avatar) user.avatar = DEFAULT_AVATAR;
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { 
          ...currentUser, 
          avatar: data.avatar, 
          username: data.username, 
          description: data.description 
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return { success: true };
      } else {
        const errData = await res.json();
        console.error("Failed to update profile", errData);
        return { success: false, error: errData.error || "Failed to update profile" };
      }
    } catch (err) {
      console.error("Error updating profile", err);
      return { success: false, error: "Network error" };
    }
  };
  const [contacts, setContacts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      socket.emit('user_connected', currentUser.id);
    }

    socket.on('online_users', (users) => {
      setOnlineUsers(new Set(users));
    });

    socket.on('user_online', (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.add(data.userId);
        return next;
      });
    });

    socket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on('receive_message', (data) => {
      const updateMessages = (prev) => prev.map(item => {
        if (item.id === data.contactId) {
          const exists = item.messages?.some(m => m.id === data.message.id);
          if (!exists) {
            const isRead = activeChatId === data.contactId;
            return { 
              ...item, 
              messages: [...(item.messages || []), data.message],
              unreadCount: isRead ? 0 : (item.unreadCount || 0) + 1
            };
          }
        }
        return item;
      });
      setContacts(updateMessages);
      setCommunities(updateMessages);
      
      // If the message is for the currently active chat, mark it as read immediately
      if (activeChatId === data.contactId && currentUser) {
        socket.emit('mark_messages_read', { contactId: data.contactId, userId: currentUser.id });
      }
    });

    socket.on('message_deleted', (data) => {
      const { messageId } = data;
      setContacts(prev => prev.map(c => ({
        ...c, 
        messages: c.messages ? c.messages.filter(m => m.id !== messageId) : []
      })));
      setCommunities(prev => prev.map(c => ({
        ...c, 
        messages: c.messages ? c.messages.filter(m => m.id !== messageId) : []
      })));
    });

    socket.on('member_removed', (data) => {
      const { communityId, memberId } = data;
      setCommunities(prev => prev.map(c => {
        if (c.id === communityId) {
          return {
            ...c,
            members: (c.members || []).filter(id => id !== memberId)
          };
        }
        return c;
      }));
    });

    socket.on('members_added', (data) => {
      const { communityId, memberIds } = data;
      setCommunities(prev => prev.map(c => {
        if (c.id === communityId) {
          return {
            ...c,
            members: [...new Set([...(c.members || []), ...memberIds])]
          };
        }
        return c;
      }));
    });

    socket.on('added_to_community', async (data) => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      if (user && data.userId === user.id) {
        try {
          const token = localStorage.getItem('token');
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/communities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const commData = await res.json();
            const mappedData = commData.map(c => ({ 
              ...c, 
              avatar: (!c.avatar || c.avatar.includes('pravatar.cc')) ? DEFAULT_COMMUNITY_AVATAR : c.avatar 
            }));
            setCommunities(mappedData);
            mappedData.forEach(comm => {
              socket.emit('join_community', comm.id);
            });
          }
        } catch (err) {
          console.error("Failed to fetch communities", err);
        }
      }
    });

    socket.on('message_sent', (data) => {
      const { tempId, realId, contactId } = data;
      const updateMessages = (prev) => prev.map(c => {
        if (c.id === contactId && c.messages) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === tempId ? { ...m, id: realId } : m)
          };
        }
        return c;
      });
      setContacts(updateMessages);
      setCommunities(updateMessages);
    });

    socket.on('messages_read', (data) => {
      const { contactId } = data;
      const updateMessages = (prev) => prev.map(c => {
        if (c.id === contactId && c.messages) {
          return {
            ...c,
            messages: c.messages.map(m => ({ ...m, status: 'read' }))
          };
        }
        return c;
      });
      setContacts(updateMessages);
      setCommunities(updateMessages);
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('member_removed');
      socket.off('members_added');
      socket.off('added_to_community');
      socket.off('message_sent');
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('messages_read');
    };
  }, [currentUser, activeChatId]);

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
          setContacts(data.map(c => ({ 
            ...c, 
            avatar: (!c.avatar || c.avatar.includes('pravatar.cc')) ? DEFAULT_AVATAR : c.avatar 
          })));
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/communities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mappedData = data.map(c => ({ 
            ...c, 
            avatar: (!c.avatar || c.avatar.includes('pravatar.cc')) ? DEFAULT_COMMUNITY_AVATAR : c.avatar 
          }));
          setCommunities(mappedData);
          mappedData.forEach(comm => {
            socket.emit('join_community', comm.id);
          });
        }
      } catch (err) {
        console.error("Failed to fetch communities", err);
      }
    };
    fetchCommunities();
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
          setContacts(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: data, unreadCount: 0 } : c));
          setCommunities(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: data, unreadCount: 0 } : c));
          
          // Mark messages as read when opening the chat
          socket.emit('mark_messages_read', { contactId: activeChatId, userId: currentUser.id });
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [activeChatId, currentUser]);

  const contactsWithOnline = contacts.map(c => ({
    ...c,
    isOnline: onlineUsers.has(c.id)
  }));

  const activeContact = contactsWithOnline.find(c => c.id === activeChatId) || communities.find(c => c.id === activeChatId);

  const handleSendMessage = (contactId, message, attachment = null) => {
    let finalMessage = { ...message, status: 'sent' };
    if (attachment) {
      finalMessage.fileData = attachment.data;
      finalMessage.fileType = attachment.type;
    }

    socket.emit('send_message', { 
      contactId, 
      message: finalMessage, 
      senderId: currentUser.id 
    });
    
    // Optimistic UI update
    setContacts(prevContacts => 
      prevContacts.map(c => {
        if (c.id === contactId) {
          return { ...c, messages: [...(c.messages || []), finalMessage] };
        }
        return c;
      })
    );
    setCommunities(prevComms => 
      prevComms.map(c => {
        if (c.id === contactId) {
          return { ...c, messages: [...(c.messages || []), finalMessage] };
        }
        return c;
      })
    );
  };

  const handleClearMessages = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/messages/${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setContacts(prevContacts => prevContacts.map(c => c.id === contactId ? { ...c, messages: [] } : c));
        setCommunities(prevComms => prevComms.map(c => c.id === contactId ? { ...c, messages: [] } : c));
      }
    } catch (err) {
      console.error("Failed to clear messages", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log(`Deleting message with ID: ${messageId}`);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/messages/single/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`Delete response status: ${res.status}`);
      
      if (res.ok) {
        setContacts(prev => prev.map(c => ({
          ...c, 
          messages: c.messages ? c.messages.filter(m => m.id !== messageId) : []
        })));
        setCommunities(prev => prev.map(c => ({
          ...c, 
          messages: c.messages ? c.messages.filter(m => m.id !== messageId) : []
        })));
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const handleRemoveMember = async (communityId, memberId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/communities/${communityId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCommunities(prev => prev.map(c => {
          if (c.id === communityId) {
            return {
              ...c,
              members: (c.members || []).filter(id => id !== memberId)
            };
          }
          return c;
        }));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to remove member");
      }
    } catch (err) {
      console.error("Failed to remove member", err);
      alert("Error removing member");
    }
  };

  const handleAddMembers = async (communityId, memberIds) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/communities/${communityId}/members`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberIds })
      });
      
      if (res.ok) {
        setCommunities(prev => prev.map(c => {
          if (c.id === communityId) {
            return {
              ...c,
              members: [...new Set([...(c.members || []), ...memberIds])]
            };
          }
          return c;
        }));
      } else {
        let errorMessage = "Failed to add members";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${res.status} ${res.statusText}. Please make sure you restarted the backend server.`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Failed to add members", err);
      alert("Error adding members. Is the server running?");
    }
  };

  const handleCreateCommunity = async (name, description, memberIds, avatar) => {
    const newCommunityId = `comm_${Date.now()}`;
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/communities`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newCommunityId,
          name,
          description,
          pendingMembers: memberIds,
          avatar
        })
      });

      if (res.ok) {
        const newCommunity = {
          id: newCommunityId,
          name,
          description,
          members: [currentUser.id, ...memberIds],
          pendingMembers: [],
          messages: [],
          isCommunity: true,
          created_by: currentUser.id,
          avatar: avatar || 'https://via.placeholder.com/150/00a884/FFFFFF?text=Users'
        };
        setCommunities(prev => [...prev, newCommunity]);
        socket.emit('join_community', newCommunityId);
      }
    } catch (err) {
      console.error("Failed to create community", err);
    }
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`app-container ${activeChatId ? 'chat-active' : ''}`}>
      <Sidebar 
        currentUser={currentUser}
        contacts={contactsWithOnline} 
        communities={communities}
        activeChatId={activeChatId} 
        onSelectChat={(contact) => setActiveChatId(contact.id)} 
        onUpdateProfile={handleUpdateProfile}
        onCreateCommunity={handleCreateCommunity}
      />
      <ChatWindow 
        currentUser={currentUser}
        contacts={contactsWithOnline}
        contact={activeContact} 
        onSendMessage={handleSendMessage} 
        onClearMessages={handleClearMessages}
        onDeleteMessage={handleDeleteMessage}
        onRemoveMember={handleRemoveMember}
        onAddMembers={handleAddMembers}
        onBack={() => setActiveChatId(null)}
      />
    </div>
  );
}

export default App;
