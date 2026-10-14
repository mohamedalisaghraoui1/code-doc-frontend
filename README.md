# Code-doc : frontend

Interface Angular 21 + PrimeNG (base : template Sakai-NG) pour le backend **code-doc** :
envoi d'un zip de code, tableau des documentations générées, téléchargement du PDF stocké dans MongoDB.

## Démarrage

```bash
npm install
npm start        # http://localhost:4200
```

Le backend (Spring Boot, port 8080), MongoDB et Ollama doivent tourner.
En développement, `proxy.conf.json` redirige `/api` vers `http://localhost:8080` (pas de CORS à configurer).
En production, servez le frontend derrière le même domaine que l'API (reverse proxy) ou ajoutez un `@CrossOrigin` côté backend.

## Endpoints utilisés

| Méthode | URL                              | Usage                                  |
|---------|----------------------------------|----------------------------------------|
| GET     | `/api/projects`                  | liste du tableau                       |
| POST    | `/api/projects/upload` (`file`)  | génération (synchrone, peut être long) |
| GET     | `/api/projects/{id}/download`    | téléchargement du PDF                  |

## Structure

```
src/app/pages/docgen/    page, service HTTP et modèle
src/app/pages/notfound/  page 404
src/app/layout/          layout Sakai (topbar, menu, thème)
src/assets/              styles du layout
```

Licence du template Sakai-NG : voir `LICENSE.md`.
