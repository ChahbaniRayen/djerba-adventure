"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquare, Trash2, Send } from "lucide-react";

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!session) {
      setMessage("Vous devez être connecté pour laisser un avis");
      return;
    }

    if (!comment.trim()) {
      setMessage("❌ Veuillez écrire un commentaire");
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
    <div className="mt-4 sm:mt-8">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-2 flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          Avis ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-black mr-2">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
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

      {session && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="mb-3">
            <label className="block text-xs sm:text-sm font-medium text-black mb-2">
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
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      i < rating
                        ? "text-yellow-400 fill-current"
                        : "text-black opacity-20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && comment.trim()) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder="Écrivez votre commentaire..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-black focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleSubmit as any}
              disabled={submitting || !comment.trim()}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          {message && (
            <p
              className={`mt-2 text-xs sm:text-sm ${
                message.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {!session && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-blue-800 text-xs sm:text-sm">
            <a href="/auth/signin" className="underline font-semibold">
              Connectez-vous
            </a>{" "}
            pour laisser un avis
          </p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm sm:text-base text-black text-center py-6 sm:py-8">
            Aucun avis pour le moment. Soyez le premier à en laisser un !
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 relative"
            >
              {isAdmin && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="absolute top-3 right-3 sm:top-6 sm:right-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1.5 sm:p-2 transition-colors"
                  title="Supprimer cet avis"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-black opacity-20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-sm sm:text-base text-black">
                    {review.userName}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-black">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-sm sm:text-base text-black">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
