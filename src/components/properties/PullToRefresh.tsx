import { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { triggerHapticFeedback } from '@/utils/haptics';
import { toast } from '@/hooks/use-toast';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefresh = useRef(Date.now());
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hapticTriggered = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if we're at the top of the scroll
      if (window.scrollY === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY;
        hapticTriggered.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only pull down, and cap at 120px
      if (deltaY > 0) {
        const distance = Math.min(deltaY * 0.5, 120); // Damping effect
        setPullDistance(distance);

        // Trigger haptic at threshold
        if (distance > 80 && !hapticTriggered.current) {
          triggerHapticFeedback('medium');
          hapticTriggered.current = true;
        }

        // Prevent default scroll if pulling
        if (deltaY > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 80 && !isRefreshing) {
        const timeSinceLastRefresh = Date.now() - lastRefresh.current;

        // Throttle: minimum 5 seconds between refreshes
        if (timeSinceLastRefresh < 5000) {
          toast({
            description: "⏳ Veuillez patienter avant de rafraîchir à nouveau",
            duration: 2000,
          });
          setPullDistance(0);
          startY.current = 0;
          return;
        }

        setIsRefreshing(true);
        lastRefresh.current = Date.now();
        
        try {
          await onRefresh();
          toast({
            description: "✓ Liste rafraîchie",
            duration: 2000,
          });
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de rafraîchir la liste",
            variant: "destructive",
          });
        } finally {
          setIsRefreshing(false);
        }
      }

      setPullDistance(0);
      startY.current = 0;
      hapticTriggered.current = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center transition-opacity duration-200 -translate-y-full"
        style={{
          opacity: pullDistance > 0 ? 1 : 0,
          height: `${pullDistance}px`,
        }}
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <ChevronDown
            className="h-6 w-6 text-primary transition-transform duration-200"
            style={{
              transform: `rotate(${Math.min(pullDistance / 80 * 180, 180)}deg)`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
