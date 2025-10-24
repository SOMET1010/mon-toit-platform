import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Mic, MicOff, Home, Shield, Clock } from "lucide-react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/recherche?location=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/recherche');
    }
  };

  const handleQuickSearch = (location: string) => {
    navigate(`/recherche?location=${encodeURIComponent(location)}`);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Update search query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Dégradé de fond ivoirien moderne */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D6] to-[#FFD4B8]">
        {/* Motifs décoratifs subtils */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L45 15L30 30L15 15z' fill='%23E67E22' fill-opacity='1'/%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      {/* Illustration de maisons ivoiriennes en arrière-plan */}
      <div className="absolute right-0 bottom-0 w-1/2 h-2/3 opacity-10 hidden lg:block">
        <svg viewBox="0 0 800 600" className="w-full h-full">
          {/* Maison 1 */}
          <rect x="50" y="300" width="200" height="200" fill="#E67E22" opacity="0.3"/>
          <polygon points="50,300 150,200 250,300" fill="#D35400" opacity="0.3"/>
          
          {/* Maison 2 */}
          <rect x="300" y="250" width="180" height="250" fill="#E67E22" opacity="0.4"/>
          <polygon points="300,250 390,170 480,250" fill="#D35400" opacity="0.4"/>
          
          {/* Maison 3 */}
          <rect x="550" y="280" width="150" height="220" fill="#E67E22" opacity="0.35"/>
          <polygon points="550,280 625,220 700,280" fill="#D35400" opacity="0.35"/>
        </svg>
      </div>

      {/* Contenu principal */}
      <div className="relative container mx-auto px-6 sm:px-8 md:px-12 py-16 max-w-7xl z-10">
        <div className="max-w-3xl animate-fade-in">
          
          {/* Badge ANSUT */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg mb-6 border border-[#E67E22]/20">
            <Shield className="h-4 w-4 text-[#E67E22]" />
            <span className="text-sm font-semibold text-[#E67E22]">Certifié ANSUT</span>
          </div>

          {/* Titre principal - Extra large et impactant */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-[#2C3E50] via-[#34495E] to-[#2C3E50] bg-clip-text text-transparent">
              Trouvez votre
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#E67E22] via-[#F39C12] to-[#E67E22] bg-clip-text text-transparent animate-gradient">
              Toit Idéal
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-[#34495E] mb-8 font-medium leading-relaxed">
            Explorez une vaste sélection de biens immobiliers à{" "}
            <span className="font-bold text-[#E67E22]">Abidjan</span> et partout en{" "}
            <span className="font-bold text-[#E67E22]">Côte d'Ivoire</span>
          </p>

          {/* Barre de recherche moderne */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 border-2 border-[#E67E22]/10">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#E67E22]" />
                <Input
                  placeholder="Cocody, Riviera, Plateau, Yopougon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  type="search"
                  className="pl-14 pr-14 h-16 text-lg border-2 border-[#E67E22]/20 focus:border-[#E67E22] rounded-xl shadow-sm"
                />
                {isSupported && (
                  <button
                    onClick={toggleVoiceSearch}
                    className={`absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                        : 'bg-[#E67E22]/10 text-[#E67E22] hover:bg-[#E67E22]/20'
                    }`}
                    aria-label={isListening ? "Arrêter la recherche vocale" : "Recherche vocale"}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-[#E67E22] to-[#F39C12] hover:from-[#D35400] hover:to-[#E67E22] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
                
                <Link to="/publier">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 text-lg font-semibold border-2 border-[#E67E22] text-[#E67E22] hover:bg-[#E67E22] hover:text-white transition-all"
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Publier une annonce
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recherches populaires */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Populaire :</span>
              {['Cocody', 'Riviera Golf', 'Plateau', 'Marcory'].map((location) => (
                <button
                  key={location}
                  onClick={() => handleQuickSearch(location)}
                  className="text-sm px-4 py-2 rounded-full bg-[#FFF8F0] hover:bg-[#E67E22] text-[#E67E22] hover:text-white transition-all font-medium border border-[#E67E22]/20"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Points forts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <div className="p-2 bg-[#E67E22]/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#E67E22]" />
              </div>
              <div>
                <p className="font-bold text-[#2C3E50]">100% gratuit</p>
                <p className="text-sm text-gray-600">Sécurisé</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <div className="p-2 bg-[#E67E22]/10 rounded-lg">
                <Shield className="h-6 w-6 text-[#E67E22]" />
              </div>
              <div>
                <p className="font-bold text-[#2C3E50]">Certifié ANSUT</p>
                <p className="text-sm text-gray-600">Confiance</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <div className="p-2 bg-[#E67E22]/10 rounded-lg">
                <Clock className="h-6 w-6 text-[#E67E22]" />
              </div>
              <div>
                <p className="font-bold text-[#2C3E50]">Réponse en 48h</p>
                <p className="text-sm text-gray-600">Rapide</p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t-2 border-[#E67E22]/20">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-[#E67E22] mb-2">3500+</p>
              <p className="text-sm sm:text-base text-[#34495E] font-medium">Biens disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-[#E67E22] mb-2">10 000+</p>
              <p className="text-sm sm:text-base text-[#34495E] font-medium">Utilisateurs actifs</p>
            </div>
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-black text-[#E67E22] mb-2">98%</p>
              <p className="text-sm sm:text-base text-[#34495E] font-medium">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS pour le gradient */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;

