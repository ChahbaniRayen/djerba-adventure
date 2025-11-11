import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.png"
                alt="Luxury Djerba Adventure"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">Luxury Djerba Adventure</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Votre partenaire de confiance pour découvrir les merveilles de
              Djerba. Expériences authentiques et services de qualité depuis
              2015.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="#activities"
                  className="hover:text-sky-400 transition-colors duration-200"
                >
                  Activités d&apos;aventure
                </a>
              </li>
              <li>
                <a
                  href="#tours"
                  className="hover:text-sky-400 transition-colors duration-200"
                >
                  Tours guidés
                </a>
              </li>
              <li>
                <a
                  href="#transfer"
                  className="hover:text-sky-400 transition-colors duration-200"
                >
                  Transfert aéroport
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-sky-400 transition-colors duration-200"
                >
                  Location de véhicules
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-sky-400" />
                Houmt Souk, Djerba 4180
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-sky-400" />
                +216 75 123 456
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-sky-400" />
                info@djerba-adventures.com
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-sky-400 transition-colors duration-200"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-sky-400 transition-colors duration-200"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-sky-400 transition-colors duration-200"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Certifié par l&apos;Office National du Tourisme Tunisien
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Luxury Djerba Adventure. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-sky-400 text-sm transition-colors duration-200"
            >
              Conditions générales
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-sky-400 text-sm transition-colors duration-200"
            >
              Politique de confidentialité
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-sky-400 text-sm transition-colors duration-200"
            >
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
