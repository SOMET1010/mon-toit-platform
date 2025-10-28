import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Building2, ShieldCheck, Landmark, ChevronRight, CheckCircle2 } from 'lucide-react';

type Role = 'locataire' | 'proprietaire' | 'tiers' | 'agence';

const stepsByRole: Record<Role, string[]> = {
  locataire: ['Créer mon dossier vérifié', 'Postuler en 1 clic', 'Signer & payer'],
  proprietaire: ['Publier mon bien', 'Recevoir dossiers certifiés', 'Signer le bail'],
  tiers: ['Compte pro', 'Vérifier dossiers', 'Certifier & facturer'],
  agence: ['Créer compte agence', 'Ajouter mandats', 'Suivre locations'],
};

const roleCTAs: Record<Role, { label: string; href: string }> = {
  locataire: { label: 'Commencer maintenant', href: '/auth?role=locataire' },
  proprietaire: { label: 'Publier mon bien', href: '/publier' },
  tiers: { label: 'Devenir Tiers de Confiance', href: '/auth?role=tiers' },
  agence: { label: 'Créer mon espace Agence', href: '/auth?role=agence' },
};

const roleColors: Record<Role, string> = {
  locataire: 'border-orange-700 text-orange-700 bg-orange-50',
  proprietaire: 'border-orange-700 text-orange-700 bg-orange-50',
  tiers: 'border-orange-700 text-orange-700 bg-orange-50',
  agence: 'border-orange-700 text-orange-700 bg-orange-50',
};

const roleIcons = {
  locataire: Home,
  proprietaire: Building2,
  tiers: ShieldCheck,
  agence: Landmark,
};

export function DynamicHeroSection() {
  const [role, setRole] = useState<Role>('locataire');
  const roleCTA = roleCTAs[role];

  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-orange-300 via-orange-100 to-stone-50">
      {/* Overlay gradient - Retiré pour fond clair */}
      
      {/* Pattern ivoirien subtil */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
      }}></div>

      {/* Contenu */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* Badge ANSUT */}
        <div className="flex justify-center mb-6">
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Propulsé par ANSUT
          </Badge>
        </div>

        {/* Titre principal */}
        <h1 className="text-center text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
          Louez et gérez vos biens en toute confiance
        </h1>
        <p className="text-center text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
          Vérification Smile ID/ONECI, signature PSE agréé, Mobile Money. 
          <br className="hidden md:block" />
          <strong>Simple, sécurisé, souverain.</strong>
        </p>

        {/* Sélecteur de rôle - Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: 'locataire' as Role, label: 'Je cherche un logement', Icon: Home },
            { id: 'proprietaire' as Role, label: 'Je loue un bien', Icon: Building2 },
            { id: 'tiers' as Role, label: 'Je vérifie & certifie', Icon: ShieldCheck },
            { id: 'agence' as Role, label: 'Je gère des mandats', Icon: Landmark },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setRole(id)}
              aria-pressed={role === id}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                role === id
                  ? 'bg-white text-gray-900 border-white shadow-lg scale-105'
                  : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Étapes dynamiques 1-2-3 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stepsByRole[role].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm p-4 hover:bg-white/20 transition-all duration-200"
              >
                <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-700 text-white text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-white font-medium text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Double CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link to={roleCTA.href}>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl min-w-[220px]">
              {roleCTA.label}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/explorer">
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 min-w-[220px]">
              Explorer les biens
            </Button>
          </Link>
        </div>

        {/* Trust bar ANSUT */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md p-4 md:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-white" />
              <span className="text-white font-semibold text-sm md:text-base">ANSUT</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-white text-sm">Vérification Smile ID / ONECI</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-white text-sm">Signature PSE agréé</span>
            </div>
            <div className="hidden md:block h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-white text-sm">Paiement Mobile Money</span>
            </div>
          </div>
          <p className="text-center text-white/80 text-sm mt-4">
            Plateforme soutenue par l'ANSUT — <strong>Souveraineté & conformité nationale</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

