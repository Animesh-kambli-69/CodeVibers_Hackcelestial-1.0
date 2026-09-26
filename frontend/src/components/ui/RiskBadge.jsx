import { formatProbability } from '../../lib/utils';
import { Badge } from './Badge';

export function RiskBadge({ riskLevel, probability, style = {} }) {
  if (!riskLevel) {
    return <Badge variant="muted" style={style}>— Unrated</Badge>;
  }

  const level = String(riskLevel).toUpperCase();
  let variant = 'risk-low';
  let label = 'LOW RISK';

  if (level === 'HIGH' || level === 'CRITICAL') {
    variant = 'risk-high';
    label = 'HIGH RISK';
  } else if (level === 'MEDIUM' || level === 'MODERATE') {
    variant = 'risk-medium';
    label = 'MEDIUM RISK';
  } else if (level === 'LOW') {
    variant = 'risk-low';
    label = 'LOW RISK';
  }

  const probStr = probability !== undefined && probability !== null ? ` (${formatProbability(probability)})` : '';

  return (
    <Badge variant={variant} style={style}>
      ● {label}{probStr}
    </Badge>
  );
}

export default RiskBadge;
