import { Home, Mail, Phone, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import monToitLogo from "@/assets/mon-toit-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={monToitLogo} alt="Mon Toit" className="h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              La plateforme de confiance pour l'immobilier en Côte d'Ivoire
            </p>
            <div className="mb-3 text-sm text-secondary font-semibold">
              🎁 Gratuit pour tous les locataires
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Financé par l'ANSUT</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/recherche" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Rechercher un bien
                </Link>
              </li>
              <li>
                <Link to="/publier" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-300 hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Légal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/certification" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Certification ANSUT
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                contact@montoit.ci
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4" />
                +225 27 XX XX XX XX
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                Abidjan, Côte d'Ivoire
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 Mon Toit - Propulsé par ANSUT. Tous droits réservés.</p>
          <p className="mt-2 text-xs">Conforme à la loi ivoirienne 2013-450 sur la protection des données</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
