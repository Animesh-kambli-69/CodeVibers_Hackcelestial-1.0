import { FileText } from 'lucide-react';

export function SourceChips({ sources = [], onSourceClick }) {
  const list = Array.isArray(sources) ? sources : [];
  if (!list || list.length === 0) return null;

  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(23,32,28,0.06)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#66716C', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Verified Resort Sources:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {list.map((src) => (
          <button
            key={src.id || src.title}
            onClick={() => onSourceClick && onSourceClick(src)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5EAE7',
              color: '#167A65',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <FileText size={12} />
            <span>{src.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SourceChips;
