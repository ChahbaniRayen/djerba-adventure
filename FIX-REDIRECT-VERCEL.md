# 🔧 Fix Redirection Google OAuth sur Vercel

## Problème

Après la connexion Google, l'utilisateur reste bloqué sur une redirection ou obtient une erreur "not found" sur Vercel, alors que ça fonctionne localement.

## ✅ Solutions Appliquées

### 1. Callback `redirect` amélioré

J'ai ajouté un callback `redirect` dans la configuration NextAuth qui :

- Utilise `NEXTAUTH_URL` sur Vercel
- Gère correctement les URLs relatives et absolues
- Nettoie les trailing slashes
- Valide les URLs avant redirection

### 2. Configuration Vercel Requise

**Vérifiez que ces variables sont bien configurées sur Vercel :**

```
NEXTAUTH_URL=https://djerba-adventure.vercel.app
NEXTAUTH_SECRET=votre-secret
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
```

**⚠️ IMPORTANT :**

- `NEXTAUTH_URL` doit être **exactement** : `https://djerba-adventure.vercel.app`
- **PAS** de trailing slash (`/`) à la fin
- **PAS** de `http://`, utilisez `https://`

### 3. Configuration Google Cloud Console

Vérifiez que vous avez bien :

**Origines JavaScript autorisées :**

```
https://djerba-adventure.vercel.app
```

**URI de redirection autorisés :**

```
https://djerba-adventure.vercel.app/api/auth/callback/google
```

## 🔍 Debug

### Vérifier les logs Vercel

1. Allez dans **Vercel Dashboard → Deployments → Votre déploiement**
2. Cliquez sur **Functions**
3. Regardez les logs de `/api/auth/[...nextauth]`
4. Cherchez les erreurs de redirection

### Tester manuellement

1. Allez sur `https://djerba-adventure.vercel.app/auth/signin`
2. Cliquez sur "Continuer avec Google"
3. Après la connexion Google, vérifiez l'URL dans la barre d'adresse
4. Si vous voyez une erreur, notez l'URL exacte

### Vérifier NEXTAUTH_URL

Dans les logs Vercel, vous devriez voir :

```
[AUTH] Redirecting to: https://djerba-adventure.vercel.app/
```

Si vous voyez une URL différente ou `undefined`, c'est que `NEXTAUTH_URL` n'est pas correctement configuré.

## 🚨 Problèmes Courants

### ❌ Erreur "not found" après redirection Google

**Cause :** `NEXTAUTH_URL` mal configuré ou manquant
**Solution :** Vérifiez que `NEXTAUTH_URL=https://djerba-adventure.vercel.app` est bien défini sur Vercel

### ❌ Boucle de redirection infinie

**Cause :** URL de callback incorrecte dans Google Cloud Console
**Solution :** Vérifiez que l'URI de redirection est exactement : `https://djerba-adventure.vercel.app/api/auth/callback/google`

### ❌ Redirection vers localhost

**Cause :** `NEXTAUTH_URL` pointe vers localhost
**Solution :** Changez `NEXTAUTH_URL` sur Vercel pour pointer vers votre domaine Vercel

### ❌ Erreur "redirect_uri_mismatch"

**Cause :** L'URI de redirection dans Google Cloud Console ne correspond pas
**Solution :** Vérifiez que l'URI est exactement : `https://djerba-adventure.vercel.app/api/auth/callback/google`

## 📋 Checklist

- [ ] `NEXTAUTH_URL` configuré sur Vercel : `https://djerba-adventure.vercel.app`
- [ ] `NEXTAUTH_SECRET` configuré sur Vercel
- [ ] `GOOGLE_CLIENT_ID` configuré sur Vercel
- [ ] `GOOGLE_CLIENT_SECRET` configuré sur Vercel
- [ ] Origine JavaScript ajoutée dans Google Cloud Console
- [ ] URI de redirection ajouté dans Google Cloud Console
- [ ] Changements sauvegardés dans Google Cloud Console
- [ ] Redéploiement effectué sur Vercel
- [ ] Test de connexion effectué

## 🔄 Redéployer

Après avoir modifié les variables d'environnement sur Vercel :

1. Allez dans **Vercel Dashboard → Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **"Redeploy"**

Ou poussez un nouveau commit :

```bash
git add .
git commit -m "fix: Améliorer la redirection OAuth sur Vercel"
git push origin main
```

## 🎯 Test Final

1. Allez sur `https://djerba-adventure.vercel.app/auth/signin`
2. Cliquez sur "Continuer avec Google"
3. Connectez-vous avec votre compte Google
4. Vous devriez être redirigé vers `https://djerba-adventure.vercel.app/`
5. Vous devriez être connecté et voir votre session active

---

**Note :** Si le problème persiste après avoir suivi toutes ces étapes, vérifiez les logs Vercel pour voir l'erreur exacte.
