import { memo, useState } from 'react';
import { Clock } from 'lucide-react';
import { Widget } from './Widget';

interface ClockWidgetProps {
  formatTime: (options?: { includeSeconds?: boolean }) => string;
  formatDate: () => string;
  dayPeriod: string;
}

export const ClockWidget = memo(({ 
  formatTime, 
  formatDate, 
  dayPeriod 
}: ClockWidgetProps) => {
  const [showSeconds, setShowSeconds] = useState(false);

  const tooltip = (
    <div className="space-y-1">
      <p className="font-semibold">{formatDate()}</p>
      <p className="text-xs text-muted-foreground">Période: {dayPeriod}</p>
      <p className="text-xs text-muted-foreground">Fuseau: Africa/Abidjan (GMT)</p>
      <p className="text-xs text-muted-foreground mt-2">
        Cliquer pour {showSeconds ? 'masquer' : 'afficher'} les secondes
      </p>
    </div>
  );

  return (
    <Widget
      onClick={() => setShowSeconds(!showSeconds)}
      ariaLabel="Heure et date actuelles - Cliquer pour basculer l'affichage des secondes"
      tooltip={tooltip}
    >
      <Clock className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
      <span className="font-semibold text-sm">
        {formatTime({ includeSeconds: showSeconds })}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatDate()}
      </span>
      <span className="text-xs text-primary/70 hidden xl:inline">
        • {dayPeriod}
      </span>
    </Widget>
  );
});

ClockWidget.displayName = 'ClockWidget';
