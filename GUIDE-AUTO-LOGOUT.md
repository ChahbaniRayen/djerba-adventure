# Guide de Déconnexion Automatique

## 🔐 Mécanisme de Déconnexion Automatique

Le système déconnecte automatiquement les utilisateurs après **1 heure d'inactivité** pour des raisons de sécurité.

## ⚙️ Comment ça fonctionne

### 1. **Expiration de la Session JWT**

- La session JWT expire automatiquement après **1 heure** (3600 secondes)
- Configuré dans `src/lib/auth/config.ts` :
  ```typescript
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 heure
  },
  jwt: {
    maxAge: 60 * 60, // 1 heure
  }
  ```

### 2. **Détection d'Inactivité**

Le hook `useAutoLogout` détecte l'inactivité en surveillant :

- **Mouvements de souris** (`mousemove`, `mousedown`, `click`)
- **Touches du clavier** (`keypress`)
- **Défilement** (`scroll`)
- **Touches tactiles** (`touchstart`)

### 3. **Déconnexion Automatique**

- Si l'utilisateur est inactif pendant **1 heure**, il est automatiquement déconnecté
- Redirection vers `/auth/signin` après déconnexion

## 📋 Composants

### `useAutoLogout` Hook

- **Fichier** : `src/hooks/useAutoLogout.ts`
- **Fonction** : Détecte l'inactivité et déconnecte automatiquement
- **Utilisation** : Utilisé par le composant `AutoLogout`

### `AutoLogout` Component

- **Fichier** : `src/components/AutoLogout.tsx`
- **Fonction** : Wrapper qui utilise le hook `useAutoLogout`
- **Placement** : Intégré dans `src/app/layout.tsx` pour être actif sur toutes les pages

## 🔄 Vérification Périodique

Le système vérifie également la validité de la session toutes les **5 minutes** en appelant `/api/auth/session`. Si la session est expirée, l'utilisateur est déconnecté.

## ⏱️ Durées Configurées

- **Inactivité maximale** : 1 heure (3600 secondes)
- **Vérification de session** : Toutes les 5 minutes
- **Expiration JWT** : 1 heure

## 🛠️ Personnalisation

Pour modifier la durée d'inactivité, modifiez la constante dans `src/hooks/useAutoLogout.ts` :

```typescript
// Pour 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Pour 2 heures
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 heures
```

Et dans `src/lib/auth/config.ts` :

```typescript
session: {
  maxAge: 30 * 60, // 30 minutes en secondes
},
jwt: {
  maxAge: 30 * 60, // 30 minutes en secondes
}
```

## 🔒 Sécurité

- ✅ Déconnexion automatique après inactivité
- ✅ Expiration automatique du JWT
- ✅ Vérification périodique de la session
- ✅ Redirection sécurisée vers la page de connexion

## 📝 Notes

- L'inactivité est réinitialisée à chaque interaction utilisateur
- La déconnexion est silencieuse (pas de notification)
- L'utilisateur peut se reconnecter immédiatement après la déconnexion
- Le système fonctionne sur toutes les pages de l'application
