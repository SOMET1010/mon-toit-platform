import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ANSUTCertifiedBadgeProps {
  status: 'not_requested' | 'pending' | 'certified' | 'rejected';
  certifiedAt?: string | null;
  variant?: 'default' | 'detailed';
}

const ANSUTCertifiedBadge = ({ status, certifiedAt, variant = 'default' }: ANSUTCertifiedBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'certified':
        return {
          icon: CheckCircle,
          text: 'Certifié ANSUT',
          color: 'bg-green-600 hover:bg-green-700',
          iconColor: 'text-white',
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Certification en cours',
          color: 'bg-yellow-600 hover:bg-yellow-700',
          iconColor: 'text-white',
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Certification refusée',
          color: 'bg-red-600 hover:bg-red-700',
          iconColor: 'text-white',
        };
      default:
        return {
          icon: Shield,
          text: 'Non certifié',
          color: 'bg-muted hover:bg-muted/80',
          iconColor: 'text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (variant === 'detailed') {
    return (
      <div className={`inline-flex items-center gap-2 ${config.color} px-4 py-2 rounded-lg text-white transition-smooth`}>
        <Icon className="h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{config.text}</span>
          {status === 'certified' && certifiedAt && (
            <span className="text-xs opacity-90">
              Le {new Date(certifiedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.color} cursor-help gap-2`}>
            <Icon className="h-4 w-4" />
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.text}</p>
          {status === 'certified' && certifiedAt && (
            <p className="text-xs mt-1">
              Certifié le {new Date(certifiedAt).toLocaleDateString('fr-FR')}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ANSUTCertifiedBadge;
