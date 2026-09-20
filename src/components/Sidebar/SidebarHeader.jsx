import React from 'react';
import { MessageSquare, MoreVertical, Users, Donut } from 'lucide-react';

const SidebarHeader = ({ currentUser }) => {
  return (
    <div className="header">
      <img src={currentUser.avatar} alt="Profile" className="header-avatar" />
      <div className="header-actions">
        <button title="Communities"><Users size={20} /></button>
        <button title="Status"><Donut size={20} /></button>
        <button title="New Chat"><MessageSquare size={20} /></button>
        <button title="Menu"><MoreVertical size={20} /></button>
      </div>
    </div>
  );
};

export default SidebarHeader;
