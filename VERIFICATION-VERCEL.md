# ✅ Vérification du Déploiement Vercel

Ce document liste toutes les vérifications nécessaires pour que votre application fonctionne **totalement** (front + back) sur Vercel.

## 🔍 Checklist de Configuration

### 1. Variables d'Environnement (OBLIGATOIRES)

Allez dans **Vercel Dashboard → Votre Projet → Settings → Environment Variables** et ajoutez :

#### 🔐 Authentification NextAuth

```
NEXTAUTH_SECRET=votre-secret-aleatoire-32-caracteres
NEXTAUTH_URL=https://djerba-adventure.vercel.app
```

**⚠️ Important :**

- `NEXTAUTH_SECRET` : Générez avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : Doit être l'URL exacte de votre déploiement Vercel

#### 🗄️ MongoDB

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**⚠️ Important :**

- Utilisez une URI MongoDB Atlas (recommandé pour la production)
- Vérifiez que votre IP est autorisée dans MongoDB Atlas Network Access

#### 🔵 Google OAuth

```
GOOGLE_CLIENT_ID=votre-client-id-google
GOOGLE_CLIENT_SECRET=votre-client-secret-google
```

**⚠️ Important :**

- Ajoutez l'URL de callback dans Google Cloud Console :
  ```
  https://djerba-adventure.vercel.app/api/auth/callback/google
  ```

#### 📧 Configuration Email (Optionnel mais recommandé)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=votre-email@gmail.com
EMAIL_SERVER_PASSWORD=votre-mot-de-passe-application
EMAIL_FROM=noreply@djerba-adventures.com
```

**⚠️ Important :**

- Pour Gmail, utilisez un **mot de passe d'application** (pas votre mot de passe normal)
- Sans ces variables, les emails ne seront pas envoyés mais l'app fonctionnera

#### 🎨 Sanity CMS

```
NEXT_PUBLIC_SANITY_PROJECT_ID=votre-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

**⚠️ Important :**

- Les variables `NEXT_PUBLIC_*` sont accessibles côté client
- Vérifiez que votre dataset Sanity contient du contenu

---

## ✅ Vérifications Post-Déploiement

### 1. Test de l'Application

- [ ] Accéder à `https://djerba-adventure.vercel.app`
- [ ] Vérifier que la page d'accueil se charge
- [ ] Vérifier que les activités/tours/transferts s'affichent (depuis Sanity)

### 2. Test de l'Authentification

- [ ] Cliquer sur "Se connecter"
- [ ] Tester la connexion Google OAuth
- [ ] Vérifier que la redirection fonctionne après connexion
- [ ] Vérifier que la session persiste

### 3. Test des Routes API

- [ ] Tester `/api/activities` (doit retourner les activités)
- [ ] Tester `/api/tours` (doit retourner les tours)
- [ ] Tester `/api/transfers` (doit retourner les transferts)
- [ ] Tester `/api/book` (créer une réservation - nécessite authentification)

### 4. Test du Dashboard Admin

- [ ] Se connecter avec un compte admin
- [ ] Accéder à `/admin/dashboard`
- [ ] Vérifier que les statistiques s'affichent
- [ ] Vérifier que les réservations s'affichent

### 5. Test des Fonctionnalités

- [ ] Créer une réservation (nécessite connexion)
- [ ] Laisser un avis (nécessite connexion)
- [ ] Vérifier que les emails sont envoyés (si configuré)

---

## 🚨 Problèmes Courants

### ❌ Erreur "MONGO_URI is not defined"

**Solution :** Vérifiez que la variable `MONGO_URI` est bien ajoutée dans Vercel avec le bon nom.

### ❌ Erreur "OAuthAccountNotLinked"

**Solution :** Vérifiez que l'URL de callback Google inclut bien votre domaine Vercel.

### ❌ Erreur "NEXTAUTH_URL mismatch"

**Solution :** Assurez-vous que `NEXTAUTH_URL` correspond exactement à votre URL Vercel (avec `https://`).

### ❌ Les images Sanity ne s'affichent pas

**Solution :** Vérifiez que `NEXT_PUBLIC_SANITY_PROJECT_ID` et `NEXT_PUBLIC_SANITY_DATASET` sont correctement configurés.

### ❌ Les emails ne sont pas envoyés

**Solution :** Vérifiez la configuration email. Pour Gmail, utilisez un mot de passe d'application.

### ❌ Erreur 500 sur les routes API

**Solution :** Vérifiez les logs Vercel (Deployments → View Function Logs) pour voir l'erreur exacte.

---

## 📊 Architecture de l'Application

### Frontend (Next.js)

- ✅ Pages statiques et dynamiques
- ✅ Composants React
- ✅ Routing automatique
- ✅ **Fonctionne sur Vercel**

### Backend (Next.js API Routes)

- ✅ Routes API dans `/api/*`
- ✅ Authentification NextAuth
- ✅ Connexion MongoDB
- ✅ **Fonctionne sur Vercel** (Serverless Functions)

### Base de Données

- ✅ MongoDB (via Mongoose)
- ✅ Collections : `app_users`, `bookings`, `reviews`
- ⚠️ **Nécessite MongoDB Atlas** (recommandé pour la production)

### CMS

- ✅ Sanity CMS (hébergé par Sanity)
- ✅ Images hébergées sur Sanity CDN
- ✅ **Fonctionne indépendamment de Vercel**

---

## 🎯 Conclusion

**OUI, votre application fonctionnera totalement sur Vercel** si :

1. ✅ Toutes les variables d'environnement sont configurées
2. ✅ MongoDB Atlas est accessible depuis Vercel
3. ✅ Google OAuth est configuré avec l'URL Vercel
4. ✅ Sanity CMS est configuré et contient du contenu

**Points importants :**

- Next.js fonctionne nativement sur Vercel (front + back)
- Les routes API deviennent des Serverless Functions automatiquement
- MongoDB doit être accessible depuis Internet (MongoDB Atlas recommandé)
- Les variables `NEXT_PUBLIC_*` sont exposées côté client

---

## 🔗 Liens Utiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google Cloud Console](https://console.cloud.google.com)
- [Sanity Dashboard](https://www.sanity.io/manage)
