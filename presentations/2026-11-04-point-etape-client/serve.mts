import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..");
const port = Number.parseInt(process.env.ORION_PRESENTATION_PORT || "4173", 10);
const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const requestedUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const requestedPath = requestedUrl.pathname.endsWith("/")
    ? `${requestedUrl.pathname}index.html`
    : requestedUrl.pathname;
  const filePath = path.resolve(repositoryRoot, `.${decodeURIComponent(requestedPath)}`);

  // Seuls les fichiers du dépôt sont servis (séparateur exigé : /depot-voisin n'est pas /depot)
  if (!filePath.startsWith(repositoryRoot + path.sep)) {
    response.writeHead(403);
    response.end("Accès interdit");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Fichier introuvable" : "Erreur interne");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(content);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Présentation ORION : http://127.0.0.1:${port}/presentations/2026-11-04-point-etape-client/`);
});
