export function CategoryChips({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 8,
      marginBottom: 16,
      scrollbarWidth: 'none'
    }}>
      <button
        onClick={() => onSelectCategory('ALL')}
        style={{
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12.5,
          fontWeight: 600,
          border: 'none',
          backgroundColor: selectedCategory === 'ALL' ? '#167A65' : '#FFFFFF',
          color: selectedCategory === 'ALL' ? '#FFFFFF' : '#66716C',
          boxShadow: '0 1px 3px rgba(23,32,28,0.05)',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        All Info
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 600,
            border: 'none',
            backgroundColor: selectedCategory === cat ? '#167A65' : '#FFFFFF',
            color: selectedCategory === cat ? '#FFFFFF' : '#66716C',
            boxShadow: '0 1px 3px rgba(23,32,28,0.05)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryChips;
