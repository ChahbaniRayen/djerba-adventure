"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { urlFor } from "@/lib/sanity/queries";
import Reviews from "./Reviews";

interface Activity {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: { asset: { _ref: string; _type: string } };
  available: boolean;
  slug: { current: string };
}

const Activities: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
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
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const onViewDetails = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const onBookActivity = (activity: Activity) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setSelectedActivity(activity);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !session) {
      router.push("/auth/signin");
      return;
    }

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedActivity._id,
      activityName: selectedActivity.name,
      activityType: "activity",
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
      <section id="activities" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black">Chargement des activités...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="activities"
      className="py-10 sm:py-16 lg:py-20 bg-gray-50 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 sm:mb-4">
            Activités d&apos;Aventure
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-black max-w-2xl mx-auto px-4">
            Choisissez parmi nos activités palpitantes pour une expérience
            inoubliable
          </p>
        </div>

        {/* Grille */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative">
                {urlFor(activity.image) && (
                  <img
                    src={urlFor(activity.image)!}
                    alt={activity.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                )}
                {!activity.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      Bientôt disponible
                    </span>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-sky-600 mb-2">
                  {activity.name}
                </h3>
                <p className="text-sm sm:text-base text-black mb-3 sm:mb-4 line-clamp-2">
                  {truncateDescription(activity.description)}
                </p>
                <button
                  onClick={() => onViewDetails(activity)}
                  className="inline-flex items-center gap-1.5 text-sky-500 hover:text-sky-600 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 transition-colors duration-200 group"
                >
                  <span>Voir plus</span>
                  <span className="transform group-hover:translate-x-0.5 transition-transform duration-200">
                    →
                  </span>
                </button>

                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center text-black text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {activity.duration}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-sky-600">
                    {activity.price}€
                  </div>
                </div>

                {/* Bouton */}
                <button
                  onClick={() => activity.available && onBookActivity(activity)}
                  disabled={!activity.available}
                  className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors duration-200 ${
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

      {/* Modal détails */}
      {isDetailsOpen && selectedActivity && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailsOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-5xl my-4 sm:my-8 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 text-gray-600 hover:text-gray-900 hover:bg-red-100 rounded-full p-1.5 sm:p-2 transition-all duration-200 text-xl sm:text-2xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold z-10"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div className="mb-4 sm:mb-8">
              <div className="relative rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-lg">
                {urlFor(selectedActivity.image) && (
                  <img
                    src={urlFor(selectedActivity.image)!}
                    alt={selectedActivity.name}
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-600 mb-2">
                {selectedActivity.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 pt-2">
                <div className="flex items-center text-sky-700 bg-sky-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="font-semibold">
                    {selectedActivity.duration}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-600 bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  {selectedActivity.price}€
                </div>
                {selectedActivity.available ? (
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold border border-emerald-200">
                    ✓ Disponible
                  </span>
                ) : (
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-black rounded-full text-xs sm:text-sm font-semibold border border-gray-200">
                    Non disponible
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-sky-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-sky-100">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4 flex items-center">
                  <span className="w-1 h-6 sm:h-8 bg-gradient-to-b from-sky-500 to-cyan-500 rounded-full mr-2 sm:mr-3"></span>
                  Description
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-black whitespace-pre-line leading-relaxed">
                  {selectedActivity.description}
                </p>
              </div>

              <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-8">
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onBookActivity(selectedActivity);
                  }}
                  disabled={!selectedActivity.available}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-lg ${
                    selectedActivity.available
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Réserver maintenant
                </button>
              </div>
            </div>

            {/* Avis */}
            <div className="border-t-2 border-sky-200 pt-8">
              <Reviews
                activityId={selectedActivity._id}
                activityType="activity"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal réservation */}
      {isBookingOpen && selectedActivity && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsBookingOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md relative">
            <button
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 text-gray-600 hover:text-gray-900 hover:bg-red-100 rounded-full p-1.5 sm:p-2 transition-all duration-200 text-xl sm:text-2xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold z-10"
              aria-label="Fermer"
            >
              ✕
            </button>

            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-sky-500">
              Réserver : {selectedActivity.name}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={session?.user?.email || ""}
                  required
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 bg-gray-50 text-sm sm:text-base text-black"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-600">
                  Email de votre compte connecté
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base text-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base text-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Participants
                </label>
                <input
                  type="number"
                  name="participants"
                  min="1"
                  defaultValue="1"
                  required
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base text-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base text-black"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-black">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-1 w-full border rounded-lg p-2 sm:p-2.5 text-sm sm:text-base text-black"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              {message && (
                <p
                  className={`text-xs sm:text-sm ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-sky-500 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-sky-600 disabled:opacity-50"
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

export default Activities;
