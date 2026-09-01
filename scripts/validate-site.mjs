import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const landing = await readFile(resolve(root, "index.html"), "utf8");
const guide = await readFile(resolve(root, "guide/index.html"), "utf8");
const notFound = await readFile(resolve(root, "404.html"), "utf8");

const failures = [];
const requireIn = (html, label, pattern, message) => {
  if (!pattern.test(html)) failures.push(`${label}: ${message}`);
};

for (const [label, html] of [["landing", landing], ["guide", guide]]) {
  requireIn(html, label, /<main\b/, "élément <main> absent");
  requireIn(html, label, /rel="canonical"/, "URL canonique absente");
  requireIn(html, label, /property="og:image"/, "image Open Graph absente");
  requireIn(html, label, /application\/ld\+json/, "données structurées absentes");
  requireIn(html, label, /<script src="[^"]*theme-init\.js"><\/script>/, "amorce de thème synchrone absente");
  if (/cdn\.tailwindcss\.com/.test(html)) failures.push(`${label}: CDN Tailwind encore présent`);
}

for (const [label, html] of [["landing", landing], ["guide", guide], ["404", notFound]]) {
  const leftover = html.match(/__[A-Z_]+__/);
  if (leftover) failures.push(`${label}: jeton de compilation non remplacé (${leftover[0]})`);
}

requireIn(landing, "landing", /data-goatcounter-click="download-hero"/, "événement du CTA hero absent");
requireIn(landing, "landing", /"@type": "FAQPage"/, "données structurées FAQ absentes");
requireIn(guide, "guide", /id="shortcuts-search"/, "recherche des raccourcis absente");
requireIn(guide, "guide", /<tbody id="shortcuts-body"[^>]*>\s*<tr/, "table des raccourcis non pré-rendue");
requireIn(notFound, "404", /<main\b/, "élément <main> absent");

// Les questions existent en double : dans l’accordéon et dans le JSON-LD.
// Google sanctionne une FAQ structurée qui ne correspond pas à la page.
const structurees = [...landing.matchAll(/"@type": "Question",\s*"name": "([^"]+)"/g)].map((match) => match[1]);
const affichees = [...landing.matchAll(/id="faq-[a-z-]+-trigger">([^<]+)</g)].map((match) => match[1]);
if (!structurees.length) {
  failures.push("landing: aucune question dans les données structurées");
}
for (const question of structurees) {
  if (!affichees.includes(question)) {
    failures.push(`landing: la question « ${question} » est dans le JSON-LD mais pas dans la FAQ visible`);
  }
}
for (const question of affichees) {
  if (!structurees.includes(question)) {
    failures.push(`landing: la question « ${question} » est dans la FAQ visible mais pas dans le JSON-LD`);
  }
}

// GitHub Pages sert 404.html à n’importe quelle profondeur : cette page est la
// seule à devoir pointer ses ressources en absolu. Si le dépôt est renommé ou
// passe sur un domaine dédié, la 404 perdrait sa mise en forme en silence.
const canonical = landing.match(/rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) {
  failures.push("landing: URL canonique illisible");
} else {
  const expected = new URL(canonical).pathname.replace(/\/$/, "");
  const used = notFound.match(/href="([^"]*)\/css\/site\.css"/)?.[1];
  if (used !== expected) {
    failures.push(`404: chemin de base "${used}" incohérent avec l’URL canonique ("${expected}") — corriger basePath dans site.config.json`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Validation structurelle réussie.");
