"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import { urlFor } from "@/lib/sanity/queries";
import Reviews from "./Reviews";

interface Tour {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  highlights: string[];
  image: { asset: { _ref: string; _type: string } };
  slug: { current: string };
}

const Tours: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const truncateDescription = (text: string, maxLines: number = 2): string => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join("\n") + "...";
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await fetch("/api/tours");
      const data = await res.json();
      setTours(data.tours || []);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const onViewDetails = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDetailsOpen(true);
  };

  const onBookTour = (tour: Tour) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setSelectedTour(tour);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour || !session) {
      router.push("/auth/signin");
      return;
    }

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedTour._id,
      activityName: selectedTour.name,
      activityType: "tour",
      date: (form.date as HTMLInputElement).value,
      time: (form.time as HTMLInputElement).value,
      participants: (form.participants as HTMLInputElement).value,
      phone: (form.phone as HTMLInputElement)?.value || "",
      notes: (form.notes as HTMLTextAreaElement)?.value || "",
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          "✅ Demande de réservation envoyée ! Vous recevrez une confirmation par email."
        );
        form.reset();
        setTimeout(() => {
          setIsBookingOpen(false);
        }, 2000);
      } else {
        setMessage("❌ Erreur : " + data.message);
      }
    } catch (error) {
      setMessage("⚠️ Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="tours" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black">Chargement des tours...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="tours" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Tours Guidés
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Explorez Djerba avec nos guides locaux experts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-black">
                Aucun tour disponible pour le moment.
              </p>
            </div>
          ) : (
            tours.map((tour) => (
              <div
                key={tour._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                <div className="relative">
                  {urlFor(tour.image) && (
                    <img
                      src={urlFor(tour.image)!}
                      alt={tour.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-amber-600 mb-2">
                    {tour.name}
                  </h3>
                  <p className="text-black mb-2 line-clamp-2">
                    {truncateDescription(tour.description)}
                  </p>
                  <button
                    onClick={() => onViewDetails(tour)}
                    className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-semibold mb-4 transition-colors duration-200 group"
                  >
                    <span>Voir plus</span>
                    <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">
                      →
                    </span>
                  </button>

                  <div className="mb-4">
                    <h4 className="font-semibold text-black mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-sky-500" />
                      Points forts :
                    </h4>
                    <ul className="text-sm text-black space-y-1">
                      {tour.highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mr-2"></span>
                          {highlight}
                        </li>
                      ))}
                      {tour.highlights.length > 3 && (
                        <li className="text-amber-600 text-xs italic">
                          +{tour.highlights.length - 3} autres
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-black text-sm">
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
            ))
          )}
        </div>
      </div>

      {/* Modal détails */}
      {isDetailsOpen && selectedTour && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailsOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl my-8 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute top-6 right-6 text-black hover:text-black hover:bg-red-100 rounded-full p-2 transition-all duration-200 text-2xl w-10 h-10 flex items-center justify-center font-bold z-10"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
                {urlFor(selectedTour.image) && (
                  <img
                    src={urlFor(selectedTour.image)!}
                    alt={selectedTour.name}
                    className="w-full h-80 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <h2 className="text-4xl font-bold text-amber-600 mb-2">
                {selectedTour.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-6 pt-2">
                <div className="flex items-center text-amber-700 bg-amber-50 px-4 py-2 rounded-full">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{selectedTour.duration}</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {selectedTour.price}€
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-amber-50 rounded-xl p-6 mb-6 border border-amber-100">
                <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                  Description
                </h3>
                <p className="text-black whitespace-pre-line leading-relaxed text-lg">
                  {selectedTour.description}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6 border border-amber-200 shadow-sm">
                <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-amber-600" />
                  Points forts
                </h3>
                <ul className="space-y-3">
                  {selectedTour.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start text-black">
                      <span className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-lg">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onBookTour(selectedTour);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Réserver ce tour
                </button>
              </div>
            </div>

            {/* Avis */}
            <div className="border-t-2 border-amber-200 pt-8">
              <Reviews activityId={selectedTour._id} activityType="tour" />
            </div>
          </div>
        </div>
      )}

      {/* Modal réservation */}
      {isBookingOpen && selectedTour && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsBookingOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-6 right-6 text-black hover:text-black hover:bg-red-100 rounded-full p-2 transition-all duration-200 text-2xl w-10 h-10 flex items-center justify-center font-bold z-10"
              aria-label="Fermer"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4">
              <span className="text-sky-500">
                Réserver : {selectedTour.name}
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={session?.user?.email || ""}
                  required
                  className="mt-1 w-full border rounded-lg p-2 bg-gray-50 text-black"
                  readOnly
                />
                <p className="mt-1 text-xs text-black">
                  Email de votre compte connecté
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="mt-1 w-full border rounded-lg p-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="mt-1 w-full border rounded-lg p-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Participants
                </label>
                <input
                  type="number"
                  name="participants"
                  min="1"
                  defaultValue="1"
                  required
                  className="mt-1 w-full border rounded-lg p-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="mt-1 w-full border rounded-lg p-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-1 w-full border rounded-lg p-2 text-black"
                  placeholder="Informations supplémentaires..."
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
                disabled={submitting}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Envoyer la demande"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Tours;
