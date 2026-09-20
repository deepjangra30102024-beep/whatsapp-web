import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (text.trim() || attachment) {
      onSendMessage(text, attachment);
      setText('');
      setAttachment(null);
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          data: reader.result,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="message-input-area" style={{ position: 'relative' }}>
      
      {showEmojiPicker && (
        <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '60px', left: '20px', zIndex: 100 }}>
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
        </div>
      )}

      {attachment && (
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', backgroundColor: '#2a2f32', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 90 }}>
          {attachment.type === 'image' ? (
            <img src={attachment.data} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
          ) : (
             <span style={{ color: '#fff' }}>{attachment.name}</span>
          )}
          <button onClick={() => setAttachment(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#fff" />
          </button>
        </div>
      )}

      <button title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        <Smile size={24} color={showEmojiPicker ? 'var(--primary)' : '#8696a0'} />
      </button>
      
      <button title="Attach" onClick={() => fileInputRef.current.click()}>
        <Paperclip size={24} color={attachment ? 'var(--primary)' : '#8696a0'} />
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

      <div className="input-container">
        <input 
          type="text" 
          placeholder="Type a message" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button title="Send" onClick={handleSend} style={{ opacity: (text.trim() || attachment) ? 1 : 0.5, cursor: (text.trim() || attachment) ? 'pointer' : 'default' }}>
        <Send size={24} color="var(--primary)" />
      </button>
    </div>
  );
};

export default MessageInput;
