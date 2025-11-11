"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plane, MapPin, Clock } from "lucide-react";
import { urlFor } from "@/lib/sanity/queries";
import Reviews from "./Reviews";

interface TransferOption {
  _id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  features: string[];
  image?: { asset: { _ref: string; _type: string } };
  slug: { current: string };
}

const Transfer: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [transfers, setTransfers] = useState<TransferOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferOption | null>(null);
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
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const res = await fetch("/api/transfers");
      const data = await res.json();
      setTransfers(data.transfers || []);
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  const onViewDetails = (transfer: TransferOption) => {
    setSelectedTransfer(transfer);
    setIsDetailsOpen(true);
  };

  const onBookTransfer = (transfer: TransferOption) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setSelectedTransfer(transfer);
    setIsBookingOpen(true);
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransfer || !session) {
      router.push("/auth/signin");
      return;
    }

    const form = e.target as HTMLFormElement;
    const reservation = {
      activityId: selectedTransfer._id,
      activityName: selectedTransfer.name,
      activityType: "transfer",
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
      <section
        id="transfer"
        className="py-20 bg-gradient-to-br from-emerald-50 to-sky-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black">Chargement des transferts...</p>
        </div>
      </section>
    );
  }

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
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Transfert Aéroport
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Service de transport fiable de l&apos;aéroport vers votre
            destination
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {transfers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-black">
                Aucun transfert disponible pour le moment.
              </p>
            </div>
          ) : (
            transfers.map((option) => (
              <div
                key={option._id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                {option.image && (
                  <div className="mb-4">
                    <img
                      src={urlFor(option.image)}
                      alt={option.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-black mb-3">
                  {option.name}
                </h3>
                <p className="text-black mb-2 line-clamp-2">
                  {truncateDescription(option.description)}
                </p>
                <button
                  onClick={() => onViewDetails(option)}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4"
                >
                  Voir plus →
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-black text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Jusqu&apos;à {option.capacity} pers.
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {option.price}€
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-black mb-2">Inclus :</h4>
                  <ul className="text-sm text-black space-y-1">
                    {option.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                    {option.features.length > 3 && (
                      <li className="text-emerald-600 text-xs italic">
                        +{option.features.length - 3} autres
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => onBookTransfer(option)}
                  className="w-full py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors duration-200"
                >
                  Réserver
                </button>
              </div>
            ))
          )}
        </div>

        {/* Destinations Populaires */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-black mb-6 text-center">
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
                <h4 className="font-semibold text-black">{destination.name}</h4>
                <div className="flex items-center justify-center text-black text-sm mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {destination.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal détails */}
      {isDetailsOpen && selectedTransfer && (
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
              {selectedTransfer.image && (
                <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
                  <img
                    src={urlFor(selectedTransfer.image)}
                    alt={selectedTransfer.name}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              <h2 className="text-4xl font-bold text-black mb-2">
                {selectedTransfer.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-6 pt-2">
                <div className="flex items-center text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-semibold">
                    Jusqu&apos;à {selectedTransfer.capacity} personnes
                  </span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  {selectedTransfer.price}€
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-6 mb-6 border border-emerald-100">
                <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
                  Description
                </h3>
                <p className="text-black whitespace-pre-line leading-relaxed text-lg">
                  {selectedTransfer.description}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6 border border-emerald-200 shadow-sm">
                <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></span>
                  Caractéristiques incluses
                </h3>
                <ul className="space-y-3">
                  {selectedTransfer.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-black">
                      <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onBookTransfer(selectedTransfer);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Réserver
                </button>
              </div>
            </div>

            {/* Avis */}
            <div className="border-t-2 border-emerald-200 pt-8">
              <Reviews
                activityId={selectedTransfer._id}
                activityType="transfer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal réservation */}
      {isBookingOpen && selectedTransfer && (
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
              Réserver : {selectedTransfer.name}
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
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
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

export default Transfer;
