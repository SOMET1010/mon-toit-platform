import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, UserCheck, Shield, FileText, Search, MessageSquare, HelpCircle } from "lucide-react";

const Guide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Guide d'utilisation Mon Toit
            </h1>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir pour utiliser la plateforme
            </p>
          </div>

          {/* Role-based Guides */}
          <Tabs defaultValue="locataire" className="mb-12">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="locataire">
                <Search className="h-4 w-4 mr-2" />
                Locataire
              </TabsTrigger>
              <TabsTrigger value="proprietaire">
                <Building2 className="h-4 w-4 mr-2" />
                Propriétaire
              </TabsTrigger>
              <TabsTrigger value="agence">
                <Shield className="h-4 w-4 mr-2" />
                Agence
              </TabsTrigger>
            </TabsList>

            {/* Locataire Guide */}
            <TabsContent value="locataire" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Démarrer en tant que locataire
                  </CardTitle>
                  <CardDescription>
                    Gratuit à 100% - Trouvez votre logement idéal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 1 : Créer votre compte</h3>
                    <p className="text-sm text-muted-foreground">
                      Inscrivez-vous gratuitement avec votre email. Sélectionnez "Locataire" comme type de compte.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 2 : Rechercher un logement</h3>
                    <p className="text-sm text-muted-foreground">
                      Utilisez la barre de recherche ou naviguez sur la carte interactive. Filtrez par prix, quartier, type de bien.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 3 : Contacter le propriétaire</h3>
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur "Contacter" pour envoyer un message. Le propriétaire recevra une notification.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 4 : Vérification ANSUT (Recommandé)</h3>
                    <p className="text-sm text-muted-foreground">
                      Complétez votre vérification d'identité (ONECI/CNI) et obtenir votre badge certifié ANSUT pour augmenter vos chances.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Propriétaire Guide */}
            <TabsContent value="proprietaire" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Publier votre bien
                  </CardTitle>
                  <CardDescription>
                    Louez en toute sécurité avec ANSUT
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 1 : Créer votre compte propriétaire</h3>
                    <p className="text-sm text-muted-foreground">
                      Inscrivez-vous et sélectionnez "Propriétaire" ou "Agence immobilière".
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 2 : Publier votre annonce</h3>
                    <p className="text-sm text-muted-foreground">
                      Remplissez les informations du bien : adresse, prix, photos, caractéristiques. Ajoutez des photos de qualité et des vidéos si possible.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 3 : Validation de l'annonce</h3>
                    <p className="text-sm text-muted-foreground">
                      Votre annonce sera vérifiée par ANSUT sous 24-48h. Vous recevrez une notification.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Étape 4 : Gérer les candidatures</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultez les profils des candidats certifiés ANSUT et leurs dossiers. Communiquez via la messagerie sécurisée.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agence Guide */}
            <TabsContent value="agence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Gérer vos mandats
                  </CardTitle>
                  <CardDescription>
                    Solution professionnelle pour agences immobilières
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Compte agence certifié</h3>
                    <p className="text-sm text-muted-foreground">
                      Créez un compte agence et complétez la vérification professionnelle ANSUT.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Gestion multi-propriétaires</h3>
                    <p className="text-sm text-muted-foreground">
                      Gérez les biens de plusieurs propriétaires depuis un seul tableau de bord.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Outils professionnels</h3>
                    <p className="text-sm text-muted-foreground">
                      Accédez aux statistiques avancées, reporting, et gestion des commissions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* FAQ Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Questions Fréquentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>La plateforme est-elle vraiment gratuite pour les locataires ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, 100% gratuit ! Mon Toit est financé par l'ANSUT (Agence Nationale de Soutien au logement et de lutte contre l'habitat précaire). Les locataires ne paient aucun frais d'inscription, de recherche ou de candidature.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Comment fonctionne la certification ANSUT ?</AccordionTrigger>
                  <AccordionContent>
                    La certification ANSUT vérifie votre identité via ONECI (carte d'identité nationale) et optionnellement via CNAM (sécurité sociale). Cette certification est gratuite et augmente votre crédibilité auprès des propriétaires.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Puis-je publier sans connexion ?</AccordionTrigger>
                  <AccordionContent>
                    Vous pouvez consulter toutes les annonces sans créer de compte. Pour contacter un propriétaire ou publier un bien, vous devez créer un compte gratuit.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Comment changer entre profil locataire et propriétaire ?</AccordionTrigger>
                  <AccordionContent>
                    Utilisez le sélecteur de rôle en haut à droite de l'écran (icône utilisateur). Vous pouvez basculer entre vos différents rôles sans vous déconnecter.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Mes données personnelles sont-elles sécurisées ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, Mon Toit utilise le chiffrement de bout en bout et respecte le RGPD. Vos documents sensibles (CNI, justificatifs) sont stockés de manière sécurisée et ne sont partagés qu'avec votre consentement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Que signifient les badges de statut colorés ?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p>🟢 <strong>Vert (Disponible)</strong> : Le bien est disponible à la location</p>
                      <p>🟠 <strong>Orange (En attente)</strong> : Annonce en cours de validation par ANSUT</p>
                      <p>🔵 <strong>Bleu (Loué)</strong> : Bien déjà loué</p>
                      <p>⚫ <strong>Gris (Retiré)</strong> : Annonce retirée par le propriétaire</p>
                      <p>🔴 <strong>Rouge (Refusé)</strong> : Annonce non conforme</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Besoin d'aide ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Notre équipe est là pour vous accompagner. Contactez-nous :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-sm text-muted-foreground">support@montoit.ci</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Téléphone</h4>
                  <p className="text-sm text-muted-foreground">+225 XX XX XX XX XX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Guide;
