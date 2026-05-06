import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

build();

const requiredFiles = [
  "index.html",
  "links/index.html",
  "proyectos/index.html",
  "cv/index.html",
  "_redirects",
  "_headers",
  "robots.txt",
  "sitemap.xml",
  "assets/css/styles.css",
  "assets/js/main.js",
  "assets/img/samuel-ciocan.png",
  "assets/img/og-samuel-ciocan.png",
  "favicon.svg"
];

const expectedHomeMetadata = [
  '<meta property="og:type" content="website">',
  '<meta property="og:url" content="https://samuelciocan.com/">',
  '<meta property="og:title" content="Samuel Ciocan | Desarrollador Web Full Stack">',
  '<meta property="og:description" content="Portfolio personal de Samuel Ciocan, desarrollador web full stack. Proyectos, CV y enlaces profesionales.">',
  '<meta property="og:image" content="https://samuelciocan.com/assets/img/og-samuel-ciocan.png">',
  '<meta property="og:image:secure_url" content="https://samuelciocan.com/assets/img/og-samuel-ciocan.png">',
  '<meta property="og:image:type" content="image/png">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="627">',
  '<meta property="og:image:alt" content="Samuel Ciocan - Desarrollador Web Full Stack">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="Samuel Ciocan | Desarrollador Web Full Stack">',
  '<meta name="twitter:description" content="Portfolio personal de Samuel Ciocan, desarrollador web full stack. Proyectos, CV y enlaces profesionales.">',
  '<meta name="twitter:image" content="https://samuelciocan.com/assets/img/og-samuel-ciocan.png">'
];

const forbiddenStrings = [
  "gmail.com",
  "FormSubmit",
  "bootstrapcdn",
  "picsum.photos",
  "linktr.ee"
];

const binaryFilePattern = /\.(png|jpg|jpeg|gif|webp|ico)$/i;
const mojibakeFragments = ["\u00c3", "\u00c2", "\u00e2", "\ufffd"];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(distDir, file)), `Missing generated file: ${file}`);
}

const generatedFiles = listFiles(distDir);
const htmlFiles = generatedFiles.filter((file) => file.endsWith(".html"));
const textFiles = uniqueFiles([
  path.join(rootDir, ".gitignore"),
  path.join(rootDir, "LICENCE"),
  path.join(rootDir, "README.md"),
  path.join(rootDir, "package.json"),
  path.join(rootDir, "wrangler.jsonc"),
  ...listFilesIfExists(path.join(rootDir, "scripts")),
  ...listFilesIfExists(path.join(rootDir, "src")),
  ...listFilesIfExists(path.join(rootDir, "public")),
  ...generatedFiles
]).filter(isTextFile);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(distDir, file);

  assert(html.includes('<html lang="es">'), `${relative} is missing lang="es"`);
  assert(html.includes("<title>"), `${relative} is missing a title`);
  assert(html.includes('name="description"'), `${relative} is missing meta description`);
  assert(html.includes('property="og:title"'), `${relative} is missing Open Graph metadata`);
  assert(html.includes('property="og:type" content="website"'), `${relative} is missing website Open Graph type`);
  assert(html.includes('property="og:image"'), `${relative} is missing Open Graph image`);
  assert(html.includes('property="og:image:secure_url"'), `${relative} is missing Open Graph secure image URL`);
  assert(html.includes('property="og:image:type" content="image/png"'), `${relative} is missing Open Graph image type`);
  assert(html.includes('property="og:image:width" content="1200"'), `${relative} is missing Open Graph image width`);
  assert(html.includes('property="og:image:height" content="627"'), `${relative} is missing Open Graph image height`);
  assert(html.includes('name="twitter:card"'), `${relative} is missing Twitter card metadata`);
  assert(html.includes('name="twitter:image"'), `${relative} is missing Twitter image metadata`);
  assert(html.includes('name="twitter:image:alt"'), `${relative} is missing Twitter image alt metadata`);
  assert(!html.includes("console.log"), `${relative} contains console.log`);
  assert(!html.includes('property="og:type" content="article"'), `${relative} has article Open Graph type`);

  validateLocalReferences(html, file, relative);
  validateExternalBlankLinks(html, relative);
  validateImageAltText(html, relative);
}

const homeHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
for (const metadata of expectedHomeMetadata) {
  assert(homeHtml.includes(metadata), `Home page is missing expected social metadata: ${metadata}`);
}

const ogImagePath = path.join(distDir, "assets", "img", "og-samuel-ciocan.png");
const ogImageSize = readPngSize(ogImagePath);
assert(ogImageSize.width === 1200, `OG image width must be 1200 px, got ${ogImageSize.width}`);
assert(ogImageSize.height === 627, `OG image height must be 627 px, got ${ogImageSize.height}`);

const generatedText = generatedFiles
  .filter(isTextFile)
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
const repositoryText = textFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

for (const forbidden of forbiddenStrings) {
  assert(!generatedText.includes(forbidden), `Generated site contains forbidden string: ${forbidden}`);
}

for (const fragment of mojibakeFragments) {
  assert(!repositoryText.includes(fragment), "Repository text contains suspicious mojibake characters");
}

process.stdout.write(`Validated ${htmlFiles.length} HTML pages in dist.\n`);

function validateLocalReferences(html, file, relative) {
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (shouldSkipReference(reference)) {
      continue;
    }

    const cleanReference = reference.split("#")[0].split("?")[0];
    if (!cleanReference) {
      continue;
    }

    const baseDir = cleanReference.startsWith("/") ? distDir : path.dirname(file);
    const relativeReference = cleanReference.startsWith("/") ? cleanReference.slice(1) : cleanReference;
    const target = path.normalize(path.join(baseDir, relativeReference));

    assert(isInside(distDir, target), `${relative} references outside dist: ${reference}`);
    assert(referenceExists(target), `${relative} has broken local reference: ${reference}`);
  }
}

function validateExternalBlankLinks(html, relative) {
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    const tag = match[0];
    assert(hasRelValue(tag, "noopener"), `${relative} has target="_blank" without rel="noopener"`);
    assert(hasRelValue(tag, "noreferrer"), `${relative} has target="_blank" without rel="noreferrer"`);
  }
}

function validateImageAltText(html, relative) {
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\balt="[^"]*"/.test(match[0]), `${relative} has an image without alt text`);
  }
}

function shouldSkipReference(reference) {
  return /^(?:https?:|mailto:|tel:|sms:|data:|#)/.test(reference);
}

function referenceExists(target) {
  return fs.existsSync(target) || fs.existsSync(`${target}.html`) || fs.existsSync(path.join(target, "index.html"));
}

function hasRelValue(tag, value) {
  const rel = tag.match(/\brel="([^"]*)"/);
  return Boolean(rel && rel[1].split(/\s+/).includes(value));
}

function readPngSize(file) {
  const buffer = fs.readFileSync(file);
  assert(buffer.toString("ascii", 1, 4) === "PNG", `${file} is not a PNG file`);

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function listFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function listFilesIfExists(dir) {
  return fs.existsSync(dir) ? listFiles(dir) : [];
}

function uniqueFiles(files) {
  return [...new Set(files)];
}

function isTextFile(file) {
  return !binaryFilePattern.test(file);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
