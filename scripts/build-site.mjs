import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist");
const config = JSON.parse(await readFile(resolve(root, "site.config.json"), "utf8"));

// Une seule source pour la version et la taille affichées : le HTML ne contient
// que des jetons, les scripts de secours les reçoivent en attributs data-*.
const tokens = {
  __GOATCOUNTER_CODE__: (process.env.GOATCOUNTER_CODE || "").trim(),
  __APP_VERSION__: config.appVersion,
  __DOWNLOAD_SIZE__: config.downloadSize,
  __BASE_PATH__: config.basePath,
};

const applyTokens = (html) =>
  Object.entries(tokens).reduce((result, [token, value]) => result.replaceAll(token, value), html);

await mkdir(dist, { recursive: true });

for (const name of ["assets", "fonts", "js", "guide"]) {
  await cp(resolve(root, name), resolve(dist, name), { recursive: true });
}

for (const name of ["robots.txt", "sitemap.xml"]) {
  await cp(resolve(root, name), resolve(dist, name));
}

for (const relative of ["index.html", "guide/index.html", "404.html"]) {
  const html = await readFile(resolve(root, relative), "utf8");
  await writeFile(resolve(dist, relative), applyTokens(html), "utf8");
}

const leftovers = new Set();
for (const relative of ["index.html", "guide/index.html", "404.html"]) {
  const html = await readFile(resolve(dist, relative), "utf8");
  for (const token of Object.keys(tokens)) {
    if (html.includes(token)) leftovers.add(`${relative}: ${token}`);
  }
}
if (leftovers.size) {
  console.error(`Jetons non remplacés :\n${[...leftovers].join("\n")}`);
  process.exit(1);
}
