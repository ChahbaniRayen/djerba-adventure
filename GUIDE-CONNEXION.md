# Guide de Connexion

## Comment se connecter selon le type de compte

### 🔵 Compte créé avec Google

**Première connexion :**

1. Allez sur `/auth/signin`
2. Cliquez sur **"Continuer avec Google"**
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. Vous êtes connecté ! ✅

**Connexions suivantes :**

1. Allez sur `/auth/signin`
2. Cliquez sur **"Continuer avec Google"**
3. Google vous reconnaît automatiquement (si vous êtes déjà connecté à Google)
4. Vous êtes connecté ! ✅

**Note :** Google gère l'authentification, donc vous n'avez pas besoin de vous souvenir d'un mot de passe.

---

### 📧 Compte créé avec Email/Mot de passe

**Première connexion :**

1. Allez sur `/auth/signin`
2. Cliquez sur l'onglet **"Email/Mot de passe"**
3. Entrez votre email et mot de passe
4. Cliquez sur **"Se connecter"**
5. Vous êtes connecté ! ✅

**Connexions suivantes :**

1. Allez sur `/auth/signin`
2. Cliquez sur l'onglet **"Email/Mot de passe"**
3. Entrez votre email et mot de passe
4. Cliquez sur **"Se connecter"**
5. Vous êtes connecté ! ✅

---

### ✉️ Compte créé avec Magic Link (Email)

**Première connexion :**

1. Allez sur `/auth/signin`
2. Cliquez sur l'onglet **"Magic Link"**
3. Entrez votre email
4. Cliquez sur **"Envoyer le lien"**
5. Vérifiez votre boîte email
6. Cliquez sur le lien reçu
7. Vous êtes connecté ! ✅

**Connexions suivantes :**

1. Allez sur `/auth/signin`
2. Cliquez sur l'onglet **"Magic Link"**
3. Entrez votre email
4. Cliquez sur **"Envoyer le lien"**
5. Vérifiez votre boîte email
6. Cliquez sur le lien reçu
7. Vous êtes connecté ! ✅

---

## 🔗 Liaison de comptes

Si vous avez créé un compte avec Email/Mot de passe et que vous voulez aussi vous connecter avec Google :

1. Connectez-vous d'abord avec votre Email/Mot de passe
2. Ensuite, cliquez sur **"Continuer avec Google"**
3. Le système liera automatiquement votre compte Google à votre compte existant

**Note :** Grâce à l'adapter personnalisé, cette liaison fonctionne automatiquement sans conflit.

---

## ❓ Problèmes courants

### "OAuthAccountNotLinked" erreur

- **Solution :** Connectez-vous d'abord avec votre méthode d'origine (Email/Mot de passe)
- Ensuite, vous pourrez lier votre compte Google

### Mot de passe oublié

- Allez sur `/auth/reset-password`
- Entrez votre email
- Suivez les instructions dans l'email reçu

### Email non vérifié

- Vérifiez votre boîte email
- Cliquez sur le lien de vérification
- Ou demandez un nouveau lien sur la page de connexion
