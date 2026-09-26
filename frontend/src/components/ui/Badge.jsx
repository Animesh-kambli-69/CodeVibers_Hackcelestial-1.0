export function Badge({ variant = 'brand', children, className = '', style = {} }) {
  const styles = {
    brand: { bg: '#DDEBE5', color: '#167A65', border: 'rgba(22, 122, 101, 0.2)' },
    ai: { bg: '#EEF0FB', color: '#5B63C7', border: 'rgba(91, 99, 199, 0.2)' },
    'risk-high': { bg: '#FEF2F2', color: '#C95C5C', border: 'rgba(201, 92, 92, 0.2)' },
    'risk-medium': { bg: '#FFFBEB', color: '#D89A32', border: 'rgba(216, 154, 50, 0.2)' },
    'risk-low': { bg: '#F0F7F4', color: '#3F8F70', border: 'rgba(63, 143, 112, 0.2)' },
    muted: { bg: '#F0F2F1', color: '#66716C', border: '#E5EAE7' },
  };

  const current = styles[variant] || styles.brand;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export default Badge;
