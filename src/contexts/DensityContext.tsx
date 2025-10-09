import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UIDensity = 'comfortable' | 'compact' | 'dense';

interface DensityContextType {
  density: UIDensity;
  setDensity: (density: UIDensity) => void;
  spacingMap: {
    card: string;
    section: string;
    padding: string;
  };
}

const spacingMaps: Record<UIDensity, { card: string; section: string; padding: string }> = {
  comfortable: { card: 'space-y-6', section: 'space-y-8', padding: 'p-6' },
  compact: { card: 'space-y-4', section: 'space-y-6', padding: 'p-4' },
  dense: { card: 'space-y-2', section: 'space-y-4', padding: 'p-2' },
};

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export const DensityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [density, setDensityState] = useState<UIDensity>('comfortable');

  // Charger la préférence depuis la DB
  useEffect(() => {
    const loadDensity = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('ui_density')
        .eq('id', user.id)
        .single();

      if (data?.ui_density) {
        setDensityState(data.ui_density as UIDensity);
      }
    };

    loadDensity();
  }, [user?.id]);

  // Sauvegarder la préférence dans la DB
  const setDensity = async (newDensity: UIDensity) => {
    setDensityState(newDensity);

    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ ui_density: newDensity })
        .eq('id', user.id);
    }
  };

  return (
    <DensityContext.Provider
      value={{
        density,
        setDensity,
        spacingMap: spacingMaps[density],
      }}
    >
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = () => {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
};
