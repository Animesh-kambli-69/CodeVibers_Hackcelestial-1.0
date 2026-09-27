import { useState } from 'react';
import { Send } from 'lucide-react';

export function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5EAE7',
      borderRadius: 24,
      padding: '6px 6px 6px 16px',
      boxShadow: '0 2px 8px rgba(23,32,28,0.05)'
    }}>
      <textarea
        rows="1"
        placeholder="Type your question for the Concierge..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          color: '#17201C',
          backgroundColor: 'transparent',
          lineHeight: '24px'
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        title="Send message to AI Concierge"
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          border: 'none',
          backgroundColor: text.trim() && !disabled ? '#167A65' : '#E6F4F1',
          color: text.trim() && !disabled ? '#FFFFFF' : '#167A65',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: text.trim() && !disabled ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          boxShadow: text.trim() && !disabled ? '0 2px 8px rgba(22,122,101,0.25)' : 'none'
        }}
      >
        <Send size={17} color={text.trim() && !disabled ? '#FFFFFF' : '#167A65'} />
      </button>
    </div>
  );
}

export default ChatInput;
