import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mapHtml } from "./localize.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist");
const config = JSON.parse(await readFile(resolve(root, "site.config.json"), "utf8"));
const english = JSON.parse(await readFile(resolve(root, "locales/en.json"), "utf8"));
const englishSize = config.downloadSize.replace(',', '.').replace(/Mo\b/, 'MB');

// Une seule source pour la version et la taille affichées : le HTML ne contient
// que des jetons, les scripts de secours les reçoivent en attributs data-*.
const tokens = {
  __GOATCOUNTER_CODE__: (process.env.GOATCOUNTER_CODE || "").trim(),
  __APP_VERSION__: config.appVersion,
  __DOWNLOAD_SIZE__: config.downloadSize,
  __BASE_PATH__: config.basePath,
};

const applyTokens = (html, values = tokens) =>
  Object.entries(values).reduce((result, [token, value]) => result.replaceAll(token, value), html);

await mkdir(dist, { recursive: true });

for (const name of ["assets", "fonts", "js", "guide"]) {
  await cp(resolve(root, name), resolve(dist, name), { recursive: true });
}

for (const name of ["robots.txt", "sitemap.xml"]) {
  await cp(resolve(root, name), resolve(dist, name));
}

for (const relative of ["index.html", "guide/index.html", "404.html"]) {
  const html = await readFile(resolve(root, relative), "utf8");
  const french = {};
  let localized = mapHtml(html, (value) => {
    if (!value) return value;
    if (!Object.hasOwn(english, value)) throw new Error(`Missing English translation in ${relative}: ${value}`);
    const translated = value === '__DOWNLOAD_SIZE__' ? englishSize : english[value];
    const original = value === '__DOWNLOAD_SIZE__' ? config.downloadSize : value;
    if (Object.hasOwn(french, translated) && french[translated] !== original) {
      throw new Error(`Ambiguous translation in ${relative}: ${translated}`);
    }
    french[translated] = original;
    return translated;
  }).replace('<html lang="fr"', '<html lang="en"');
  const prefix = relative === "404.html" ? "__BASE_PATH__/" : relative.startsWith("guide/") ? "../" : "";
  // The English HTML works without JS. Apply French before the deferred UI scripts.
  const messages = JSON.stringify(french).replaceAll('<', '\\u003c');
  localized = localized.replace('</body>', `<script id="locale-fr" type="application/json">${messages}</script>\n  <script src="${prefix}js/language.js"></script>\n</body>`);
  localized = applyTokens(localized, { ...tokens, __DOWNLOAD_SIZE__: englishSize });
  await writeFile(resolve(dist, relative), localized, "utf8");
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
