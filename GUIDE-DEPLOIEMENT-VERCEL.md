# Guide de déploiement sur Vercel

Ce guide vous explique comment déployer votre projet Djerba Adventures sur Vercel.

## Prérequis

1. Un compte GitHub, GitLab ou Bitbucket
2. Un compte Vercel (gratuit) : https://vercel.com
3. Votre projet doit être poussé sur un dépôt Git

## Étape 1 : Préparer le projet

### 1.1 Vérifier les fichiers nécessaires

Assurez-vous que votre projet contient :

- ✅ `package.json` avec les scripts de build
- ✅ `next.config.ts` ou `next.config.js`
- ✅ `.gitignore` (pour ne pas commiter les fichiers sensibles)

### 1.2 Vérifier le build localement

```bash
npm run build
```

Si le build fonctionne localement, il fonctionnera sur Vercel.

## Étape 2 : Pousser le code sur Git

### 2.1 Initialiser Git (si pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Créer un dépôt sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau dépôt (par exemple : `djerba-adventure`)
3. Ne cochez **PAS** "Initialize with README"

### 2.3 Pousser le code

```bash
git remote add origin https://github.com/VOTRE-USERNAME/djerba-adventure.git
git branch -M main
git push -u origin main
```

## Étape 3 : Déployer sur Vercel

### 3.1 Créer un compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub/GitLab/Bitbucket

### 3.2 Importer le projet

1. Dans le dashboard Vercel, cliquez sur "Add New..." → "Project"
2. Sélectionnez votre dépôt `djerba-adventure`
3. Vercel détectera automatiquement que c'est un projet Next.js

### 3.3 Configuration du projet

Vercel détectera automatiquement :

- **Framework Preset** : Next.js
- **Build Command** : `npm run build` (ou `next build`)
- **Output Directory** : `.next`
- **Install Command** : `npm install`

Vous pouvez laisser les valeurs par défaut.

### 3.4 Variables d'environnement

C'est **CRUCIAL** ! Ajoutez toutes vos variables d'environnement dans Vercel :

1. Dans la section "Environment Variables", ajoutez :

#### Variables MongoDB

```
MONGODB_URI=votre-uri-mongodb-atlas
```

#### Variables NextAuth

```
NEXTAUTH_URL=https://votre-projet.vercel.app
NEXTAUTH_SECRET=votre-secret-nextauth
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
```

#### Variables Sanity

```
NEXT_PUBLIC_SANITY_PROJECT_ID=votre-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=votre-api-token
```

#### Variables Email (SMTP)

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=votre-email@gmail.com
EMAIL_SERVER_PASSWORD=votre-mot-de-passe-application
EMAIL_FROM="Djerba Adventures <votre-email@gmail.com>"
```

**Important** :

- Cliquez sur les 3 environnements : Production, Preview, Development
- Ne commitez **JAMAIS** ces variables dans Git !

### 3.5 Déployer

1. Cliquez sur "Deploy"
2. Attendez 2-3 minutes que le build se termine
3. Votre site sera disponible à : `https://votre-projet.vercel.app`

## Étape 4 : Configuration post-déploiement

### 4.1 Mettre à jour NEXTAUTH_URL

Après le premier déploiement, mettez à jour `NEXTAUTH_URL` dans Vercel avec l'URL réelle :

```
NEXTAUTH_URL=https://votre-projet.vercel.app
```

### 4.2 Mettre à jour Google OAuth

1. Allez sur https://console.cloud.google.com
2. Ouvrez votre projet OAuth
3. Dans "Authorized redirect URIs", ajoutez :
   ```
   https://votre-projet.vercel.app/api/auth/callback/google
   ```

### 4.3 Vérifier MongoDB Atlas

Assurez-vous que votre cluster MongoDB Atlas autorise les connexions depuis n'importe quelle IP :

1. Allez sur MongoDB Atlas
2. Network Access → Add IP Address → `0.0.0.0/0` (Allow access from anywhere)

### 4.4 Vérifier Sanity

Vérifiez que votre dataset Sanity est en mode "public" ou que les tokens API sont correctement configurés.

## Étape 5 : Déploiements automatiques

Vercel déploie automatiquement :

- ✅ À chaque push sur `main` → Production
- ✅ À chaque pull request → Preview (URL temporaire)

## Commandes utiles

### Installer Vercel CLI (optionnel)

```bash
npm i -g vercel
```

### Déployer depuis la ligne de commande

```bash
vercel
```

### Voir les logs

```bash
vercel logs
```

Ou dans le dashboard Vercel : Project → Deployments → Cliquez sur un déploiement → "View Function Logs"

## Dépannage

### Erreur : "Module not found"

- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez que `node_modules` n'est pas dans `.gitignore` (il ne devrait pas l'être)

### Erreur : "Environment variable not found"

- Vérifiez que toutes les variables sont ajoutées dans Vercel
- Redéployez après avoir ajouté des variables

### Erreur : "Build failed"

1. Testez le build localement : `npm run build`
2. Vérifiez les logs dans Vercel
3. Vérifiez que toutes les dépendances sont compatibles

### Erreur : "MongoDB connection failed"

- Vérifiez que `MONGODB_URI` est correct
- Vérifiez que MongoDB Atlas autorise les connexions depuis Vercel

### Erreur : "NextAuth error"

- Vérifiez que `NEXTAUTH_URL` correspond à l'URL Vercel
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que les redirect URIs Google sont corrects

## Optimisations

### Domaine personnalisé

1. Dans Vercel : Project → Settings → Domains
2. Ajoutez votre domaine
3. Suivez les instructions DNS

### Variables d'environnement par environnement

Vous pouvez définir des variables différentes pour :

- **Production** : Variables pour la production
- **Preview** : Variables pour les previews (branches)
- **Development** : Variables pour le développement local

## Sécurité

⚠️ **Important** :

- Ne commitez **JAMAIS** `.env.local` ou `.env`
- Utilisez toujours les variables d'environnement Vercel
- Régénérez `NEXTAUTH_SECRET` pour la production
- Utilisez des mots de passe d'application pour Gmail (pas votre mot de passe normal)

## Support

- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Support Vercel : https://vercel.com/support

## Checklist de déploiement

- [ ] Code poussé sur GitHub/GitLab/Bitbucket
- [ ] Build local fonctionne (`npm run build`)
- [ ] Projet importé dans Vercel
- [ ] Toutes les variables d'environnement ajoutées
- [ ] `NEXTAUTH_URL` mis à jour avec l'URL Vercel
- [ ] Google OAuth redirect URI mis à jour
- [ ] MongoDB Atlas autorise les connexions
- [ ] Premier déploiement réussi
- [ ] Site accessible et fonctionnel
- [ ] Test de connexion Google
- [ ] Test de création de réservation
- [ ] Test d'envoi d'email
