"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || null;

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token de vérification manquant");
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/signin?verified=true");
        }, 3000);
      } else {
        setError(data.message || "Erreur lors de la vérification");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center animate-pulse">
              <Mail className="w-8 h-8 text-sky-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification en cours...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email vérifié avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Votre compte a été activé. Vous allez être redirigé vers la page de
            connexion...
          </p>
          <a
            href="/auth/signin"
            className="inline-block bg-sky-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
          >
            Se connecter maintenant
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur de vérification
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-y-3">
          <a
            href="/auth/signin"
            className="inline-block w-full bg-sky-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
          >
            Aller à la connexion
          </a>
          <a
            href="/auth/signup"
            className="inline-block w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Créer un nouveau compte
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
