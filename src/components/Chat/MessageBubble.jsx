import React from 'react';

const MessageBubble = ({ message, isSent, onDelete }) => {
  return (
    <div className={`message-bubble ${isSent ? 'sent' : 'received'}`} style={{ position: 'relative', group: 'hover' }}>
      <div className="message-content" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {message.fileData && message.fileType === 'image' && (
          <img src={message.fileData} alt="attachment" style={{ maxWidth: '250px', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }} />
        )}
        {message.fileData && message.fileType === 'file' && (
          <a href={message.fileData} download="attachment" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
             Download File
          </a>
        )}
        {message.text && <span>{message.text}</span>}
      </div>
      <div className="message-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span className="message-time">{message.time}</span>
        {isSent && (
          <>
            <svg viewBox="0 0 16 11" width="16" height="11" style={{ marginLeft: 2 }}>
              <path fill={message.status === 'read' ? "var(--primary)" : "#8696a0"} d="M11.8 1.6l-5 5-2.2-2.2-1.4 1.4 3.6 3.6 6.4-6.4z"></path>
              {message.status === 'read' && (
                <path fill="var(--primary)" d="M15.8 1.6l-5 5-2.2-2.2-1.4 1.4 3.6 3.6 6.4-6.4z"></path>
              )}
            </svg>
            <button 
              onClick={onDelete} 
              className="delete-msg-btn"
              title="Delete message"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', opacity: 0.6
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

