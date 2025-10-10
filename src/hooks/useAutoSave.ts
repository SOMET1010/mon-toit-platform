import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  formType: string;
  initialData?: T;
  debounceMs?: number;
  enableLocalStorage?: boolean;
}

export const useAutoSave = <T extends Record<string, any>>({
  formType,
  initialData,
  debounceMs = 3000,
  enableLocalStorage = true,
}: UseAutoSaveOptions<T>) => {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const localStorageKey = `draft_${formType}`;

  // Check for existing drafts on mount
  useEffect(() => {
    checkForDrafts();
  }, [formType]);

  const checkForDrafts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check Supabase
      const { data } = await supabase
        .from('form_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single();

      if (data) {
        setHasDraft(true);
        return;
      }

      // Check LocalStorage
      if (enableLocalStorage) {
        const localDraft = localStorage.getItem(localStorageKey);
        if (localDraft) {
          setHasDraft(true);
        }
      }
    } catch (error) {
      console.error('Error checking for drafts:', error);
    }
  };

  const saveDraft = useCallback(async (formData: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('pending');

    timeoutRef.current = setTimeout(async () => {
      setStatus('saving');

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Save to LocalStorage immediately (offline support)
        if (enableLocalStorage) {
          localStorage.setItem(localStorageKey, JSON.stringify({
            data: formData,
            timestamp: new Date().toISOString(),
          }));
        }

        // Save to Supabase if online
        if (user) {
          const { error } = await supabase
            .from('form_drafts')
            .upsert({
              user_id: user.id,
              form_type: formType,
              draft_data: formData,
            }, {
              onConflict: 'user_id,form_type'
            });

          if (error) throw error;
        }

        setStatus('saved');
        setLastSaved(new Date());
        setHasDraft(true);

      } catch (error) {
        console.error('Auto-save error:', error);
        setStatus('error');
        toast({
          title: "Erreur de sauvegarde",
          description: "Les données sont sauvegardées localement",
          variant: "destructive",
        });
      }
    }, debounceMs);
  }, [formType, debounceMs, enableLocalStorage, toast]);

  const loadDraft = async (): Promise<T | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Try LocalStorage only
        if (enableLocalStorage) {
          const localDraft = localStorage.getItem(localStorageKey);
          if (localDraft) {
            const parsed = JSON.parse(localDraft);
            return parsed.data;
          }
        }
        return null;
      }

      // Try Supabase first
      const { data } = await supabase
        .from('form_drafts')
        .select('draft_data')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single();

      if (data) {
        return data.draft_data as T;
      }

      // Fallback to LocalStorage
      if (enableLocalStorage) {
        const localDraft = localStorage.getItem(localStorageKey);
        if (localDraft) {
          const parsed = JSON.parse(localDraft);
          return parsed.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };

  const clearDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Clear LocalStorage
      if (enableLocalStorage) {
        localStorage.removeItem(localStorageKey);
      }

      // Clear Supabase
      if (user) {
        await supabase
          .from('form_drafts')
          .delete()
          .eq('user_id', user.id)
          .eq('form_type', formType);
      }

      setHasDraft(false);
      setStatus('idle');
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    hasDraft,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};
