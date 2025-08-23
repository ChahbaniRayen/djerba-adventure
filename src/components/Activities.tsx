"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  available: boolean;
}

const Activities: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const activities: Activity[] = [
    {
      id: "horse",
      name: "Balade à Cheval",
      description: "Explorez les plages et dunes de Djerba à cheval",
      price: 45,
      duration: "2h",
      image:
        "https://images.pexels.com/photos/1996333/pexels-photo-1996333.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      available: true,
    },
    {
      id: "quad",
      name: "Excursion Quad",
      description: "Aventure palpitante en quad à travers le désert",
      price: 65,
      duration: "3h",
      image:
        "https://images.pexels.com/photos/163811/desert-sand-dune-landscape-163811.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      available: true,
    },
    {
      id: "buggy",
      name: "Safari Buggy",
      description: "Découvrez l'arrière-pays en buggy tout-terrain",
      price: 85,
      duration: "4h",
      image:
        "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      available: true,
    },
    {
      id: "jetski",
      name: "Jet-Ski",
      description: "Sensations fortes sur les eaux cristallines",
      price: 75,
      duration: "1h",
      image:
        "https://images.pexels.com/photos/1422673/pexels-photo-1422673.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      available: true,
    },
    {
      id: "parachute",
      name: "Parachute Ascensionnel",
      description: "Admirez Djerba depuis les airs",
      price: 95,
      duration: "30min",
      image:
        "https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      available: false,
    },
  ];

  const onBookActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedActivity.id,
      name: selectedActivity.name,
      date: (form.date as HTMLInputElement).value,
      time: (form.time as HTMLInputElement).value,
      participants: (form.participants as HTMLInputElement).value,
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
    <section id="activities" className="py-20 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Activités d'Aventure
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez parmi nos activités palpitantes pour une expérience
            inoubliable
          </p>
        </div>

        {/* Grille */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-48 object-cover"
                />
                {!activity.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      Bientôt disponible
                    </span>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activity.name}
                </h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {activity.duration}
                  </div>
                  <div className="text-2xl font-bold text-sky-600">
                    {activity.price}€
                  </div>
                </div>

                {/* Bouton */}
                <button
                  onClick={() => activity.available && onBookActivity(activity)}
                  disabled={!activity.available}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    activity.available
                      ? "bg-sky-500 text-white hover:bg-sky-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {activity.available
                    ? "Réserver maintenant"
                    : "Non disponible"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal réservation */}
      {isBookingOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <h3 className="text-2xl font-bold mb-4">
              Réserver : {selectedActivity.name}
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
                className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 disabled:opacity-50"
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

export default Activities;
