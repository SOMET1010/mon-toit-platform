import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Sparkles } from 'lucide-react';

export function NewHeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorer?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FFA07A] to-[#FFB84D]">
      {/* Pattern de maisons en transparence */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10l20 15v25H10V25l20-15z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Vague de transition en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
            fill="#FFF8F0"
          />
        </svg>
      </div>

      {/* Contenu */}
      <div className="container relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Badge ANSUT */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2 shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Plateforme certifiée ANSUT
          </Badge>
        </div>

        {/* Titre principal */}
        <h1 className="text-center text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Trouvez votre{' '}
          <span className="text-yellow-300">logement idéal</span>
          <br />
          en toute{' '}
          <span className="text-cyan-300">confiance</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-center text-lg md:text-xl text-white/95 max-w-3xl mx-auto mb-12 font-medium">
          L'immobilier accessible à tous avec signature électronique et paiement sécurisé
        </p>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 flex items-center gap-3 px-2">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Où souhaitez-vous habiter ? (Abidjan, Cocody, Plateau...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <Button 
              type="submit"
              size="lg" 
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-semibold px-8 py-6 rounded-xl shadow-lg transition-all hover:shadow-xl"
            >
              <Search className="h-5 w-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </form>

        {/* Indicateurs de slides (optionnel - peut être ajouté plus tard) */}
        <div className="flex justify-center gap-2 mt-12">
          <button 
            className="w-12 h-1 bg-white/50 rounded-full transition-all hover:bg-white/80"
            aria-label="Aller à la diapositive 1"
          />
          <button 
            className="w-3 h-1 bg-white/30 rounded-full transition-all hover:bg-white/50"
            aria-label="Aller à la diapositive 2"
          />
          <button 
            className="w-3 h-1 bg-white/30 rounded-full transition-all hover:bg-white/50"
            aria-label="Aller à la diapositive 3"
          />
          <button 
            className="w-3 h-1 bg-white/30 rounded-full transition-all hover:bg-white/50"
            aria-label="Aller à la diapositive 4"
          />
        </div>
      </div>
    </section>
  );
}

