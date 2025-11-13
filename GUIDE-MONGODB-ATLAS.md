# 🗄️ Guide Configuration MongoDB Atlas pour Vercel

## ⚠️ PROBLÈME CRITIQUE

**Vous NE POUVEZ PAS utiliser `mongodb://localhost:27017` sur Vercel !**

Vercel est un service cloud qui ne peut pas accéder à votre ordinateur local. Vous **DEVEZ** utiliser **MongoDB Atlas** (MongoDB cloud) pour la production.

---

## 🚀 Étapes pour Configurer MongoDB Atlas

### 1. Créer un Compte MongoDB Atlas (Gratuit)

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Cliquez sur **"Try Free"** ou **"Sign Up"**
3. Créez un compte (gratuit)

### 2. Créer un Cluster (Gratuit)

1. Une fois connecté, cliquez sur **"Build a Database"**
2. Choisissez **"M0 FREE"** (gratuit pour toujours)
3. Choisissez un **Cloud Provider** et une **Région** (recommandé : AWS, région proche de vous)
4. Cliquez sur **"Create"**
5. Attendez 3-5 minutes que le cluster soit créé

### 3. Créer un Utilisateur de Base de Données

1. Dans **"Database Access"** (menu de gauche)
2. Cliquez sur **"Add New Database User"**
3. Choisissez **"Password"** comme méthode d'authentification
4. Entrez un **Username** et un **Password** (notez-les bien !)
5. Pour les **Privileges**, choisissez **"Atlas admin"** ou **"Read and write to any database"**
6. Cliquez sur **"Add User"**

### 4. Autoriser l'Accès depuis Vercel

1. Dans **"Network Access"** (menu de gauche)
2. Cliquez sur **"Add IP Address"**
3. Pour Vercel, vous avez deux options :

   **Option A : Autoriser toutes les IPs (Recommandé pour Vercel)**
   - Cliquez sur **"Allow Access from Anywhere"**
   - Cela ajoute `0.0.0.0/0` (toutes les IPs)
   - ⚠️ C'est sécurisé car vous avez un mot de passe fort

   **Option B : Autoriser uniquement les IPs Vercel**
   - Vercel utilise des IPs dynamiques, donc cette option est moins pratique

4. Cliquez sur **"Confirm"**

### 5. Obtenir l'URI de Connexion

1. Retournez dans **"Database"** (menu de gauche)
2. Cliquez sur **"Connect"** sur votre cluster
3. Choisissez **"Connect your application"**
4. Sélectionnez **"Node.js"** comme driver
5. Copiez l'URI qui ressemble à :
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Remplacer les Placeholders

Remplacez dans l'URI :

- `<username>` par votre nom d'utilisateur MongoDB
- `<password>` par votre mot de passe MongoDB

**Exemple :**

```
mongodb+srv://monuser:monmotdepasse123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

### 7. Ajouter le Nom de la Base de Données

Ajoutez le nom de votre base de données avant le `?` :

```
mongodb+srv://monuser:monmotdepasse123@cluster0.abc123.mongodb.net/djerba-adventure?retryWrites=true&w=majority
```

---

## 🔧 Configuration sur Vercel

### 1. Ajouter la Variable d'Environnement

1. Allez dans **Vercel Dashboard → Votre Projet → Settings → Environment Variables**
2. Cliquez sur **"Add New"**
3. Ajoutez :
   - **Key :** `MONGO_URI`
   - **Value :** Votre URI MongoDB Atlas complète
   - **Environment :** Production, Preview, Development (cochez toutes les cases)
4. Cliquez sur **"Save"**

### 2. Redéployer

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **"Redeploy"**

---

## ✅ Vérification

### Test Local (Optionnel)

Vous pouvez tester la connexion localement en ajoutant l'URI dans votre `.env.local` :

```env
MONGO_URI=mongodb+srv://monuser:monmotdepasse123@cluster0.abc123.mongodb.net/djerba-adventure?retryWrites=true&w=majority
```

Puis testez :

```bash
npm run dev
```

### Test sur Vercel

1. Allez sur votre site Vercel
2. Essayez de vous connecter avec Google
3. Vérifiez les logs Vercel pour voir si la connexion MongoDB fonctionne

---

## 🚨 Problèmes Courants

### ❌ Erreur "MongoServerError: bad auth"

**Cause :** Mauvais username ou password dans l'URI
**Solution :** Vérifiez que vous avez bien remplacé `<username>` et `<password>`

### ❌ Erreur "MongoServerError: IP not whitelisted"

**Cause :** Votre IP n'est pas autorisée dans Network Access
**Solution :** Ajoutez `0.0.0.0/0` dans Network Access (ou votre IP spécifique)

### ❌ Erreur "MongoNetworkError: connection timeout"

**Cause :** Problème de réseau ou cluster non démarré
**Solution :** Vérifiez que votre cluster est bien démarré dans MongoDB Atlas

### ❌ Erreur "MongoParseError: Invalid connection string"

**Cause :** URI mal formatée
**Solution :** Vérifiez que l'URI est bien formatée et que les caractères spéciaux dans le mot de passe sont encodés (ex: `@` devient `%40`)

---

## 📋 Checklist

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster M0 FREE créé
- [ ] Utilisateur de base de données créé
- [ ] IP autorisée (0.0.0.0/0 pour Vercel)
- [ ] URI de connexion obtenue
- [ ] Username et password remplacés dans l'URI
- [ ] Nom de base de données ajouté à l'URI
- [ ] Variable `MONGO_URI` ajoutée sur Vercel
- [ ] Redéploiement effectué
- [ ] Test de connexion réussi

---

## 💡 Astuce : Encoder les Caractères Spéciaux

Si votre mot de passe contient des caractères spéciaux (`@`, `#`, `%`, etc.), vous devez les encoder :

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Exemple :**
Mot de passe : `Mon@Pass#123`
URI : `mongodb+srv://user:Mon%40Pass%23123@cluster0.abc123.mongodb.net/...`

---

## 🔗 Liens Utiles

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Important :** Une fois MongoDB Atlas configuré, votre application fonctionnera correctement sur Vercel ! 🎉
