"use client";

import React, { useState } from "react";
import { MapPin, Clock } from "lucide-react";

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  highlights: string[];
  image: string;
}

const Tours: React.FC = () => {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const tours: Tour[] = [
    {
      id: "heritage-tour",
      name: "Tour du Patrimoine",
      description: "Découvrez la riche histoire et culture de Djerba",
      price: 35,
      duration: "6h",
      highlights: ["Synagogue El Ghriba", "Village de Guellala", "Houmt Souk"],
      image:
        "https://images.pexels.com/photos/2850167/pexels-photo-2850167.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    },
    {
      id: "beach-tour",
      name: "Tour des Plages",
      description: "Explorez les plus belles plages de l'île",
      price: 25,
      duration: "4h",
      highlights: ["Plage Sidi Mahres", "Plage Seguia", "Coucher de soleil"],
      image:
        "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    },
    {
      id: "adventure-tour",
      name: "Tour Aventure",
      description: "Combiné d'activités pour les amateurs de sensations",
      price: 120,
      duration: "8h",
      highlights: ["Quad + Jet-ski", "Déjeuner inclus", "Photos souvenirs"],
      image:
        "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    },
  ];

  const onBookTour = (tour: Tour) => {
    setSelectedTour(tour);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour) return;

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedTour.id,
      name: selectedTour.name,
      date: (form.date as HTMLInputElement).value,
      time: (form.time as HTMLInputElement).value,
      participants: (form.participants as HTMLInputElement).value,
      type: "tour",
    };

    try {
      setLoading(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Réservation confirmée !");
        form.reset();
      } else {
        setMessage("❌ Erreur : " + data.message);
      }
    } catch (error) {
      setMessage("⚠️ Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tours" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tours Guidés
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorez Djerba avec nos guides locaux experts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="relative">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tour.name}
                </h3>
                <p className="text-gray-600 mb-4">{tour.description}</p>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-sky-500" />
                    Points forts :
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tour.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mr-2"></span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {tour.duration}
                  </div>
                  <div className="text-2xl font-bold text-amber-600">
                    {tour.price}€
                  </div>
                </div>

                <button
                  onClick={() => onBookTour(tour)}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors duration-200"
                >
                  Réserver ce tour
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal réservation */}
      {isBookingOpen && selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <h3 className="text-2xl font-bold mb-4">
              Réserver : {selectedTour.name}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="mt-1 w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="mt-1 w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Participants
                </label>
                <input
                  type="number"
                  name="participants"
                  min="1"
                  defaultValue="1"
                  required
                  className="mt-1 w-full border rounded-lg p-2"
                />
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Confirmer la réservation"}
              </button>
            </form>

            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Tours;
