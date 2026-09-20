import React, { useRef, useState, useEffect } from 'react';
import { MessageSquare, MoreVertical, Users, Donut } from 'lucide-react';

const SidebarHeader = ({ currentUser, setActivePanel }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageClick = () => {
    setActivePanel('profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="header">
      <div style={{ cursor: 'pointer' }} onClick={handleImageClick} title="My Profile">
        <img src={currentUser.avatar} alt="Profile" className="header-avatar" />
      </div>
      <div className="header-actions">
        <button title="Communities" onClick={() => setActivePanel('communities')}><Users size={20} /></button>
        <button title="Status" onClick={() => setActivePanel('status')}><Donut size={20} /></button>
        <button title="New Chat" onClick={() => setActivePanel('new_chat')}><MessageSquare size={20} /></button>
        <div className="menu-container" ref={dropdownRef}>
          <button title="Menu" onClick={() => setShowDropdown(!showDropdown)}>
            <MoreVertical size={20} />
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleLogout}>Log out</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader;
