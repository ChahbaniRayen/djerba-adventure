#!/bin/bash

# Token GitHub (à configurer dans les variables d'environnement)
TOKEN="${GITHUB_TOKEN}"
USERNAME="ChahbaniRayen"
REPO="djerba-adventure"

echo "📤 Configuration du remote avec le token..."
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/${REPO}.git

echo "📤 Poussage du code vers GitHub..."
if git push origin main; then
    echo "✅ Code poussé avec succès!"
    # Remettre l'URL normale
    git remote set-url origin https://github.com/${USERNAME}/${REPO}.git
    echo "✅ Remote remis à l'URL normale"
else
    echo "❌ Erreur lors du push"
    echo ""
    echo "Vérifiez que :"
    echo "1. Le token a les permissions 'repo' (toutes les cases)"
    echo "2. Le token n'a pas expiré"
    echo "3. Le dépôt existe sur GitHub"
    exit 1
fi

