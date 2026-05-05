# Samuel Ciocan — Portfolio personal

Portfolio personal de **Samuel Ciocan**, desarrollador web full stack. La web centraliza proyectos, CV, contacto y enlaces profesionales en `samuelciocan.com`.

El objetivo del proyecto es tener una página rápida, mantenible y con personalidad para presentar mi perfil como programador web, con foco en frontend moderno, backend organizado, bases de datos, APIs y despliegue en Cloudflare.

## Tecnologías utilizadas

- HTML semántico generado de forma estática
- CSS responsive sin frameworks externos
- JavaScript ES modules para animaciones, tilt 3D y copia de correo
- Canvas 2D propio para una escena 3D ligera en el hero (sin dependencias externas)
- Node.js como generador en tiempo de build
- Cloudflare Workers con assets estáticos

No incluye backend obligatorio, claves privadas ni datos personales sensibles.

## Estructura general

- `src/data/profile.mjs`: datos públicos, texto base, SEO y tecnologías.
- `src/data/projects.mjs`: proyectos destacados y repositorios.
- `src/data/cv.mjs`: perfil profesional, formación, experiencia, habilidades e idiomas.
- `src/data/links.mjs`: enlaces mostrados en `/links`.
- `src/styles/styles.css`: estilos globales, sistema 3D y responsive.
- `src/scripts/main.js`: punto de entrada, orquesta los módulos.
- `src/scripts/hero-scene.js`: escena 3D del hero (icosaedro y partículas en Canvas 2D).
- `src/scripts/animations.js`: reveal scroll, tilt 3D en tarjetas y parallax suave.
- `src/scripts/copy-email.js`: lógica de copia de correo y feedback visual.
- `scripts/build.mjs`: genera la web estática en `dist`.
- `public/`: archivos públicos como `favicon.svg`, `_headers` y `site.webmanifest`.

## Rutas principales

- `/`: presentación, escena 3D, sobre mí, stack, proyectos destacados y CTA de contacto.
- `/proyectos/`: proyectos y repositorios con tarjetas tilt 3D.
- `/cv/`: currículum web, tecnologías y contacto.
- `/links/`: link in bio con enlaces profesionales.

## Despliegue

La web se publica en Cloudflare usando los assets estáticos generados en `dist`.

Comandos de uso interno:

```bash
npm run build
npx wrangler deploy
```

`npm run build` genera la carpeta `dist`. `npx wrangler deploy` despliega el proyecto en Cloudflare.

Para previsualizar en local:

```bash
npm run dev
```

## Rendimiento y accesibilidad

- La escena 3D respeta `prefers-reduced-motion` y se pausa cuando la pestaña no está visible.
- Pixel ratio limitado (≤1.5 escritorio, ≤1 móvil) y partículas reducidas en pantallas pequeñas.
- Si el dispositivo es muy limitado, la escena se desactiva y se muestra un fallback CSS.
- Animaciones desactivadas en modo de movimiento reducido.

## Nota

Este repositorio es mi portfolio personal. No está planteado como plantilla reutilizable ni como tutorial de instalación para terceros. El contenido y el código quedan sin licencia de reutilización; consulta `LICENCE`.
