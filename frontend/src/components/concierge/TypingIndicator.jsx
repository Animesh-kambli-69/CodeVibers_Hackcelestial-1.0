export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', backgroundColor: '#F0F7F4', borderRadius: '16px 16px 16px 4px', width: 'fit-content', marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#167A65', marginRight: 4 }}>Concierge is typing</span>
      <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#167A65', animation: 'bounce 1.2s infinite 0s' }} />
      <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#167A65', animation: 'bounce 1.2s infinite 0.2s' }} />
      <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#167A65', animation: 'bounce 1.2s infinite 0.4s' }} />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

export default TypingIndicator;
