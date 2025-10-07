import { Badge } from '@/components/ui/badge';
import { PropertyStatus } from '@/types';
import { PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS } from '@/constants';

interface StatusBadgeProps {
  status: PropertyStatus | string;
  variant?: 'default' | 'compact';
}

export const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {
  const label = PROPERTY_STATUS_LABELS[status] || status;
  const colorClass = PROPERTY_STATUS_COLORS[status] || 'bg-gray-500';
  
  return (
    <Badge 
      className={`${colorClass} text-white ${variant === 'compact' ? 'text-xs' : ''}`}
    >
      {label}
    </Badge>
  );
};
