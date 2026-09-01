import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("../dist", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const landing = await readFile(resolve(root, "index.html"), "utf8");
const guide = await readFile(resolve(root, "guide/index.html"), "utf8");

const failures = [];
const requireIn = (html, label, pattern, message) => {
  if (!pattern.test(html)) failures.push(`${label}: ${message}`);
};

for (const [label, html] of [["landing", landing], ["guide", guide]]) {
  requireIn(html, label, /<main\b/, "élément <main> absent");
  requireIn(html, label, /rel="canonical"/, "URL canonique absente");
  requireIn(html, label, /property="og:image"/, "image Open Graph absente");
  requireIn(html, label, /application\/ld\+json/, "données structurées absentes");
  if (/cdn\.tailwindcss\.com/.test(html)) failures.push(`${label}: CDN Tailwind encore présent`);
}

requireIn(landing, "landing", /data-goatcounter-click="download-hero"/, "événement du CTA hero absent");
requireIn(guide, "guide", /id="shortcuts-search"/, "recherche des raccourcis absente");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validation structurelle réussie.");
