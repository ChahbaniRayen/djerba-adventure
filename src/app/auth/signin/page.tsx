"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Send } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "magic">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (searchParams?.get("verified") === "true") {
      setEmailVerified(true);
      setTimeout(() => setEmailVerified(false), 5000);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Vérifier d'abord si l'email est vérifié
      const checkRes = await fetch("/api/auth/check-email-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();

      if (checkRes.ok && !checkData.verified) {
        setError(
          "Votre email n'a pas été vérifié. Veuillez vérifier votre boîte mail et cliquer sur le lien de vérification. Si vous n'avez pas reçu l'email, vous pouvez demander un nouveau lien ci-dessous."
        );
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage("Veuillez d'abord entrer votre email");
      return;
    }

    setResendingEmail(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage("✅ Un nouvel email de vérification a été envoyé");
      } else {
        setResendMessage(data.message || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setResendMessage("Erreur lors de l'envoi de l'email");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("email", {
        email: magicEmail,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Erreur lors de l'envoi du lien. Veuillez réessayer.");
        setLoading(false);
      } else {
        setMagicSent(true);
        setLoading(false);
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Connectez-vous pour réserver et laisser des avis
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {searchParams?.get("error") === "OAuthAccountNotLinked" && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
            <p className="font-semibold mb-2">Compte existant détecté</p>
            <p className="mb-2">
              Un compte existe déjà avec cet email avec une autre méthode de
              connexion (email/mot de passe).
            </p>
            <p>
              <strong>Solution :</strong> Connectez-vous avec votre email et mot
              de passe ci-dessus pour accéder à votre compte.
            </p>
          </div>
        )}

        {emailVerified && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✅ Email vérifié avec succès ! Vous pouvez maintenant vous
            connecter.
          </div>
        )}

        {magicSent && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            ✅ Un lien de connexion a été envoyé à {magicEmail}. Vérifiez votre
            boîte mail.
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => {
              setMode("signin");
              setError("");
              setMagicSent(false);
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email / Mot de passe
          </button>
          <button
            onClick={() => {
              setMode("magic");
              setError("");
              setMagicSent(false);
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === "magic"
                ? "text-sky-600 border-b-2 border-sky-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Lien magique
          </button>
        </div>

        {/* Formulaire Email/Password */}
        {mode === "signin" && (
          <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="/auth/reset-password"
                className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
              >
                Mot de passe oublié ?
              </a>
              {error && error.includes("n'a pas été vérifié") && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="text-sm text-sky-600 hover:text-sky-700 hover:underline disabled:opacity-50"
                >
                  {resendingEmail ? "Envoi..." : "Renvoyer l'email"}
                </button>
              )}
            </div>
            {resendMessage && (
              <p
                className={`text-xs ${
                  resendMessage.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {resendMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}

        {/* Formulaire Magic Link */}
        {mode === "magic" && (
          <form onSubmit={handleMagicLink} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base text-gray-900 bg-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || magicSent}
              className="w-full bg-sky-500 text-white py-2.5 rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                "Envoi..."
              ) : magicSent ? (
                <>
                  <Send className="h-4 w-4" />
                  Lien envoyé
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer le lien de connexion
                </>
              )}
            </button>
          </form>
        )}

        {/* Séparateur */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Bouton Google */}
        <button
          onClick={() => {
            // Rediriger vers la page qui nettoie avant de se connecter
            window.location.href = "/auth/signin-google";
          }}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <a
              href="/auth/signup"
              className="text-sky-600 hover:text-sky-700 font-semibold hover:underline"
            >
              Créer un compte
            </a>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          En vous connectant, vous acceptez nos{" "}
          <a href="#" className="text-sky-600 hover:underline">
            conditions d&apos;utilisation
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
