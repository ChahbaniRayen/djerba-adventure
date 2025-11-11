# Djerba Adventure - Plateforme de Gestion Touristique

Plateforme complète et moderne de gestion touristique pour Djerba, permettant la réservation d'activités, de tours guidés et de transferts aéroport.

## 🚀 Fonctionnalités

### Pour les utilisateurs

- **Authentification sécurisée** : Connexion via Google, Apple ou email
- **Réservation d'activités** : Activités d'aventure, tours guidés et transferts
- **Système d'avis** : Laisser des avis sur les activités (après authentification)
- **Interface moderne** : Design responsive avec Tailwind CSS

### Pour les administrateurs

- **Dashboard complet** : Vue d'ensemble des réservations et statistiques
- **Gestion des réservations** : Confirmer ou rejeter les demandes
- **Envoi d'emails automatiques** : Confirmations et annulations
- **Modération des avis** : Approuver ou supprimer les avis
- **Statistiques** : Activités les plus demandées, suivi par type

### Gestion de contenu

- **Sanity CMS** : Gestion complète du contenu (activités, tours, transferts, images, descriptions)
- **Modification facile** : Pas besoin d'intervention technique pour modifier le contenu

## 🛠️ Technologies

- **Framework** : Next.js 15.5.0 (App Router)
- **React** : 19.1.0
- **TypeScript** : 5.x
- **Styling** : Tailwind CSS 4
- **Base de données** : MongoDB (via Mongoose)
- **Authentification** : NextAuth v5 (Google, Email)
- **CMS** : Sanity
- **Emails** : Nodemailer

## 📦 Installation

1. **Cloner le projet**

```bash
git clone <repository-url>
cd djerba-adventure
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine du projet :

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/djerba-adventure

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@djerba-adventures.com

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

4. **Configurer Sanity CMS**

- Créer un projet sur [sanity.io](https://www.sanity.io)
- Installer Sanity CLI : `npm install -g @sanity/cli`
- Initialiser le projet : `sanity init`
- Importer les schémas depuis `sanity/schema.ts`
- Configurer les variables d'environnement Sanity

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔐 Configuration de l'authentification

### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un nouveau projet
3. Activer l'API Google+
4. Créer des identifiants OAuth 2.0
5. Ajouter l'URL de redirection : `http://localhost:3000/api/auth/callback/google`
6. Copier le Client ID et Secret dans `.env.local`

### Email Provider

Configurer un serveur SMTP (Gmail, SendGrid, etc.) dans les variables d'environnement.

## 👤 Créer un utilisateur admin

Pour créer un utilisateur admin, connectez-vous d'abord avec un compte normal, puis dans MongoDB :

```javascript
db.users.updateOne(
  { email: "votre-email@example.com" },
  { $set: { role: "admin" } }
);
```

## 📁 Structure du projet

```
djerba-adventure/
├── src/
│   ├── app/
│   │   ├── api/              # Routes API
│   │   │   ├── auth/         # NextAuth
│   │   │   ├── reservations/ # Gestion des réservations
│   │   │   ├── reviews/      # Gestion des avis
│   │   │   └── admin/        # Dashboard admin
│   │   ├── admin/            # Pages admin
│   │   │   ├── dashboard/   # Dashboard principal
│   │   │   └── reviews/     # Modération des avis
│   │   └── auth/            # Pages d'authentification
│   ├── components/          # Composants React
│   ├── lib/
│   │   ├── auth/           # Configuration NextAuth
│   │   ├── models/         # Modèles MongoDB
│   │   ├── sanity/         # Configuration Sanity CMS
│   │   └── email.ts        # Configuration emails
│   └── shared/             # Composants partagés
├── sanity/                # Schémas Sanity
└── public/                # Fichiers statiques
```

## 🎨 Personnalisation

### Modifier le contenu

Tout le contenu (activités, tours, transferts) est géré via Sanity CMS. Connectez-vous à votre studio Sanity pour modifier le contenu sans toucher au code.

### Modifier les styles

Les styles sont gérés avec Tailwind CSS. Modifiez les classes dans les composants ou personnalisez la configuration dans `tailwind.config.js`.

## 📧 Configuration des emails

Le système envoie automatiquement des emails pour :

- Confirmation de réservation
- Rejet de réservation

Assurez-vous que les variables d'environnement email sont correctement configurées.

## 🚢 Déploiement

### Vercel (recommandé)

1. Connecter votre repository GitHub à Vercel
2. Ajouter les variables d'environnement
3. Déployer

### Autres plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js (Netlify, Railway, etc.).

## 📝 Notes importantes

- **Pas de paiement en ligne** : Le système gère uniquement les demandes de réservation
- **Modération des avis** : Tous les avis nécessitent une approbation admin
- **Authentification requise** : Les utilisateurs doivent être connectés pour réserver ou laisser un avis

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.
