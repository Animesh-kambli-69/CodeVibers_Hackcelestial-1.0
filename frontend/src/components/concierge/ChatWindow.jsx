import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export function ChatWindow({ messages = [], loading = false, onSourceClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div
      role="log"
      aria-live="polite"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id || idx}
          message={msg}
          onSourceClick={onSourceClick}
        />
      ))}

      {loading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;
