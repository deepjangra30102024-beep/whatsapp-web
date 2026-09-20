import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, currentUser, onDeleteMessage }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          isSent={msg.sender === currentUser.id} 
          onDelete={() => onDeleteMessage && onDeleteMessage(msg.id)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
