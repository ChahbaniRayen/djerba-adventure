"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";

interface Booking {
  _id: string;
  activityName: string;
  activityType: string;
  date: string;
  time: string;
  participants: number;
  status: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  rejectedBookings: number;
  activitiesStats: Array<{
    activityName: string;
    count: number;
  }>;
  typeStats: Array<{
    type: string;
    count: number;
  }>;
  unverifiedAccounts?: number;
  totalUnverified?: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as { role?: string })?.role !== "admin"
    ) {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchBookings();
      fetchStats();
    }
  }, [status, session, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const cleanupUnverifiedAccounts = async () => {
    setCleaningUp(true);
    setCleanupMessage("");
    try {
      const res = await fetch("/api/auth/cleanup-unverified", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setCleanupMessage(`✅ ${data.deleted} compte(s) supprimé(s)`);
        fetchStats();
      } else {
        setCleanupMessage("❌ Erreur lors du nettoyage");
      }
    } catch (error) {
      setCleanupMessage("❌ Erreur lors du nettoyage");
    } finally {
      setCleaningUp(false);
      setTimeout(() => setCleanupMessage(""), 5000);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les réservations et consultez les statistiques
          </p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-sky-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.pendingBookings}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejetées</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejectedBookings}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Section Comptes non vérifiés */}
        {stats && (stats.totalUnverified || 0) > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Comptes non vérifiés
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.totalUnverified} compte(s) non vérifié(s) au total
                  {stats.unverifiedAccounts && stats.unverifiedAccounts > 0 && (
                    <span className="text-amber-600 font-semibold">
                      {" "}
                      ({stats.unverifiedAccounts} expiré(s) depuis plus de 7
                      jours)
                    </span>
                  )}
                </p>
              </div>
              {stats.unverifiedAccounts && stats.unverifiedAccounts > 0 && (
                <button
                  onClick={cleanupUnverifiedAccounts}
                  disabled={cleaningUp}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  {cleaningUp ? "Nettoyage..." : "Nettoyer les comptes expirés"}
                </button>
              )}
            </div>
            {cleanupMessage && (
              <p
                className={`text-sm ${
                  cleanupMessage.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {cleanupMessage}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Les comptes non vérifiés créés il y a plus de 7 jours peuvent être
              supprimés automatiquement.
            </p>
          </div>
        )}

        {/* Graphiques des activités les plus demandées */}
        {stats && stats.activitiesStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Activités les plus demandées
            </h2>
            <div className="space-y-3">
              {stats.activitiesStats.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{activity.activityName}</span>
                  <span className="font-semibold text-sky-600">
                    {activity.count} réservations
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "all"
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "confirmed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmées
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejetées
            </button>
          </div>
        </div>

        {/* Liste des réservations */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.activityName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.activityType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "Confirmée"
                          : booking.status === "rejected"
                            ? "Rejetée"
                            : "En attente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking._id, "rejected")
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
