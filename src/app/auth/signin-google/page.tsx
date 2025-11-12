"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

/**
 * Page de redirection pour la connexion Google
 * Le cleanup est maintenant géré de manière ciblée dans l'adapter personnalisé
 * Plus besoin de nettoyer agressivement toutes les collections
 */
export default function SignInGooglePage() {
  useEffect(() => {
    // Rediriger directement vers Google OAuth
    // Le cleanup se fait automatiquement dans l'adapter si nécessaire
    signIn("google", { callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers Google...</p>
      </div>
    </div>
  );
}
