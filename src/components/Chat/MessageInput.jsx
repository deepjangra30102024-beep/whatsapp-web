import React, { useState } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="message-input-area">
      <button title="Emoji"><Smile size={24} /></button>
      <button title="Attach"><Paperclip size={24} /></button>
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Type a message" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {text.trim() ? (
        <button title="Send" onClick={handleSend}><Send size={24} color="var(--primary)" /></button>
      ) : (
        <button title="Voice Message"><Mic size={24} /></button>
      )}
    </div>
  );
};

export default MessageInput;
