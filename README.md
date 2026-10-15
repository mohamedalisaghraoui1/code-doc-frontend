# Code-doc: frontend

Angular 21 + PrimeNG interface (based on the Sakai-NG template) for the **code-doc** backend:
upload a zip of source code, browse a table of generated documentations, and download the PDF stored in MongoDB.

## Getting started

```bash
npm install
npm start        # http://localhost:4200
```

The backend (Spring Boot, port 8080), MongoDB and Ollama must be running.
In development, `proxy.conf.json` forwards `/api` to `http://localhost:8080` (no CORS configuration needed).
In production, serve the frontend behind the same domain as the API (reverse proxy) or add `@CrossOrigin` on the backend.

## Endpoints used

| Method | URL                              | Purpose                                 |
|--------|----------------------------------|-----------------------------------------|
| GET    | `/api/projects`                  | table data                              |
| POST   | `/api/projects/upload` (`file`)  | generation (synchronous, can be slow)   |
| GET    | `/api/projects/{id}/download`    | PDF download                            |

## Structure

```
src/app/pages/docgen/    page, HTTP service and model
src/app/pages/notfound/  404 page
src/app/layout/          Sakai layout (topbar, menu, theme)
src/assets/              layout styles
```

Sakai-NG template license: see `LICENSE.md`.
