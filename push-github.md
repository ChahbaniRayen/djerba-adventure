# Solution pour git push

## Méthode 1 : Utiliser le token dans l'URL (temporaire)

```bash
# Remplacez VOTRE_TOKEN par votre token GitHub
git remote set-url origin https://ChahbaniRayen:VOTRE_TOKEN@github.com/ChahbaniRayen/djerba-adventure.git
git push origin main
# Remettez l'URL normale après
git remote set-url origin https://github.com/ChahbaniRayen/djerba-adventure.git
```

## Méthode 2 : Utiliser Git Credential Helper

```bash
# Configurez le credential helper
git config --global credential.helper store

# Puis poussez (Git vous demandera username et password)
git push origin main
# Username: ChahbaniRayen
# Password: [collez votre token GitHub]
```

## Méthode 3 : Utiliser SSH (recommandé pour la sécurité)

```bash
# 1. Générez une clé SSH (si vous n'en avez pas)
ssh-keygen -t ed25519 -C "votre-email@example.com"

# 2. Copiez la clé publique
cat ~/.ssh/id_ed25519.pub

# 3. Ajoutez-la sur GitHub :
#    https://github.com/settings/keys → "New SSH key"

# 4. Changez le remote en SSH
git remote set-url origin git@github.com:ChahbaniRayen/djerba-adventure.git

# 5. Poussez
git push origin main
```

## Vérification du token

Si vous obtenez toujours une erreur 403, vérifiez que :

- ✅ Le token a la permission "repo" (toutes les cases)
- ✅ Le token n'a pas expiré
- ✅ Le token n'a pas été révoqué
- ✅ Vous utilisez le bon username (ChahbaniRayen)

## Créer un nouveau token

1. Allez sur https://github.com/settings/tokens
2. Cliquez sur "Generate new token (classic)"
3. Nom : "djerba-adventure"
4. Expiration : choisissez une durée (90 jours recommandé)
5. Permissions : cochez **TOUTES** les cases sous "repo"
6. Cliquez sur "Generate token"
7. **COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir)
