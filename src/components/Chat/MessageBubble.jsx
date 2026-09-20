import React from 'react';

const MessageBubble = ({ message, isSent }) => {
  return (
    <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
      <div className="message-content">
        {message.text}
      </div>
      <div className="message-meta">
        <span className="message-time">{message.time}</span>
        {isSent && (
          <svg viewBox="0 0 16 11" width="16" height="11" style={{ marginLeft: 2 }}>
            <path fill="var(--primary)" d="M11.8 1.6l-5 5-2.2-2.2-1.4 1.4 3.6 3.6 6.4-6.4z"></path>
            <path fill="var(--primary)" d="M15.8 1.6l-5 5-2.2-2.2-1.4 1.4 3.6 3.6 6.4-6.4z" transform="translate(-4, 0)"></path>
          </svg>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
