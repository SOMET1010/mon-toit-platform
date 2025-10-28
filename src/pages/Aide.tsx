import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, HelpCircle, BookOpen, Shield } from "lucide-react";

const Aide = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Centre d'aide"
        description="Trouvez des réponses à vos questions et contactez notre équipe support"
        badge="Support 24/7"
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Contact rapide */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-orange-200 hover:border-orange-400 transition-colors">
            <CardHeader>
              <Mail className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Email</CardTitle>
              <CardDescription>Réponse sous 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:contact@montoit.ci" className="text-orange-600 hover:text-orange-700 font-medium">
                contact@montoit.ci
              </a>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:border-orange-400 transition-colors">
            <CardHeader>
              <Phone className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Téléphone</CardTitle>
              <CardDescription>Lun-Ven 8h-18h</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="tel:+22507000000" className="text-orange-600 hover:text-orange-700 font-medium">
                +225 07 00 00 00 00
              </a>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:border-orange-400 transition-colors">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">WhatsApp</CardTitle>
              <CardDescription>Support instantané</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="https://wa.me/22507000000" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 font-medium">
                Démarrer une conversation
              </a>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-8 w-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Comment créer mon dossier de locataire vérifié ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Pour créer votre dossier vérifié, cliquez sur "Je cherche un logement" sur la page d'accueil, puis suivez les étapes :
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Créez votre compte Mon Toit</li>
                  <li>Complétez vos informations personnelles</li>
                  <li>Vérifiez votre identité avec Smile ID (CNI ou passeport)</li>
                  <li>Ajoutez vos documents (bulletins de salaire, attestation d'emploi)</li>
                </ol>
                Votre dossier sera vérifié sous 24-48h par notre équipe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Comment publier une annonce de bien immobilier ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Pour publier une annonce :
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Connectez-vous à votre compte propriétaire</li>
                  <li>Cliquez sur "Publier" dans le menu</li>
                  <li>Remplissez les informations du bien (type, surface, prix, localisation)</li>
                  <li>Ajoutez des photos de qualité (minimum 5)</li>
                  <li>Validez et attendez la vérification ANSUT (24-48h)</li>
                </ol>
                Les biens vérifiés ont 3x plus de visibilité !
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Qu'est-ce que la vérification ANSUT ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                La vérification ANSUT (Agence Nationale de Services Universels de Télécommunications) garantit :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>L'authenticité de l'identité des utilisateurs (Smile ID / ONECI)</li>
                  <li>La conformité des biens immobiliers</li>
                  <li>La sécurité des transactions (signature PSE agréé)</li>
                  <li>La souveraineté numérique nationale</li>
                </ul>
                C'est votre garantie de confiance et de sécurité.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Comment fonctionne le paiement Mobile Money ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Mon Toit accepte tous les moyens de paiement Mobile Money :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Orange Money</strong> : Paiement instantané</li>
                  <li><strong>MTN Mobile Money</strong> : Paiement instantané</li>
                  <li><strong>Moov Money</strong> : Paiement instantané</li>
                </ul>
                Les paiements sont sécurisés et tracés. Vous recevez un reçu électronique immédiatement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Comment signer mon bail électroniquement ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                La signature électronique sur Mon Toit utilise la technologie PSE (Prestataire de Services Électroniques) agréé par l'ANSUT :
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Recevez le bail par email et sur votre tableau de bord</li>
                  <li>Vérifiez les conditions du bail</li>
                  <li>Signez avec votre certificat numérique (fourni gratuitement)</li>
                  <li>Le bail signé est juridiquement valable et opposable</li>
                </ol>
                La signature électronique a la même valeur légale qu'une signature manuscrite.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-orange-200 rounded-lg px-6">
              <AccordionTrigger className="text-left hover:text-orange-600">
                Quels sont les frais de service ?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <strong>Pour les locataires :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Création de compte : Gratuit</li>
                  <li>Vérification d'identité : Gratuit</li>
                  <li>Recherche de biens : Gratuit</li>
                  <li>Frais de dossier : 5% du loyer mensuel (payable une seule fois)</li>
                </ul>
                <strong className="block mt-4">Pour les propriétaires :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Publication d'annonces : Gratuit</li>
                  <li>Vérification ANSUT : Gratuit</li>
                  <li>Commission : 10% du loyer annuel (payable à la signature du bail)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Guides */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-orange-600" />
            <h2 className="text-3xl font-bold text-gray-900">Guides pratiques</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-orange-200 hover:border-orange-400 transition-colors">
              <CardHeader>
                <CardTitle>Guide du locataire</CardTitle>
                <CardDescription>Tout savoir pour trouver votre logement idéal</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                  Télécharger le guide PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:border-orange-400 transition-colors">
              <CardHeader>
                <CardTitle>Guide du propriétaire</CardTitle>
                <CardDescription>Optimisez la gestion de vos biens immobiliers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
                  Télécharger le guide PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sécurité */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <CardTitle>Sécurité et confidentialité</CardTitle>
                <CardDescription>Vos données sont protégées par l'ANSUT</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-gray-700">
              Mon Toit est une plateforme certifiée ANSUT qui respecte les standards nationaux de sécurité et de confidentialité.
              Toutes vos données personnelles sont chiffrées et stockées en Côte d'Ivoire conformément à la loi sur la protection des données.
            </p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                Politique de confidentialité
              </Button>
              <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                Conditions d'utilisation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Aide;

