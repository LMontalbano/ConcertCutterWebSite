import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const pagesBasePath = "/ConcertCutterWebSite";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const send = (response, status, filePath) => {
  response.writeHead(status, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
};

createServer((request, response) => {
  let requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (requestPath === pagesBasePath || requestPath.startsWith(`${pagesBasePath}/`)) {
    requestPath = requestPath.slice(pagesBasePath.length) || "/";
  }
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(root, safePath);
  try {
    if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
    statSync(filePath);
    send(response, 200, filePath);
  } catch {
    // Même comportement que GitHub Pages : la page 404 du site est servie.
    try {
      const notFound = join(root, "404.html");
      statSync(notFound);
      send(response, 404, notFound);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("ConcertCutterWebSite: http://127.0.0.1:4173/");
});
