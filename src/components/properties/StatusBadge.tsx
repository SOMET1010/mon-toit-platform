import { Badge } from '@/components/ui/badge';
import { PropertyStatus } from '@/types';
import { getPropertyStatusLabel, getPropertyStatusColor } from '@/lib/badgeHelpers';

interface StatusBadgeProps {
  status: PropertyStatus | string;
  variant?: 'default' | 'compact';
}

export const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {
  const label = getPropertyStatusLabel(status);
  const colorClass = getPropertyStatusColor(status);
  
  return (
    <Badge 
      className={`${colorClass} text-white ${variant === 'compact' ? 'text-xs' : ''}`}
    >
      {label}
    </Badge>
  );
};
