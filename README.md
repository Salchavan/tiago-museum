# Tiago Museum (Museo Torres Céspedes)

Sitio web del **Museo Torres Céspedes** con una versión pública y un panel **admin (demo)**.

El proyecto está preparado para **GitHub Pages (project site)**, incluyendo:

https://salchavan.github.io/tiago-museum/index.html

- Build multi-page (incluye `index.html`, `index-admin.html`, `login.html`).
- Tailwind bundleado por Vite (sin links directos a CSS dentro de `/src`).
- Datos en JSON servidos desde `/public/data`.

## Stack

- **Vite** (multi-page + base para GitHub Pages)
- **TypeScript**
- **Tailwind CSS** vía `@tailwindcss/vite`
- **gh-pages** para publicar el contenido de `dist/`

## Estructura rápida

- `index.html`: sitio público
- `index-admin.html`: panel admin (demo)
- `login.html`: login (demo)
- `src/main.ts`: entry principal (importa Tailwind + shortcuts como `Ctrl+K`)
- `src/login.ts`: entry del login (importa Tailwind + redirección)
- `src/slider/*`: sliders (restauraciones / noticias)
- `src/modals/*`: modales (reservas, noticias, restauraciones, donación, comentarios, etc.)
- `src/forms/*`: formularios (ej. reservas)
- `public/data/*.json`: datos usados por la UI en producción

## Datos (JSON)

Los datos están en `public/data/` para que Vite los copie al build (`dist/`) automáticamente.

- `public/data/n.json`: noticias/eventos
- `public/data/r.json`: restauraciones
- `public/data/c.json`: comentarios
- `public/data/a.json`: reservas (demo)

Importante:

- En runtime, los `fetch()` construyen la ruta con `import.meta.env.BASE_URL`, por ejemplo:
  - `${import.meta.env.BASE_URL}data/n.json`
- Esto es clave para que funcione tanto en local (`/`) como en GitHub Pages (`/tiago-museum/`).

## Comandos

Requisitos: Node.js + npm.

- Instalar dependencias:

  - `npm install`

- Desarrollo (servidor local):

  - `npm run dev`

- Build (genera `dist/`):

  - `npm run build`

- Preview del build:

  - `npm run preview`

- Publicar en GitHub Pages (sube `dist/`):

  - `npm run publish`

- Build + Publish:
  - `npm run b-and-p`

## GitHub Pages (base path)

En [vite.config.js](vite.config.js) se configura:

- `base: mode === 'production' ? '/tiago-museum/' : '/'`

Eso significa:

- En DEV, las rutas base son `/`.
- En producción (GitHub Pages), todo vive bajo `/tiago-museum/`.

Si renombrás el repo, actualizá ese `base`.

## Admin (demo) y persistencia

El panel admin incluye modales para “agregar” noticias/restauraciones, etc.

En **modo dev** (`npm run dev`), Vite levanta middlewares que simulan un backend:

- `POST /api/news` (escribe en `public/data/n.json`)
- `POST /api/restorations` (escribe en `public/data/r.json`)
- `POST /api/reservations` (escribe en `public/data/a.json`)

En **GitHub Pages** no hay backend, por lo que esas rutas `/api/*` no existen en producción.

## Atajos

- `Ctrl + K`: navegación al login (manejado desde `src/main.ts`).

## Troubleshooting

### No carga Tailwind en producción

No linkear archivos dentro de `/src` desde HTML (en `dist/` no existe `/src`).
Tailwind se importa desde los entrypoints TS:

- `src/main.ts`
- `src/login.ts`

### 404 de JSON en GitHub Pages

Los JSON deben estar en `public/data/` para copiarse a `dist/data/`.
Y los `fetch()` deben usar `import.meta.env.BASE_URL`.

### 404 de login/admin en producción

El build debe ser multi-page. Está configurado en [vite.config.js](vite.config.js) con:

- `build.rollupOptions.input` apuntando a `index.html`, `index-admin.html`, `login.html`.

## Licencia

Proyecto académico/demo.
