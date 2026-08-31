# ConcertCutter — Site Web Officiel

Site vitrine et documentation utilisateur pour l'application **[ConcertCutter](https://github.com/LMontalbano/ConcertCutter)**.

Ce site a été conçu pour permettre aux utilisateurs non-développeurs de :
1. **Télécharger facilement** l'application sous Windows sans avoir à naviguer dans les Releases GitHub.
2. **Comprendre et débloquer sereinement** l'avertissement Windows SmartScreen au premier lancement grâce à un simulateur interactif.
3. **Consulter la documentation utilisateur complète** (les 3 gestes clés, retouche à la souris, recherche instantanée de raccourcis, export vidéo avec diaporama YouTube).

---

## 🎨 Charte Graphique & Conception

- **Palette Studio Sombre** : Fond sombre (`#0e1116`), Accents Bleu Cyan (`#22b8cf`) pour les morceaux conservés et Orange Vif (`#ff9248`) pour les découpes et blancs.
- **Typographies** : *Instrument Sans* & *JetBrains Mono*.
- **Architecture Statique Autonome** : 100% sans étape de build, exécutable immédiatement en ouvrant `index.html` dans un navigateur ou déployable sur GitHub Pages.

---

## 🚀 Déploiement sur GitHub Pages

1. Rendez-vous dans les paramètres de votre dépôt GitHub (`Settings` > `Pages`).
2. Sous **Build and deployment** :
   - **Source** : `Deploy from a branch`
   - **Branch** : `main` / `root` (dossier `/`)
3. Cliquez sur **Save**. Le site est en ligne en quelques secondes !

---

## 📁 Arborescence du projet

```
ConcertCutterWebSite/
├── index.html                 # Page d'accueil et documentation complète
├── css/
│   └── styles.css             # Styles personnalisés, glassmorphism, animations
├── js/
│   ├── app.js                 # Recherche instantanée de raccourcis, FAQ, waveform canvas
│   ├── github-release.js      # Récupération dynamique de la release & stats GitHub
│   └── smartscreen-modal.js   # Simulateur interactif de l'alerte Windows SmartScreen
├── assets/                    # Icônes et logos officiels ConcertCutter
└── fonts/                     # Polices Instrument Sans et JetBrains Mono (offline ready)
```
