# Guide de Gestion des Rôles Admin

## 🔐 Protection des Routes Admin

Le système protège automatiquement :

- **Routes pages** : `/admin/*` → Redirige vers `/auth/signin` si non connecté, vers `/` si pas admin
- **Routes API** : `/api/admin/*` → Retourne 401/403 si non autorisé

## 👤 Comment Promouvoir un Utilisateur en Admin

### Méthode 1 : Via MongoDB (Recommandé)

1. **Connectez-vous à MongoDB** (via MongoDB Compass, CLI, ou votre interface)

2. **Trouvez l'utilisateur** dans la collection `users` :

   ```javascript
   db.users.findOne({ email: "admin@example.com" });
   ```

3. **Mettez à jour le rôle** :
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   );
   ```

### Méthode 2 : Via l'API (Nécessite un admin existant)

Créez une route API pour promouvoir un utilisateur (voir ci-dessous).

### Méthode 3 : Via le Code (Développement uniquement)

Dans un script temporaire ou directement dans le code :

```typescript
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

async function promoteToAdmin(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`✅ ${email} est maintenant admin`);
  } else {
    console.log(`❌ Utilisateur ${email} non trouvé`);
  }
}

// Utilisation
promoteToAdmin("admin@example.com");
```

## 🛡️ Vérification du Rôle

Le rôle est vérifié à plusieurs niveaux :

1. **Middleware** (`src/middleware.ts`) : Protège les routes `/admin/*` et `/api/admin/*`
2. **Pages** (`src/app/admin/dashboard/page.tsx`) : Vérifie côté client
3. **API Routes** : Vérifie dans chaque route API admin

## 📋 Structure du Rôle

Le rôle est stocké dans le modèle `User` :

- **Valeurs possibles** : `"user"` (par défaut) ou `"admin"`
- **Type** : `string` avec enum `["user", "admin"]`

## 🔍 Vérifier si un Utilisateur est Admin

### Côté Client (React)

```typescript
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const isAdmin = (session?.user as { role?: string })?.role === "admin";
```

### Côté Serveur (API Route)

```typescript
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

const session = await auth();
await connectDB();
const user = await User.findOne({ email: session?.user?.email });

if (!user || user.role !== "admin") {
  return NextResponse.json(
    { message: "Accès refusé. Admin uniquement." },
    { status: 403 }
  );
}
```

## 🚀 Créer le Premier Admin

1. **Créez un compte** normalement (via Google, Email/Password, ou Magic Link)

2. **Promouvez-le en admin** via MongoDB :

   ```javascript
   db.users.updateOne(
     { email: "votre-email@example.com" },
     { $set: { role: "admin" } }
   );
   ```

3. **Reconnectez-vous** pour que la session soit mise à jour

4. **Accédez au dashboard** : `/admin/dashboard`

## ⚠️ Sécurité

- **Ne jamais** exposer une route publique pour promouvoir des admins
- **Toujours** vérifier le rôle dans les API routes
- **Utiliser** le middleware pour protéger les routes admin
- **Limiter** le nombre d'admins au strict nécessaire

## 📝 Exemple : Route API pour Promouvoir un Utilisateur

```typescript
// src/app/api/admin/promote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const currentUser = await User.findOne({ email: session.user.email });

    // Seul un admin peut promouvoir un autre utilisateur
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Accès refusé. Admin uniquement." },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email requis" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    user.role = "admin";
    await user.save();

    return NextResponse.json({
      message: `${email} est maintenant admin`,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { message: "Erreur lors de la promotion" },
      { status: 500 }
    );
  }
}
```

## 🎯 Routes Protégées

- `/admin/dashboard` → Dashboard principal
- `/admin/reviews` → Modération des avis
- `/api/admin/stats` → Statistiques
- Toutes les routes `/api/admin/*`
