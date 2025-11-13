"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Page de redirection pour la connexion Google
 * Le cleanup est maintenant géré de manière ciblée dans l'adapter personnalisé
 * Plus besoin de nettoyer agressivement toutes les collections
 */
export default function SignInGooglePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Rediriger directement vers Google OAuth avec gestion d'erreur
    const handleSignIn = async () => {
      try {
        // Avec redirect: true, signIn ne retourne rien (void)
        // La redirection se fait automatiquement
        await signIn("google", {
          callbackUrl: "/",
          redirect: true,
        });
      } catch (err) {
        console.error("Erreur lors de la connexion Google:", err);
        setError("Une erreur est survenue. Redirection...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      }
    };

    // Délai court pour éviter les problèmes de timing
    const timer = setTimeout(() => {
      handleSignIn();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers Google...</p>
        <p className="mt-2 text-sm text-gray-500">Veuillez patienter...</p>
      </div>
    </div>
  );
}
