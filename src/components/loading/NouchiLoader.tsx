import { motion } from "framer-motion";
import { Loader2, Home } from "lucide-react";
import { useEffect, useState } from "react";

interface NouchiLoaderProps {
  variant?: "default" | "search" | "property" | "payment";
  className?: string;
}

const nouchiExpressions = {
  default: [
    "Patience petit, ça vient...",
    "Doucement doucement, ça arrive...",
    "On est en train de charger ça...",
    "Attends un peu, c'est bientôt prêt...",
    "On gère ça pour toi là...",
  ],
  search: [
    "On cherche ton gbê là...",
    "On est en train de fouiller pour toi...",
    "Laisse-nous chercher ton affaire...",
    "On va trouver ça pour toi...",
    "Patience, on cherche ton truc...",
  ],
  property: [
    "On prépare ton gbê là...",
    "Ton bien est en train de charger...",
    "On arrange les détails pour toi...",
    "Attends, on finalise ça...",
    "Ton affaire arrive bientôt...",
  ],
  payment: [
    "On vérifie ton wari là...",
    "Ton paiement est en cours...",
    "On gère ton argent avec soin...",
    "Patience, on traite ça...",
    "Ton transfert arrive...",
  ],
};

export function NouchiLoader({ variant = "default", className = "" }: NouchiLoaderProps) {
  const [currentExpression, setCurrentExpression] = useState(0);
  const expressions = nouchiExpressions[variant];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExpression((prev) => (prev + 1) % expressions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [expressions.length]);

  return (
    <div className={`flex flex-col items-center justify-center gap-6 p-8 ${className}`}>
      {/* Animation du logo Mon Toit */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <Home className="h-16 w-16 text-primary" />
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Loader2 className="h-16 w-16 text-secondary animate-spin" />
          </motion.div>
        </div>
      </motion.div>

      {/* Expression en nouchi avec animation */}
      <motion.div
        key={currentExpression}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-foreground mb-2">
          {expressions[currentExpression]}
        </p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Badge culturel */}
      <motion.div
        className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-500/20"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(249, 115, 22, 0)",
            "0 0 0 10px rgba(249, 115, 22, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <p className="text-sm font-medium bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
          🇨🇮 Plateforme 100% Ivoirienne
        </p>
      </motion.div>
    </div>
  );
}

// Skeleton loader pour les cartes de propriétés
export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-6 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

// Skeleton loader pour la liste de propriétés avec message nouchi
export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground italic">
          On cherche les meilleurs gbê pour toi... 🏠
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

