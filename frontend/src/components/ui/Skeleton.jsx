export function Skeleton({ width = '100%', height = '20px', borderRadius = 8, className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#E5EAE7',
        backgroundImage: 'linear-gradient(90deg, #E5EAE7 0%, #F0F4F2 50%, #E5EAE7 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s infinite ease-in-out',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default Skeleton;
