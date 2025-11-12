"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Hook pour déconnexion automatique après 1 heure d'inactivité
export function useAutoLogout() {
  const { data: session } = useSession();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Durée d'inactivité avant déconnexion (1 heure = 3600000 ms)
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 heure en millisecondes

  const resetTimer = () => {
    // Réinitialiser le timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si l'utilisateur est connecté, démarrer un nouveau timer
    if (session) {
      lastActivityRef.current = Date.now();

      timeoutRef.current = setTimeout(() => {
        // Vérifier si l'utilisateur est toujours inactif
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;

        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          // Déconnexion automatique
          signOut({
            callbackUrl: "/auth/signin",
            redirect: true,
          });
        }
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    if (!session) {
      // Si l'utilisateur n'est pas connecté, nettoyer le timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Événements qui indiquent une activité utilisateur
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Fonction pour réinitialiser le timer lors d'une activité
    const handleActivity = () => {
      resetTimer();
    };

    // Ajouter les écouteurs d'événements
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Démarrer le timer initial
    resetTimer();

    // Nettoyer les écouteurs et le timer lors du démontage
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session]);

  // Vérifier périodiquement si la session a expiré (toutes les 5 minutes)
  useEffect(() => {
    if (!session) return;

    const checkSessionExpiry = setInterval(
      async () => {
        try {
          // Vérifier si la session est toujours valide en appelant l'API
          const response = await fetch("/api/auth/session");
          const data = await response.json();

          // Si la session n'existe plus ou est expirée, déconnecter
          if (!data || !data.user) {
            signOut({ callbackUrl: "/auth/signin", redirect: true });
          }
        } catch (error) {
          console.error("Error checking session:", error);
          // En cas d'erreur, déconnecter par sécurité
          signOut({ callbackUrl: "/auth/signin", redirect: true });
        }
      },
      5 * 60 * 1000
    ); // Vérifier toutes les 5 minutes

    return () => clearInterval(checkSessionExpiry);
  }, [session]);
}
