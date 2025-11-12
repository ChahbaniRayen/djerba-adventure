"use client";

import { useAutoLogout } from "@/hooks/useAutoLogout";

/**
 * Composant qui gère la déconnexion automatique après 1 heure d'inactivité
 * À placer dans le layout principal pour qu'il soit actif sur toutes les pages
 */
export default function AutoLogout() {
  useAutoLogout();
  return null; // Ce composant ne rend rien
}
