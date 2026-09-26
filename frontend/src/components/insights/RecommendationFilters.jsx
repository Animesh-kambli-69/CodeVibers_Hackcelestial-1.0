export function RecommendationFilters({ priority, category, onPriorityChange, onCategoryChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      flexWrap: 'wrap'
    }}>
      {/* Priority Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#66716C' }}>Priority:</label>
        <select
          value={priority || 'ALL'}
          onChange={(e) => onPriorityChange(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #E5EAE7',
            backgroundColor: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            color: '#17201C',
            outline: 'none'
          }}
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="LOW">Low Priority</option>
        </select>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#66716C' }}>Category:</label>
        <select
          value={category || 'ALL'}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #E5EAE7',
            backgroundColor: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            color: '#17201C',
            outline: 'none'
          }}
        >
          <option value="ALL">All Categories</option>
          <option value="OPERATIONS">Operations</option>
          <option value="CANCELLATION">Cancellation Risk</option>
          <option value="REVENUE">Revenue & Pricing</option>
          <option value="GUEST">Guest Experience</option>
        </select>
      </div>
    </div>
  );
}

export default RecommendationFilters;
