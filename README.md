# ConcertCutter — site officiel

Landing page et guide utilisateur de [ConcertCutter](https://github.com/LMontalbano/ConcertCutter), publiés sur GitHub Pages.

## Pages

- `/` : présentation courte, captures réelles et téléchargement.
- `/guide/` : démarrage, SmartScreen, édition, raccourcis, export et dépannage.
- `404.html` : page d’erreur du site, servie par GitHub Pages pour toute autre adresse.

Le site reste statique. Tailwind CSS est compilé avant le déploiement : aucun runtime Tailwind n’est chargé dans le navigateur.

Les pages restent lisibles sans JavaScript : la table des raccourcis est écrite dans le HTML et les panneaux repliés s’affichent tant que `js` n’est pas posé sur `<html>`.

## Version affichée

`site.config.json` est la seule source de la version et de la taille montrées sur les pages ; `npm run build` remplace les jetons `__APP_VERSION__` et `__DOWNLOAD_SIZE__` et échoue si l’un d’eux subsiste. À chaque release de ConcertCutter, mettre ce fichier à jour :

```json
{
  "appVersion": "3.0",
  "downloadSize": "28,1 Mo",
  "basePath": "/ConcertCutterWebSite"
}
```

Ces valeurs ne servent que de secours : quand l’API GitHub répond, la version et la taille réelles de la release les remplacent dans le navigateur.

## Développement

```powershell
npm ci
npm run dev
```

Le serveur local écoute sur `http://127.0.0.1:4173/`.

## Contrôles

```powershell
npm run build
npm run validate
npm test
npm run lighthouse
```

- `validate` contrôle les pages produites, leurs métadonnées et leur HTML.
- `test` vérifie les largeurs 320, 390, 768, 1024 et 1280 px, le clavier, les URL de téléchargement, le contraste de l’anneau de focus, le rendu sans JavaScript, la page 404 et axe.
- `lighthouse` contrôle les objectifs Performance, Accessibilité, Bonnes pratiques et SEO.

## Déploiement GitHub Pages

Le workflow `.github/workflows/pages.yml` compile le site, valide l’artefact `dist/`, exécute la suite Playwright, puis publie avec GitHub Pages. Un test en échec bloque le déploiement et le rapport est joint à l’exécution. Dans **Settings → Pages**, sélectionner **GitHub Actions** comme source.

Pour activer la mesure d’audience sans cookies, créer la variable de dépôt `GOATCOUNTER_CODE`. Sans cette variable, aucun script GoatCounter n’est chargé.

## Contrat de release

Chaque release de ConcertCutter doit publier :

- `ConcertCutter.exe` ;
- `SHA256SUMS.txt` contenant l’empreinte SHA-256 correspondante.

Les boutons du site utilisent l’URL stable :

```text
https://github.com/LMontalbano/ConcertCutter/releases/latest/download/ConcertCutter.exe
```

L’API GitHub améliore facultativement la version et la taille affichées. Si elle est indisponible ou limitée, les boutons et les informations de secours restent utilisables.
