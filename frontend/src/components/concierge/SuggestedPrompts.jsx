export function SuggestedPrompts({ onSelectPrompt }) {
  const prompts = [
    'What would you recommend for me this evening?',
    'What vegetarian dining options are available?',
    'What are the spa & pool timings?',
    'Is there a helipad at the resort?' // triggers ungrounded fallback demo
  ];

  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 8, scrollbarWidth: 'none' }}>
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p)}
          style={{
            padding: '6px 12px',
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EAE7',
            color: '#17201C',
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(23,32,28,0.03)'
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export default SuggestedPrompts;
