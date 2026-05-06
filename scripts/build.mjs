import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { profile } from "../src/data/profile.mjs";
import { projects } from "../src/data/projects.mjs";
import { linkGroups } from "../src/data/links.mjs";
import { cv } from "../src/data/cv.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const sourceAssetDir = path.join(rootDir, "src", "assets");
const sourceStyleDir = path.join(rootDir, "src", "styles");
const sourceScriptDir = path.join(rootDir, "src", "scripts");
const publicDir = path.join(rootDir, "public");

const navItems = [
  { label: "Inicio", href: "/", active: "home" },
  { label: "Enlaces", href: "/links/", active: "links" },
  { label: "Proyectos", href: "/proyectos/", active: "projects" },
  { label: "CV", href: "/cv/", active: "cv" }
];

const pages = ["/", "/links/", "/proyectos/", "/cv/"];

const projectRepoRedirects = projects
  .filter((project) => project.featured && project.repoUrl)
  .flatMap((project) => [
    [`/${project.slug}`, project.repoUrl, 302],
    [`/proyectos/${project.slug}/`, project.repoUrl, 302]
  ]);

const shortRedirects = [
  ["/github", profile.github, 302],
  ["/linkedin", profile.linkedin, 302],
  ["/telegram", profile.telegram, 302],
  ...projectRepoRedirects,
  ["/contacto", "/links/", 301],
  ["/contacto/", "/links/", 301],
  ["/contacto.html", "/links/", 301],
  ["/CV", "/cv/", 301],
  ["/CV/", "/cv/", 301],
  ["/Cv", "/cv/", 301],
  ["/Links", "/links/", 301],
  ["/Proyectos", "/proyectos/", 301],
  ["/profesional.html", "/cv/", 301],
  ["/sobremi.html", "/", 301],
  ["/index.html", "/", 301]
];

export function build() {
  resetDist();
  copyStaticAssets();
  writeText("index.html", renderHome());
  writeText("links/index.html", renderLinks());
  writeText("proyectos/index.html", renderProjects());
  writeText("cv/index.html", renderCv());

  writeText("_redirects", renderRedirects());
  writeText("robots.txt", renderRobots());
  writeText("sitemap.xml", renderSitemap());
}

function resetDist() {
  const resolved = path.resolve(distDir);
  if (!isInside(rootDir, resolved)) {
    throw new Error(`Refusing to write outside project root: ${resolved}`);
  }

  fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  fs.mkdirSync(resolved, { recursive: true });
}

function copyStaticAssets() {
  copyDir(sourceAssetDir, path.join(distDir, "assets"));
  copyDir(sourceStyleDir, path.join(distDir, "assets", "css"));
  copyDir(sourceScriptDir, path.join(distDir, "assets", "js"));

  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, distDir);
  }
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    return;
  }

  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDir(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

function writeText(relativePath, content) {
  const outPath = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");
}

function renderHome() {
  const featuredProjects = projects.filter((project) => project.featured);

  return layout({
    title: profile.seo.title,
    description: profile.seo.description,
    active: "home",
    route: "/",
    depth: 0,
    bodyClass: "home-page",
    body: `
      <section class="hero section-shell">
        <div class="hero__content reveal">
          ${eyebrow("Portfolio personal", "spark")}
          <h1 class="name-gradient">${escapeHtml(profile.name)}</h1>
          <p class="hero__role">${escapeHtml(profile.role)}</p>
          <p class="hero__intro">${escapeHtml(profile.intro)}</p>
          <div class="hero__actions" aria-label="Acciones principales">
            ${buttonLink("Ver proyectos", "/proyectos/", 0, "primary", "grid")}
            ${buttonLink("Ver CV", "/cv/", 0, "secondary", "file")}
            ${buttonLink("Enlaces", "/links/", 0, "ghost", "spark")}
            ${buttonLink("GitHub", profile.github, 0, "ghost", "github")}
          </div>
          <dl class="hero__facts" aria-label="Resumen rápido">
            <div><dt>Foco</dt><dd>Desarrollo web</dd></div>
            <div><dt>Frontend</dt><dd>Interfaces responsive</dd></div>
            <div><dt>Backend</dt><dd>APIs y bases de datos</dd></div>
          </dl>
        </div>

        <div class="hero__visual reveal">
          <figure class="about-portrait">
            <img src="${asset("assets/img/samuel-ciocan.png", 0)}" alt="Foto de Samuel Ciocan" width="760" height="760" decoding="async" fetchpriority="high">
            <figcaption class="about-portrait__chip">
              <span class="status-dot" aria-hidden="true"></span>
              <span>Desarrollador en <span class="growth-word"><span class="sr-only">crecimiento</span>${animatedLetters("crecimiento")}</span>.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section class="section-shell about-section">
        <div class="about-visual reveal" aria-label="Visualización abstracta del stack de Samuel Ciocan">
          <div class="orbit-stage">
            <canvas data-hero-canvas aria-hidden="true"></canvas>
            <div class="orbit-fallback" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="hero__badge hero__badge--top" aria-label="Estado profesional">
              <span class="status-dot" aria-hidden="true"></span>
              <span>Disponible para proyectos</span>
            </div>
            <div class="hero__badge hero__badge--bottom" aria-label="Stack principal">
              <code>full · stack · web</code>
            </div>
          </div>
        </div>
        <div class="about-content reveal">
          <div class="about-copy">
            ${eyebrow("Sobre mí", "user")}
            <h2>Código claro, decisiones cuidadas y proyectos reales.</h2>
            <p>${escapeHtml(profile.about)}</p>
          </div>
          <div class="code-panel" aria-label="Resumen en formato código">
            <span class="code-panel__bar" aria-hidden="true"></span>
            <pre><code><span class="tk-key">const</span> developer = {
  <span class="tk-key">name</span>: <span class="tk-str">"Samuel Ciocan"</span>,
  <span class="tk-key">role</span>: <span class="tk-str">"Full Stack Web Developer"</span>,
  <span class="tk-key">focus</span>: [<span class="tk-str">"Frontend"</span>, <span class="tk-str">"Backend"</span>, <span class="tk-str">"APIs"</span>]
};</code></pre>
          </div>
        </div>
      </section>

      <section class="section-shell section-block">
        <div class="section-heading reveal">
          ${eyebrow("Stack", "code")}
          <h2>Tecnologías con las que construyo</h2>
          <p>Las herramientas que uso a diario para crear interfaces limpias, mover datos, conectar APIs y desplegar aplicaciones web.</p>
        </div>
        ${techCloud(profile.technologies)}
      </section>

      <section class="section-shell section-block">
        <div class="section-heading reveal">
          ${eyebrow("Proyectos", "grid")}
          <h2>Algunos proyectos destacados</h2>
          <p>Estos son algunos de mis proyectos. En la página de proyectos puedes ver más repositorios y detalles.</p>
        </div>
        <div class="project-grid project-grid--featured">
          ${featuredProjects.map((project) => projectCard(project, 0)).join("")}
        </div>
      </section>

      <section class="section-shell section-block">
        <div class="contact-heading reveal">
          ${eyebrow("Contacto", "mail")}
        </div>
        <aside class="cta-final reveal" aria-label="Correo de contacto">
          <h2>¿Quieres hablar de un proyecto?</h2>
          <p>Disponible para prácticas, colaboraciones y proyectos web. Puedes escribirme directamente al correo.</p>
          ${emailActions()}
        </aside>
      </section>
    `
  });
}

function renderLinks() {
  return layout({
    title: `${profile.name} | Enlaces`,
    description:
      "Enlaces principales de Samuel Ciocan: proyectos, CV, GitHub, LinkedIn, Telegram y contacto.",
    active: "links",
    route: "/links/",
    depth: 1,
    body: `
      <section class="links-hero">
        <div class="link-card-main reveal">
          <img src="${asset("assets/img/samuel-ciocan.png", 1)}" alt="Foto de Samuel Ciocan" width="220" height="220" decoding="async">
          <p class="eyebrow">Enlaces</p>
          <h1 class="name-gradient">${escapeHtml(profile.name)}</h1>
          <p>${escapeHtml(profile.role)} · proyectos, CV, perfiles y contacto.</p>
          ${emailActions({ id: "contacto" })}
        </div>

        <div class="links-stack">
          ${linkGroups
      .map(
        (group) => `
                <section class="link-group reveal" aria-labelledby="link-group-${slugify(group.title)}">
                  <h2 id="link-group-${slugify(group.title)}">${escapeHtml(group.title)}</h2>
                  <div class="bio-links">
                    ${group.items.map((item) => bioLink(item, 1)).join("")}
                  </div>
                </section>
              `
    )
      .join("")}
        </div>
      </section>
    `
  });
}

function renderProjects() {
  const repoProjects = projects.filter((project) => Boolean(project.repoUrl));

  return layout({
    title: `${profile.name} | Proyectos`,
    description:
      "Proyectos de Samuel Ciocan: Friends4You, Discord-RAG-Bot, PokeAPI y portfolio personal.",
    active: "projects",
    route: "/proyectos/",
    depth: 1,
    bodyClass: "projects-page",
    body: `
      <section class="page-hero section-shell reveal">
        <p class="eyebrow">Portfolio de proyectos</p>
        <h1>Proyectos web y repositorios</h1>
        <p>Una selección de proyectos donde practico interfaces, lógica backend, consumo de APIs, bases de datos y despliegue web.</p>
      </section>

      <section class="section-shell">
        <div class="project-grid">
          ${repoProjects.map((project) => projectCard(project, 1)).join("")}
        </div>
      </section>
    `
  });
}

function renderCv() {
  const featured = projects.filter((project) => project.featured);

  return layout({
    title: `${profile.name} | CV`,
    description:
      "Currículum web de Samuel Ciocan: perfil, formación, tecnologías, proyectos destacados y contacto.",
    active: "cv",
    route: "/cv/",
    depth: 1,
    body: `
      <section class="page-hero section-shell reveal">
        <p class="eyebrow">Currículum web</p>
        <h1 class="name-gradient">${escapeHtml(profile.name)}</h1>
        <p>${escapeHtml(cv.headline)}</p>
        <div class="inline-actions">
          ${buttonLink("Contactar", "#contacto", 1, "primary", "mail")}
          ${buttonLink("Ver proyectos", "/proyectos/", 1, "secondary", "grid")}
          ${buttonLink("GitHub", profile.github, 1, "ghost", "github")}
          ${buttonLink("LinkedIn", profile.linkedin, 1, "ghost", "linkedin")}
        </div>
      </section>

      <section class="section-shell cv-grid">
        <div class="surface-panel surface-panel--wide reveal">
          <h2>Perfil</h2>
          <p>${escapeHtml(profile.profileSummary)}</p>
        </div>
        <div class="surface-panel surface-panel--wide reveal">
          <h2>Experiencia</h2>
          ${timelineList(cv.experience)}
        </div>
        <div class="surface-panel reveal">
          <h2>Formación</h2>
          ${educationList(cv.education)}
        </div>
        <div class="surface-panel reveal">
          <h2>Tecnologías</h2>
          <p class="panel-intro">Tecnologías que uso y sigo reforzando en proyectos frontend, backend y despliegue web.</p>
          ${techCloud(profile.technologies)}
        </div>
        <div class="surface-panel reveal">
          <h2>Habilidades</h2>
          ${featureList(cv.skills)}
        </div>
        <div class="surface-panel reveal">
          <h2>Idiomas y disponibilidad</h2>
          ${featureList([...cv.languages, ...cv.availability])}
        </div>
        <div class="surface-panel surface-panel--wide reveal">
          <h2>Proyectos destacados</h2>
          ${featureList(featured.map((project) => `${project.name}: ${project.description}`))}
        </div>
        <div class="surface-panel surface-panel--wide surface-panel--center reveal" id="contacto">
          <h2>Contacto</h2>
          <p>Disponible para conversaciones profesionales, prácticas, colaboraciones y proyectos web.</p>
          ${emailActions()}
        </div>
      </section>
    `
  });
}

function layout({ title, description, active, route, depth, body, bodyClass = "" }) {
  const canonical = canonicalUrl(route);
  const image = canonicalUrl(`/${profile.seo.image}`);
  const bodyClassAttribute = bodyClass ? ` class="${escapeAttribute(bodyClass)}"` : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttribute(description)}">
  <link rel="canonical" href="${escapeAttribute(canonical)}">
  <meta name="theme-color" content="#ff7a18">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeAttribute(canonical)}">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:image" content="${escapeAttribute(image)}">
  <meta property="og:image:secure_url" content="${escapeAttribute(image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="${escapeAttribute(profile.seo.imageWidth)}">
  <meta property="og:image:height" content="${escapeAttribute(profile.seo.imageHeight)}">
  <meta property="og:image:alt" content="${escapeAttribute(profile.seo.imageAlt)}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="${escapeAttribute(profile.name)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${escapeAttribute(image)}">
  <meta name="twitter:image:alt" content="${escapeAttribute(profile.seo.imageAlt)}">
  <script>document.documentElement.classList.add("js-enabled");</script>
  <link rel="icon" href="${asset("favicon.svg", depth)}" type="image/svg+xml">
  <link rel="manifest" href="${asset("site.webmanifest", depth)}">
  <link rel="preload" href="${asset("assets/css/styles.css", depth)}" as="style">
  <link rel="stylesheet" href="${asset("assets/css/styles.css", depth)}">
  <script type="module" src="${asset("assets/js/main.js", depth)}"></script>
</head>
<body${bodyClassAttribute}>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  ${siteHeader(active, depth)}
  <main id="contenido">
    ${body}
  </main>
  ${siteFooter(depth)}
  <div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
</body>
</html>
`;
}

function siteHeader(active, depth) {
  return `
  <header class="site-header">
    <nav class="nav-shell" aria-label="Navegación principal">
      <a class="brand" href="${routeHref("/", depth)}" aria-label="${escapeAttribute(profile.name)} - inicio">
        <span class="brand__mark" aria-hidden="true">SC</span>
        <span>${escapeHtml(profile.name)}</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
        <span class="sr-only">Abrir menú</span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
      <div class="nav-links" id="site-menu">
        ${navItems
    .map(
      (item) => `
              <a href="${routeHref(item.href, depth)}" ${item.active === active ? 'aria-current="page"' : ""
        }>${escapeHtml(item.label)}</a>
            `
  )
    .join("")}
      </div>
    </nav>
  </header>
`;
}

function siteFooter(depth) {
  const year = new Date().getFullYear();

  return `
  <footer class="site-footer">
    <div class="footer-shell">
      <div>
        <p>© ${year} ${escapeHtml(profile.name)}</p>
      </div>
      <div class="footer-links" aria-label="Enlaces básicos">
        ${navItems.map((item) => `<a href="${routeHref(item.href, depth)}">${escapeHtml(item.label)}</a>`).join("")}
      </div>
    </div>
  </footer>
`;
}

function projectCard(project, depth) {
  const status = project.status
    ? `<span class="project-card__status">${escapeHtml(project.status)}</span>`
    : "";

  return `
    <article class="project-card reveal" data-tilt>
      <div class="project-card__top">
        <span class="project-card__type">${escapeHtml(project.type)}</span>
        ${status}
      </div>
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.description)}</p>
      ${tagList(project.technologies)}
      <div class="project-card__actions">
        ${buttonLink(project.cta, project.repoUrl, depth, "primary compact", "github")}
      </div>
    </article>
  `;
}

function techCloud(items) {
  return `
    <ul class="tech-cloud" aria-label="Tecnologías" data-floating-tags>
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function bioLink(item, depth) {
  const external = item.kind === "external";
  const href = normalizeHref(item.href, depth);

  return `
    <a class="bio-link" href="${escapeAttribute(href)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>
      <span class="bio-link__icon" aria-hidden="true">${icon(item.icon)}</span>
      <span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.description)}</small>
      </span>
      <span class="bio-link__arrow" aria-hidden="true">${icon("arrow-right")}</span>
    </a>
  `;
}

function buttonLink(label, href, depth, variant = "primary", iconName = "arrow-right") {
  const normalizedHref = normalizeHref(href, depth);
  const external = isExternal(href);
  const attrs = [
    `class="button button--${variant.replaceAll(" ", " button--")}"`,
    `href="${escapeAttribute(normalizedHref)}"`,
    external ? 'target="_blank" rel="noopener noreferrer"' : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `<a ${attrs}>${icon(iconName)}<span>${escapeHtml(label)}</span></a>`;
}

function eyebrow(label, iconName) {
  return `<p class="eyebrow eyebrow--icon"><span class="eyebrow__icon" aria-hidden="true">${icon(iconName)}</span><span>${escapeHtml(label)}</span></p>`;
}

function animatedLetters(value) {
  return [...value]
    .map((letter, index) => `<span aria-hidden="true" style="--letter-index: ${index}">${escapeHtml(letter)}</span>`)
    .join("");
}

function emailActions(options = {}) {
  const idAttribute = options.id ? ` id="${escapeAttribute(options.id)}"` : "";

  return `
    <div class="email-actions"${idAttribute}>
      <a class="email-actions__address" href="mailto:${escapeAttribute(profile.email)}" aria-label="Enviar correo a ${escapeAttribute(profile.email)}">
        ${icon("mail")}<span>${escapeHtml(profile.email)}</span>
      </a>
      <button class="button button--ghost button--compact copy-email-button" type="button" data-copy-email="${escapeAttribute(profile.email)}" aria-label="Copiar correo ${escapeAttribute(profile.email)}">
        ${icon("copy")}<span data-copy-label>Copiar correo</span>
      </button>
    </div>
  `;
}

function tagList(tags) {
  return `
    <ul class="tag-list" aria-label="Tecnologías">
      ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
    </ul>
  `;
}

function featureList(items) {
  return `
    <ul class="feature-list">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function timelineList(items) {
  return `
    <div class="timeline-list">
      ${items
    .map(
      (item) => `
            <article class="timeline-item">
              <div>
                <h3>${escapeHtml(item.role)}</h3>
                <p>${escapeHtml(item.company)} · ${escapeHtml(item.period)}</p>
              </div>
              ${featureList(item.bullets)}
            </article>
          `
  )
    .join("")}
    </div>
  `;
}

function educationList(items) {
  return `
    <div class="education-list">
      ${items
    .map(
      (item) => `
            <article>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.place)} · ${escapeHtml(item.period)}</p>
            </article>
          `
  )
    .join("")}
    </div>
  `;
}

function renderRedirects() {
  return `${shortRedirects.map(([from, to, code]) => `${from}  ${to}  ${code}`).join("\n")}\n`;
}

function renderRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${canonicalUrl("/sitemap.xml")}
`;
}

function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
    .map(
      (url) => `  <url>
    <loc>${canonicalUrl(url)}</loc>
  </url>`
  )
    .join("\n")}
</urlset>
`;
}

function asset(relativePath, depth) {
  return `${"../".repeat(depth)}${relativePath}`;
}

function routeHref(href, depth) {
  if (href === "/") {
    return depth === 0 ? "./" : "../".repeat(depth);
  }

  const cleanHref = href.startsWith("/") ? href.slice(1) : href;
  return `${"../".repeat(depth)}${cleanHref}`;
}

function normalizeHref(href, depth) {
  if (!href) {
    return "#";
  }

  if (isExternal(href) || href.startsWith("mailto:") || href.startsWith("#")) {
    return href;
  }

  return routeHref(href, depth);
}

function canonicalUrl(route) {
  return new URL(route, profile.domain).toString();
}

function isExternal(href) {
  return /^https?:\/\//.test(href);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function icon(name) {
  const icons = {
    "arrow-right":
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    bot:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 8V4m-6 8a6 6 0 0 1 12 0v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5Z"/><path d="M9 13h.01M15 13h.01"/></svg>',
    code:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="m9 18-6-6 6-6m6 12 6-6-6-6"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M8 8h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    file:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3c3 0 6-2 6-6a5.5 5.5 0 0 0-1.5-4 5 5 0 0 0-.1-4S17.2.6 15 2.5a13.4 13.4 0 0 0-6 0C6.8.6 5.6 1 5.6 1a5 5 0 0 0-.1 4A5.5 5.5 0 0 0 4 9c0 4 3 6 6 6a4.8 4.8 0 0 0-1 3v4"/><path d="M9 18c-4.5 2-5-2-7-2"/></svg>',
    grid:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z"/><path d="M2 9h4v12H2z"/><path d="M4 4h.01"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>',
    send:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    spark:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="m12 2 2.2 6.8H21l-5.5 4 2.1 6.8-5.6-4.2-5.6 4.2 2.1-6.8L3 8.8h6.8z"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>'
  };

  return icons[name] ?? icons["arrow-right"];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  process.stdout.write(`Generated ${path.relative(rootDir, distDir)}\n`);
}
