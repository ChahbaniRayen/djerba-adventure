# 🔧 Fix OAuth Redirect URI Mismatch

## Problème

Erreur `400: redirect_uri_mismatch` lors de la connexion Google OAuth sur Vercel.

## ✅ Solution Complète

### 1. Vérifier NEXTAUTH_URL sur Vercel

Dans **Vercel Dashboard → Settings → Environment Variables**, assurez-vous d'avoir :

```
NEXTAUTH_URL=https://djerba-adventure.vercel.app
```

**⚠️ IMPORTANT :**

- Pas de trailing slash (`/`) à la fin
- Utilisez `https://` (pas `http://`)
- URL exacte de votre déploiement Vercel

### 2. Configuration Google Cloud Console

Allez dans **Google Cloud Console → APIs & Services → Credentials → Votre Client OAuth 2.0**

#### A. Origines JavaScript autorisées

Cliquez sur "Ajouter un URI" et ajoutez :

```
https://djerba-adventure.vercel.app
```

**⚠️ IMPORTANT :**

- Pas de trailing slash
- Pas de `/api/auth/callback/google`
- Juste le domaine de base

#### B. URI de redirection autorisés

Vous avez déjà :

```
https://djerba-adventure.vercel.app/api/auth/callback/google
```

**Vérifiez que :**

- ✅ Pas d'espace avant/après
- ✅ Pas de trailing slash à la fin
- ✅ Utilisez exactement cette URL (copier-coller pour éviter les erreurs de frappe)

### 3. Redéployer sur Vercel

Après avoir modifié les variables d'environnement sur Vercel :

1. Allez dans **Vercel Dashboard → Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **"Redeploy"**

### 4. Attendre la propagation Google

Google mentionne que les changements peuvent prendre **5 minutes à quelques heures** pour être appliqués.

**Solution rapide :**

- Attendez 5-10 minutes après avoir sauvegardé dans Google Cloud Console
- Essayez de vous reconnecter

### 5. Vérification finale

Testez la connexion :

1. Allez sur `https://djerba-adventure.vercel.app`
2. Cliquez sur "Se connecter"
3. Cliquez sur "Continuer avec Google"
4. Vérifiez que la redirection fonctionne

## 🔍 Debug

Si le problème persiste, vérifiez dans les logs Vercel :

1. **Vercel Dashboard → Deployments → Votre déploiement → Functions**
2. Regardez les logs de `/api/auth/[...nextauth]`
3. Cherchez l'URL de callback utilisée

L'URL devrait être exactement :

```
https://djerba-adventure.vercel.app/api/auth/callback/google
```

## 📋 Checklist Complète

- [ ] `NEXTAUTH_URL` configuré sur Vercel : `https://djerba-adventure.vercel.app`
- [ ] Origine JavaScript ajoutée : `https://djerba-adventure.vercel.app`
- [ ] URI de redirection ajouté : `https://djerba-adventure.vercel.app/api/auth/callback/google`
- [ ] Changements sauvegardés dans Google Cloud Console
- [ ] Redéploiement effectué sur Vercel
- [ ] Attente de 5-10 minutes pour la propagation Google
- [ ] Test de connexion effectué

## 🚨 Erreurs Courantes

### ❌ URL avec trailing slash

```
https://djerba-adventure.vercel.app/  ← MAUVAIS
https://djerba-adventure.vercel.app   ← BON
```

### ❌ URL de callback incorrecte

```
https://djerba-adventure.vercel.app/api/auth/callback/google/  ← MAUVAIS (trailing slash)
https://djerba-adventure.vercel.app/api/auth/callback/google   ← BON
```

### ❌ NEXTAUTH_URL manquant ou incorrect

```
NEXTAUTH_URL=http://djerba-adventure.vercel.app  ← MAUVAIS (http au lieu de https)
NEXTAUTH_URL=https://djerba-adventure.vercel.app/ ← MAUVAIS (trailing slash)
NEXTAUTH_URL=https://djerba-adventure.vercel.app   ← BON
```
