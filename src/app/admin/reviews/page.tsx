"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Review {
  _id: string;
  activityName?: string;
  activityId: string;
  activityType: string;
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  approved: boolean;
  createdAt: string;
}

export default function ReviewsModeration() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
      fetchReviews();
    }
  }, [status, session, router, filter]);

  const fetchReviews = async () => {
    try {
      const approvedParam =
        filter === "all" ? "" : filter === "approved" ? "true" : "false";
      const url = `/api/reviews${
        approvedParam ? `?approved=${approvedParam}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

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
            Modération des Avis
          </h1>
          <p className="text-gray-600 mt-2">
            Approuvez ou supprimez les avis des clients
          </p>
        </div>

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
              Tous
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
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approuvés
            </button>
          </div>
        </div>

        {/* Liste des avis */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-lg shadow p-6 ${
                !review.approved ? "border-l-4 border-amber-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        review.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {review.approved ? "Approuvé" : "En attente"}
                    </span>
                  </div>

                  <p className="text-gray-900 mb-2">{review.comment}</p>

                  <div className="text-sm text-gray-500">
                    <p>
                      <strong>{review.userName}</strong> - {review.activityType}{" "}
                      ({review.activityId})
                    </p>
                    <p>
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {!review.approved && (
                    <button
                      onClick={() => updateReviewStatus(review._id, true)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approuver"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  {review.approved && (
                    <button
                      onClick={() => updateReviewStatus(review._id, false)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Désapprouver"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">Aucun avis à afficher</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
