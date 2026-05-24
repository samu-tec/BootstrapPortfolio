// Servidor local de previsualización. Rebuilda dist/ al arrancar y sirve
// archivos estáticos con resolución estilo SPA (request a /foo/ -> /foo/index.html).
// Si el puerto está ocupado, va probando los siguientes.

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";
import { isInside } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const startPort = Number.parseInt(process.env.PORT || "4173", 10);

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

build();
startServer(startPort);

function startServer(port) {
  const server = http.createServer((request, response) => {
    const filePath = resolveRequest(request.url || "/");

    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
      });
      response.end(content);
    });
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      startServer(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    process.stdout.write(`Portfolio local: http://localhost:${port}\n`);
  });
}

function resolveRequest(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl, "http://localhost");
  } catch {
    return null;
  }

  let cleanPath;
  try {
    cleanPath = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const candidate = path.normalize(path.join(distDir, cleanPath));

  if (!isInside(distDir, candidate)) {
    return null;
  }

  // Un solo stat por petición: cubre archivo, directorio y "no existe" en un
  // único syscall en vez de dos existsSync + statSync separados.
  const stat = statOrNull(candidate);

  if (stat?.isFile()) {
    return candidate;
  }

  if (stat?.isDirectory()) {
    return path.join(candidate, "index.html");
  }

  if (statOrNull(`${candidate}.html`)?.isFile()) {
    return `${candidate}.html`;
  }

  // Fallback al index para que los enlaces directos a páginas que aún no
  // existen no rompan el flujo de desarrollo.
  return path.join(distDir, "index.html");
}

function statOrNull(target) {
  try {
    return fs.statSync(target);
  } catch {
    return null;
  }
}
