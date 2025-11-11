import React from "react";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute  inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Découvrez la Magie de
          <span className="block text-sky-400">Djerba</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Réservez vos activités d&apos;aventure et explorez les merveilles de
          l&apos;île de Djerba
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#activities"
            className="inline-flex items-center justify-center px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Découvrir les Activités
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>

          <a
            href="#tours"
            className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-200"
          >
            Tours Guidés
          </a>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
