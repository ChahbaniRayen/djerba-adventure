#!/bin/bash
# Script pour pousser le code sur GitHub avec authentification

echo "🔐 Authentification GitHub"
echo ""
echo "Option 1 : Utiliser votre token (recommandé)"
echo "Option 2 : Utiliser SSH"
echo ""
read -p "Choisissez une option (1 ou 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "Entrez votre token GitHub:"
    read -s TOKEN
    echo ""
    
    # Configurer le remote avec le token
    git remote set-url origin https://ChahbaniRayen:${TOKEN}@github.com/ChahbaniRayen/djerba-adventure.git
    
    echo "📤 Poussage du code..."
    git push origin main
    
    # Remettre l'URL normale (sans token)
    git remote set-url origin https://github.com/ChahbaniRayen/djerba-adventure.git
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "Configuration SSH..."
    git remote set-url origin git@github.com:ChahbaniRayen/djerba-adventure.git
    echo "📤 Poussage du code..."
    git push origin main
else
    echo "Option invalide"
    exit 1
fi

