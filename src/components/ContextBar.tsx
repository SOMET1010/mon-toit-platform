// Version de test ultra-simplifiée pour diagnostic
const ContextBar = () => {
  return (
    <div 
      className="w-full bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-b border-border/50 backdrop-blur-md sticky top-16 z-40"
      role="banner"
      aria-label="Barre d'informations contextuelles"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-10 flex items-center justify-center gap-4 md:gap-6 text-sm">
          <p className="text-sm font-medium text-foreground">
            🧪 ContextBar Test - Si vous voyez ceci, le composant fonctionne
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContextBar;
