# Janis Wedding — Web V1

Cette première version est une application web mobile pour gérer les invités et générer des invitations personnalisées.

## Fonctions
- Tableau de bord
- Ajout d'invités
- Recherche
- Génération automatique d'une invitation en image PNG
- QR code unique par invité
- Téléchargement et partage de l'image
- Scanner QR avec la caméra
- Enregistrement de la présence
- Sauvegarde locale dans le navigateur

## Lancer
Ouvrir `index.html` dans un navigateur moderne. Pour le scanner caméra et le partage, il est recommandé de publier le dossier sur HTTPS (GitHub Pages, Netlify ou Vercel).

## Important
La V1 utilise `localStorage` : les données restent sur le navigateur/appareil utilisé. Pour une vraie base de données accessible depuis plusieurs téléphones, la prochaine étape est de connecter Supabase.

## Publication GitHub Pages
1. Créer un dépôt GitHub.
2. Envoyer les fichiers de ce dossier.
3. Settings → Pages.
4. Source : Deploy from a branch.
5. Branch : `main`, dossier `/root`.
6. Enregistrer puis ouvrir l'URL fournie par GitHub.
