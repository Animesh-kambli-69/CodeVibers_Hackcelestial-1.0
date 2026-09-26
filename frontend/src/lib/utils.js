export const formatPercent = (v) => {
  if (v === null || v === undefined || isNaN(Number(v))) return '—';
  return `${Number(v).toFixed(1)}%`;
};

export const formatProbability = (p) => {
  if (p === null || p === undefined || isNaN(Number(p))) return '—';
  return `${Math.round(Number(p) * 100)}%`;
};

export const formatCurrency = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n);
};

export const formatDate = (d, short = true) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', short ? { day: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDelta = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  const val = Number(n);
  return val >= 0 ? `↑${Math.abs(val)}%` : `↓${Math.abs(val)}%`;
};

export const titleCaseEnum = (e) => {
  if (!e) return '';
  return String(e).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
