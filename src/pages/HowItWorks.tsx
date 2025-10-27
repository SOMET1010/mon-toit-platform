import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import { TimelineSection } from '@/components/home/TimelineSection';
import { SocialProofSection } from '@/components/home/SocialProofSection';
import { ComplianceSection } from '@/components/home/ComplianceSection';
import {
  Home,
  Building2,
  Shield,
  Building,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  FileSignature,
  CreditCard,
  Briefcase,
  Clock,
  Lock,
} from 'lucide-react';

/**
 * Page "Comment ça marche ?"
 * 
 * Explique le workflow complet de Mon Toit avec :
 * - Les 4 parcours utilisateur
 * - Les 3 innovations ANSUT
 * - FAQ intégrée
 * - CTA finaux
 */
const HowItWorks = () => {
  const navigate = useNavigate();

  const userJourneys = [
    {
      id: 'tenant',
      title: 'Locataire',
      icon: Home,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      description: 'Trouvez votre logement idéal avec un dossier certifié',
      steps: [
        'Créez votre dossier vérifié (Smile ID)',
        'Recherchez et postulez en 1 clic',
        'Signez électroniquement (PSE agréé)',
      ],
      cta: 'Créer mon dossier',
      ctaAction: () => navigate('/auth'),
      badge: 'Gratuit',
    },
    {
      id: 'owner',
      title: 'Propriétaire',
      icon: Building2,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-600',
      iconColor: 'text-green-600',
      description: 'Louez votre bien en toute sécurité',
      steps: [
        'Publiez votre bien (gratuit, 5 min)',
        'Recevez des dossiers pré-vérifiés',
        'Choisissez et signez le bail',
      ],
      cta: 'Publier mon bien',
      ctaAction: () => navigate('/auth'),
      badge: 'Gratuit',
    },
    {
      id: 'trust_agent',
      title: 'Tiers de Confiance',
      icon: Shield,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-600',
      description: 'Certifiez les dossiers et percevez vos honoraires',
      steps: [
        'Créez votre compte professionnel',
        'Vérifiez les dossiers (identité, solvabilité)',
        'Certifiez et percevez vos honoraires',
      ],
      cta: 'Devenir Tiers de Confiance',
      ctaAction: () => navigate('/auth'),
      badge: 'Pro',
    },
    {
      id: 'agency',
      title: 'Agence Immobilière',
      icon: Building,
      color: 'lime',
      bgColor: 'bg-lime-50',
      borderColor: 'border-lime-600',
      iconColor: 'text-lime-700',
      description: 'Gérez vos mandats avec des outils professionnels',
      steps: [
        'Créez votre compte Agence (agrément vérifié)',
        'Ajoutez vos mandats clients',
        'Suivez vos locations (Dashboard + commissions)',
      ],
      cta: 'Créer mon compte Agence',
      ctaAction: () => navigate('/auth'),
      badge: 'Pro',
    },
  ];

  const innovations = [
    {
      icon: Smartphone,
      title: 'Vérification Smile ID',
      description: 'Reconnaissance faciale biométrique reliée à la base ONECI',
      impact: 'Identité certifiée en quelques secondes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FileSignature,
      title: 'Signature Électronique PSE agréé',
      description: 'Prestataire de Service Électronique Cryptoneo agréé par l\'État',
      impact: 'Valeur juridique équivalente à une signature manuscrite',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CreditCard,
      title: 'Paiement Mobile Money',
      description: 'Orange Money / MTN Money / Moov Money',
      impact: 'Transactions instantanées et traçables',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const faqs = [
    {
      question: 'Est-ce gratuit ?',
      answer: 'Oui, Mon Toit est 100% gratuit pour les locataires et propriétaires. Seuls les services professionnels (Tiers de Confiance, Agences) sont payants.',
    },
    {
      question: 'Comment se fait la vérification Smile ID ?',
      answer: 'La vérification Smile ID utilise la reconnaissance faciale biométrique pour comparer votre selfie avec votre pièce d\'identité. Le système se connecte à la base ONECI pour vérifier l\'authenticité. Le processus prend quelques minutes.',
    },
    {
      question: 'Comment publier une annonce ?',
      answer: 'Créez un compte propriétaire, remplissez les informations de votre bien (photos, description, prix), et publiez en 5 minutes. Votre annonce sera visible immédiatement.',
    },
    {
      question: 'Les baux sont-ils légalement valides ?',
      answer: 'Oui, tous les baux signés sur Mon Toit utilisent la signature électronique PSE agréé par l\'État ivoirien (Cryptoneo). Ces signatures ont la même valeur juridique qu\'une signature manuscrite.',
    },
    {
      question: 'Qu\'est-ce qu\'un Tiers de Confiance ?',
      answer: 'Un Tiers de Confiance est un professionnel certifié qui vérifie et certifie les dossiers des locataires (identité, solvabilité, documents). Il garantit la fiabilité des informations pour les propriétaires.',
    },
    {
      question: 'Les agences peuvent-elles utiliser Mon Toit ?',
      answer: 'Oui, les agences immobilières disposent d\'un dashboard dédié avec des outils avancés : gestion multi-biens, suivi des mandats, analytics, et gestion des commissions.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-blue-600 to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Guide complet
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Comment ça marche ?
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Mon Toit simplifie la location immobilière en Côte d'Ivoire grâce aux innovations ANSUT : 
              vérification d'identité, signature électronique et paiement mobile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate('/auth')}
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate('/properties')}
              >
                Explorer les annonces
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection />

      {/* User Journeys Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Les 4 Parcours Utilisateur
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Que vous soyez locataire, propriétaire, tiers de confiance ou agence, 
              Mon Toit vous accompagne à chaque étape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {userJourneys.map((journey, index) => {
              const Icon = journey.icon;
              return (
                <Card
                  key={journey.id}
                  className={`${journey.bgColor} border-l-4 ${journey.borderColor} hover:shadow-lg transition-all duration-300`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${journey.bgColor} border ${journey.borderColor}`}>
                          <Icon className={`h-6 w-6 ${journey.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{journey.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {journey.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{journey.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {journey.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full ${journey.bgColor} border-2 ${journey.borderColor} flex items-center justify-center text-sm font-bold ${journey.iconColor}`}>
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      onClick={journey.ctaAction}
                    >
                      {journey.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovations ANSUT Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-600 text-white">
              Propulsé par ANSUT
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Les 3 Innovations ANSUT
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Technologies certifiées pour une location 100% sécurisée et digitale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {innovations.map((innovation, index) => {
              const Icon = innovation.icon;
              return (
                <Card key={index} className={`${innovation.bgColor} border-t-4 border-t-${innovation.color.replace('text-', '')}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${innovation.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${innovation.color}`} />
                    </div>
                    <CardTitle className="text-xl">{innovation.title}</CardTitle>
                    <CardDescription className="text-base">
                      {innovation.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 ${innovation.color} flex-shrink-0 mt-0.5`} />
                      <p className="text-sm font-medium text-gray-700">
                        {innovation.impact}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Coming Soon - CNPS */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 border-2 border-dashed border-blue-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Vérification CNPS</CardTitle>
                    <Badge variant="secondary">Prochainement</Badge>
                  </div>
                  <CardDescription className="text-base mt-1">
                    Vérification automatique employeur + salaire via CNPS pour confirmer la solvabilité des locataires
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Compliance Section */}
      <ComplianceSection />

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur Mon Toit
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-blue-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-white/90">
              Rejoignez des milliers d'Ivoiriens qui font confiance à Mon Toit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate('/properties')}
              >
                <Home className="mr-2 h-5 w-5" />
                Chercher un logement
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Publier une annonce
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;

