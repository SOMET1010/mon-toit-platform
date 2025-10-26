/**
 * Composant pour afficher la version de l'application
 */

import { Info } from 'lucide-react';
import packageJson from '../../package.json';

export function Version() {
  const version = packageJson.version;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Info className="h-3 w-3" />
      <span>Version {version}</span>
    </div>
  );
}

export function VersionBadge() {
  const version = packageJson.version;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border">
      <Info className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs font-medium text-foreground">v{version}</span>
    </div>
  );
}

// Hook pour obtenir la version
export const useVersion = () => {
  return packageJson.version;
};

