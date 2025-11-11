"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, Trash2 } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewsProps {
  activityId: string;
  activityType: "activity" | "tour" | "transfer";
}

export default function Reviews({ activityId, activityType }: ReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchReviews();
    checkAdmin();
  }, [activityId, activityType, session]);

  const checkAdmin = async () => {
    if (session?.user?.email) {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `/api/reviews?activityId=${activityId}&activityType=${activityType}`
      );
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setMessage("Vous devez être connecté pour laisser un avis");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          activityType,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Avis publié avec succès !");
        setComment("");
        setRating(5);
        setShowForm(false);
        // Rafraîchir la liste des avis
        await fetchReviews();
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (error) {
      setMessage("⚠️ Erreur lors de la soumission de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } else {
        alert("Erreur lors de la suppression de l'avis");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Erreur lors de la suppression de l'avis");
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <div className="text-center py-4 text-black">Chargement des avis...</div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-black mb-2 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6" />
            Avis ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-black mr-2">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-black opacity-20"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {session && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Laisser un avis
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-6 rounded-lg mb-6"
        >
          <h4 className="text-lg font-semibold mb-4 text-black">Votre avis</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Note
            </label>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-black opacity-20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Commentaire
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Partagez votre expérience..."
            />
          </div>
          {message && (
            <p
              className={`mb-4 text-sm ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Publier"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment("");
                setRating(5);
                setMessage("");
              }}
              className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!session && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <a href="/auth/signin" className="underline font-semibold">
              Connectez-vous
            </a>{" "}
            pour laisser un avis
          </p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-black text-center py-8">
            Aucun avis pour le moment. Soyez le premier à en laisser un !
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-lg p-6 relative"
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="absolute top-6 right-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors"
                  title="Supprimer cet avis"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-black opacity-20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-black">
                    {review.userName}
                  </span>
                </div>
                <span className="text-sm text-black">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-black">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
