import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  icon?: ReactNode;
  showBreadcrumb?: boolean;
  children?: ReactNode;
}

/**
 * PageHeader - Composant d'en-tête unifié pour toutes les pages intérieures
 * Design ivoirien avec dégradé orange → vert
 */
export function PageHeader({
  title,
  description,
  badge,
  badgeVariant = 'default',
  icon,
  showBreadcrumb = true,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-blue-600 to-green-600">
      {/* Pattern ivoirien subtil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="mb-4">
            <DynamicBreadcrumb className="text-white/80 hover:text-white" />
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="mb-4">
            <Badge
              variant={badgeVariant}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {badge}
            </Badge>
          </div>
        )}

        {/* Title & Icon */}
        <div className="flex items-center gap-4 mb-4">
          {icon && <div className="text-white">{icon}</div>}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {title}
          </h1>
        </div>

        {/* Description */}
        {description && (
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">
            {description}
          </p>
        )}

        {/* Children (CTA, stats, etc.) */}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

