import { Sparkles, AlertCircle, Info } from 'lucide-react';
import SourceChips from './SourceChips';

export function ChatMessage({ message, onSourceClick }) {
  const isUser = message.sender === 'user';
  const isGrounded = message.grounded !== false;

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{
          backgroundColor: '#167A65',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: '16px 16px 4px 16px',
          maxWidth: '82%',
          fontSize: 14,
          lineHeight: 1.5,
          boxShadow: '0 2px 6px rgba(22,122,101,0.15)'
        }}>
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
      <div style={{
        backgroundColor: isGrounded ? '#FFFFFF' : '#FFFBEB',
        border: `1px solid ${isGrounded ? '#E5EAE7' : '#FDE68A'}`,
        color: '#17201C',
        padding: '14px 16px',
        borderRadius: '16px 16px 16px 4px',
        maxWidth: '88%',
        boxShadow: '0 2px 8px rgba(23,32,28,0.04)'
      }}>
        {/* Assistant Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Sparkles size={14} color={isGrounded ? '#5B63C7' : '#D89A32'} />
          <span style={{ fontSize: 12, fontWeight: 700, color: isGrounded ? '#5B63C7' : '#D89A32' }}>
            {isGrounded ? 'AI Resort Concierge' : 'Concierge Notice'}
          </span>
        </div>

        {/* Message Text */}
        <div style={{ fontSize: 14, lineHeight: 1.5, color: '#17201C' }}>
          {message.text}
        </div>

        {/* Ungrounded Fallback Warning */}
        {!isGrounded && (
          <div style={{
            marginTop: 10,
            padding: '8px 10px',
            backgroundColor: '#FFFFFF',
            borderRadius: 6,
            border: '1px solid #FDE68A',
            fontSize: 12,
            color: '#D89A32',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>Unverified query. Please contact the Front Desk desk for custom inquiries.</span>
          </div>
        )}

        {/* Grounded Source Chips */}
        {isGrounded && message.sources && message.sources.length > 0 && (
          <SourceChips sources={message.sources} onSourceClick={onSourceClick} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
