import React, { useEffect, useRef, useState } from 'react';
import './AskAI.css';

const AskAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your insights assistant. Ask about metrics, trends, or data across your tools.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, role: 'user', content: text },
    ]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="page ai-chat">
      <header className="chat-header">
        <div className="chat-title">Ask AI</div>
        <div className="chat-actions">
          <button
            className="button subtle"
            onClick={() => setMessages(messages.slice(0, 1))}
            aria-label="Start a new chat"
          >
            New chat
          </button>
        </div>
      </header>

      <section className="chat-body" aria-live="polite" aria-label="Conversation">
        <div className="chat-messages">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="chat-input">
        <div className="input-row">
          <textarea
            className="text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask a question about your data…"
          />
          <button
            className="button primary"
            onClick={handleSend}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        <div className="hint">
          Press ⌘+Enter to send
        </div>
      </footer>
    </div>
  );
};

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';
  return (
    <div className={`message ${isUser ? 'from-user' : 'from-assistant'}`} role="article">
      <div className="avatar" aria-hidden>
        {isUser ? (
          <span className="avatar-initial">U</span>
        ) : (
          <span className="avatar-initial">AI</span>
        )}
      </div>
      <div className="bubble">
        <div className="meta">{isUser ? 'You' : 'Assistant'}</div>
        <div className="content">{content}</div>
      </div>
    </div>
  );
};

export default AskAI;


