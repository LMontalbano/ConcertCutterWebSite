import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const dist = resolve(root, "dist");
const analyticsCode = (process.env.GOATCOUNTER_CODE || "").trim();

await mkdir(dist, { recursive: true });

for (const name of ["assets", "fonts", "js", "guide"]) {
  await cp(resolve(root, name), resolve(dist, name), { recursive: true });
}

for (const name of ["robots.txt", "sitemap.xml"]) {
  await cp(resolve(root, name), resolve(dist, name));
}

for (const relative of ["index.html", "guide/index.html"]) {
  const source = resolve(root, relative);
  const destination = resolve(dist, relative);
  const html = (await readFile(source, "utf8")).replaceAll(
    "__GOATCOUNTER_CODE__",
    analyticsCode,
  );
  await writeFile(destination, html, "utf8");
}
