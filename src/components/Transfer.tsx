"use client";

import React, { useState } from "react";
import { Plane, MapPin, Clock } from "lucide-react";

interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  features: string[];
}

const Transfer: React.FC = () => {
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferOption | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const transferOptions: TransferOption[] = [
    {
      id: "standard",
      name: "Transfert Standard",
      description: "Véhicule confortable pour jusqu'à 4 personnes",
      price: 25,
      capacity: 4,
      features: ["Climatisation", "Chauffeur professionnel", "Eau offerte"],
    },
    {
      id: "premium",
      name: "Transfert Premium",
      description: "Véhicule de luxe avec services personnalisés",
      price: 45,
      capacity: 4,
      features: [
        "Véhicule haut de gamme",
        "Wifi gratuit",
        "Rafraîchissements",
        "Musique à bord",
      ],
    },
    {
      id: "group",
      name: "Transfert Groupe",
      description: "Minibus spacieux pour groupes et familles",
      price: 60,
      capacity: 8,
      features: [
        "Espace bagages",
        "Sièges confortables",
        "Guide accompagnateur",
      ],
    },
  ];

  const onBookTransfer = (transfer: TransferOption) => {
    setSelectedTransfer(transfer);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer) return;

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedTransfer.id,
      name: selectedTransfer.name,
      date: (form.date as HTMLInputElement).value,
      time: (form.time as HTMLInputElement).value,
      participants: (form.participants as HTMLInputElement).value,
      type: "transfer",
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
    <section
      id="transfer"
      className="py-20 bg-gradient-to-br from-emerald-50 to-sky-50 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-12 w-12 text-emerald-600 mr-3" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transfert Aéroport
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Service de transport fiable de l'aéroport vers votre destination
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {transferOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {option.name}
              </h3>
              <p className="text-gray-600 mb-4">{option.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  Jusqu'à {option.capacity} pers.
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {option.price}€
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">Inclus :</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onBookTransfer(option)}
                className="w-full py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors duration-200"
              >
                Réserver
              </button>
            </div>
          ))}
        </div>

        {/* Destinations Populaires */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Destinations Populaires
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Houmt Souk", time: "15 min" },
              { name: "Midoun", time: "20 min" },
              { name: "Zone Touristique", time: "25 min" },
              { name: "Guellala", time: "35 min" },
            ].map((destination) => (
              <div
                key={destination.name}
                className="text-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors duration-200"
              >
                <MapPin className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">
                  {destination.name}
                </h4>
                <div className="flex items-center justify-center text-gray-500 text-sm mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {destination.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal réservation */}
      {isBookingOpen && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <h3 className="text-2xl font-bold mb-4">
              Réserver : {selectedTransfer.name}
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
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
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

export default Transfer;
