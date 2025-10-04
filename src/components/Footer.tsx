import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ImmoCI</span>
            </div>
            <p className="text-background/80 text-sm">
              La plateforme de confiance pour l'immobilier en Côte d'Ivoire
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/recherche" className="text-background/80 hover:text-background transition-smooth">
                  Rechercher un bien
                </Link>
              </li>
              <li>
                <Link to="/publier" className="text-background/80 hover:text-background transition-smooth">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-background/80 hover:text-background transition-smooth">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/conditions" className="text-background/80 hover:text-background transition-smooth">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-background/80 hover:text-background transition-smooth">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="text-background/80 hover:text-background transition-smooth">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-background/80">
                <Mail className="h-4 w-4" />
                contact@immoci.com
              </li>
              <li className="flex items-center gap-2 text-background/80">
                <Phone className="h-4 w-4" />
                +225 XX XX XX XX XX
              </li>
              <li className="flex items-center gap-2 text-background/80">
                <MapPin className="h-4 w-4" />
                Abidjan, Côte d'Ivoire
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
          <p>© 2025 ImmoCI. Tous droits réservés. Conforme à la loi ivoirienne 2013-450</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
