import React, { useState, useEffect, useRef, memo } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const ChatPanel = ({ messages, onSendMessage, onTypingStart, onTypingStop, typingUsers = [], currentUser, isJoined }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isJoined) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      handleTypingStop(); // Stop typing immediately after send
    }
  };

  // Typing Indicator Logic
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isJoined) return;

    // Emit start typing
    if (onTypingStart) {
      onTypingStart();
    }

    // Debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 2000);
  };

  const handleTypingStop = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onTypingStop) onTypingStop();
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 border-r border-stone-800">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="text-center text-stone-500 mt-10 text-sm">
            <p>No messages yet.</p>
            <p>Start the conversation!</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`${message.type === 'system' ? 'text-center' : ''}`}>
            {message.type === 'system' ? (
              <div className="text-xs text-stone-500 bg-stone-800/50 rounded px-2 py-1 inline-block my-1 border border-stone-800">
                {message.message}
              </div>
            ) : (
              <div className={`rounded-lg p-3 max-w-[90%] ${message.userId === currentUser?._id
                ? 'bg-blue-600/20 border border-blue-500/30 ml-auto'
                : 'bg-stone-800/80 border border-stone-700 mr-auto'
                } shadow-sm group`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold text-xs ${message.userId === currentUser?._id ? 'text-blue-400' : 'text-stone-300'
                    }`}>
                    {message.userName}
                    {message.userId === currentUser?._id && ' (You)'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-200 text-sm break-words leading-relaxed">{message.message}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Display */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="px-4 py-1 text-xs text-stone-500 italic flex items-center gap-1 animate-pulse">
          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-0"></span>
          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-100"></span>
          <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-200"></span>
          <span className="ml-1">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-stone-800 bg-stone-900">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <Input
            value={newMessage}
            onChange={handleTyping}
            placeholder={isJoined ? "Type a message..." : "Join session to chat"}
            className="flex-1 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus:ring-1 focus:ring-blue-500/50"
            disabled={!isJoined}
          />
          <Button
            type="submit"
            size="sm"
            className={`${newMessage.trim()
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-stone-700 hover:bg-stone-700 text-stone-400'
              } transition-colors duration-200`}
            disabled={!newMessage.trim() || !isJoined}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {!isJoined && (
          <div className="text-xs text-red-400 mt-2 text-center">
            You must join the session to send messages.
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatPanel);
