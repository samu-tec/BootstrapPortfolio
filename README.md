# Samuel Ciocan — Portfolio personal

Web personal de **Samuel Ciocan**, desarrollador web full stack. Centraliza proyectos, CV y enlaces profesionales en `samuelciocan.com`.

No es una plantilla reutilizable ni un tutorial de instalación. El repositorio está visible como parte del propio portfolio.

## Tecnologías

- HTML semántico generado de forma estática
- CSS sin frameworks externos, responsive y con `prefers-reduced-motion`
- JavaScript ES modules (animaciones, tilt 3D, copia de correo)
- Canvas 2D para una escena 3D ligera en el hero, sin dependencias
- Node.js como generador en tiempo de build
- Cloudflare con assets estáticos

## Estructura

- `src/data/`: contenido editable (perfil, proyectos, CV, links).
- `src/styles/styles.css`: estilos globales.
- `src/scripts/`: módulos JS (`main.js`, `hero-scene.js`, `animations.js`, `copy-email.js`).
- `scripts/build.mjs`: generador estático que produce `dist/`.
- `scripts/dev-server.mjs`: servidor local de previsualización.
- `scripts/validate.mjs`: comprobaciones de build (rutas, SEO, alts, refs).
- `public/`: archivos públicos (`favicon.svg`, `_headers`, `site.webmanifest`).

## Rutas

- `/` — Inicio: presentación, stack, proyectos destacados y contacto.
- `/proyectos/` — Proyectos y repositorios.
- `/cv/` — Currículum web.
- `/links/` — Enlaces principales (perfiles, repositorios y contacto).

Las rutas en mayúsculas (`/CV`, `/Links`, `/Proyectos`) y la antigua `/contacto` se redirigen a sus equivalentes en minúsculas mediante `_redirects`.

## Despliegue

Comandos de uso interno:

```bash
npm run build       # genera dist/
npx wrangler deploy # despliega en Cloudflare
npm run dev         # previsualización local
npm test            # build + validaciones
```

## Notas

- La escena 3D se pausa cuando la pestaña no está visible y respeta `prefers-reduced-motion`.
- Pixel ratio limitado (≤1.5 escritorio, ≤1 móvil) y partículas reducidas en pantallas pequeñas; en dispositivos muy limitados se muestra un fallback CSS.
- Contenido y código bajo licencia Creative Commons BY-NC-ND 4.0: se puede ver y compartir con atribución, pero no modificar, redistribuir ni usar con fines comerciales. Detalles en `LICENSE`.
