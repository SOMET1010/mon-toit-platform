import { Home, Search, Heart, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Ne pas afficher sur desktop ou si l'utilisateur n'est pas connecté
  if (!isMobile || !user) return null;

  const navItems = [
    {
      label: "Accueil",
      icon: Home,
      path: "/",
      ariaLabel: "Aller à l'accueil",
    },
    {
      label: "Recherche",
      icon: Search,
      path: "/recherche",
      ariaLabel: "Rechercher des propriétés",
    },
    {
      label: "Favoris",
      icon: Heart,
      path: "/favoris",
      ariaLabel: "Voir mes favoris",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/messages",
      ariaLabel: "Messages",
    },
    {
      label: "Profil",
      icon: User,
      path: "/profil",
      ariaLabel: "Voir mon profil",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t border-border shadow-elevated safe-area-inset-bottom"
      aria-label="Navigation principale mobile"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 active-scale touch-feedback relative min-w-[64px]",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label={item.ariaLabel}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform",
                    active && "scale-110"
                  )} 
                />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-medium leading-none",
                  active && "font-semibold"
                )}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
