import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, Edit2 } from 'lucide-react';

const ProfilePanel = ({ currentUser, onClose, onUpdateProfile }) => {
  const fileInputRef = useRef(null);
  
  const [username, setUsername] = useState(currentUser.username);
  const [description, setDescription] = useState(currentUser.description || '');
  const [password, setPassword] = useState('');
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setIsSaving(true);
        await onUpdateProfile({ avatar: reader.result, username, description });
        setIsSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    await onUpdateProfile({ username, description, password });
    setIsEditingUsername(false);
    setIsEditingDescription(false);
    setIsEditingPassword(false);
    setPassword('');
    setIsSaving(false);
  };

  return (
    <div className="slide-panel profile-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ height: '108px', padding: '0 20px', display: 'flex', alignItems: 'flex-end', paddingBottom: '20px', backgroundColor: '#008069', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onClose} className="back-btn" style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '19px', margin: 0, fontWeight: 500 }}>Profile</h2>
        </div>
      </div>
      <div className="panel-content profile-content" style={{ backgroundColor: '#f0f2f5', flex: 1, overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0', position: 'relative' }}>
          <div style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', overflow: 'hidden', width: '200px', height: '200px' }} onClick={handleImageClick}>
            <img 
              src={currentUser.avatar} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div className="profile-img-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
               <span style={{ color: 'white', textAlign: 'center', fontSize: '14px' }}>CHANGE<br/>PROFILE PHOTO</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div style={{ padding: '14px 30px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} className="profile-field-container">
          <span style={{ color: '#008069', fontSize: '14px', marginBottom: '14px', display: 'block' }}>Your name</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isEditingUsername ? (
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ flex: 1, border: 'none', borderBottom: '2px solid #008069', outline: 'none', padding: '5px 0', fontSize: '17px' }}
                autoFocus
              />
            ) : (
              <span style={{ fontSize: '17px', color: '#111b21' }}>{currentUser.username}</span>
            )}
            
            {isEditingUsername ? (
              <button onClick={saveProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }} disabled={isSaving}>
                <Check size={20} />
              </button>
            ) : (
              <button onClick={() => setIsEditingUsername(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }}>
                <Edit2 size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div style={{ padding: '14px 30px', color: '#8696a0', fontSize: '14px' }}>
          This is not your username or pin. This name will be visible to your WhatsApp contacts.
        </div>

        <div style={{ padding: '14px 30px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} className="profile-field-container">
          <span style={{ color: '#008069', fontSize: '14px', marginBottom: '14px', display: 'block' }}>About</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isEditingDescription ? (
              <input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ flex: 1, border: 'none', borderBottom: '2px solid #008069', outline: 'none', padding: '5px 0', fontSize: '17px' }}
                autoFocus
              />
            ) : (
              <span style={{ fontSize: '17px', color: '#111b21' }}>{currentUser.description || 'Hey there! I am using WhatsApp.'}</span>
            )}
            
            {isEditingDescription ? (
              <button onClick={saveProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }} disabled={isSaving}>
                <Check size={20} />
              </button>
            ) : (
              <button onClick={() => setIsEditingDescription(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }}>
                <Edit2 size={20} />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 30px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginTop: '20px' }} className="profile-field-container">
          <span style={{ color: '#008069', fontSize: '14px', marginBottom: '14px', display: 'block' }}>Password</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isEditingPassword ? (
              <input 
                type="password"
                placeholder="Enter new password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ flex: 1, border: 'none', borderBottom: '2px solid #008069', outline: 'none', padding: '5px 0', fontSize: '17px' }}
                autoFocus
              />
            ) : (
              <span style={{ fontSize: '17px', color: '#111b21' }}>••••••••</span>
            )}
            
            {isEditingPassword ? (
              <button onClick={saveProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }} disabled={isSaving}>
                <Check size={20} />
              </button>
            ) : (
              <button onClick={() => setIsEditingPassword(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8696a0' }}>
                <Edit2 size={20} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePanel;
