import { useState } from 'react';

export function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-6px)',
            backgroundColor: '#17201C',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }}
        >
          {content}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: 4,
            borderStyle: 'solid',
            borderColor: '#17201C transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
