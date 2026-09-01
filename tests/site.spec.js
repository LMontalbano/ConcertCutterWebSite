import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const downloadUrl = "https://github.com/LMontalbano/ConcertCutter/releases/latest/download/ConcertCutter.exe";

for (const width of [320, 390, 768, 1024, 1280]) {
  test(`landing responsive à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.route("https://api.github.com/**", (route) => route.abort());
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Découpez vos concerts");
    if (width < 1280) {
      const open = page.getByRole("button", { name: "Ouvrir le menu" });
      await expect(open).toBeVisible();
      await open.click();
      await expect(open).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(open).toHaveAttribute("aria-expanded", "false");
    }
  });
}

test("les téléchargements gardent une URL stable sans API", async ({ page }) => {
  await page.route("https://api.github.com/**", (route) => route.abort());
  await page.goto("/");
  for (const link of await page.locator(".download-link-exe").all()) {
    await expect(link).toHaveAttribute("href", downloadUrl);
  }
});

test("FAQ et guide sont utilisables au clavier", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator(".faq-trigger").first();
  await faq.focus();
  await page.keyboard.press("Enter");
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await page.goto("/guide/");
  const secondSmartTab = page.getByRole("tab", { name: "2. Les détails" });
  await secondSmartTab.focus();
  await page.keyboard.press("Enter");
  await expect(secondSmartTab).toHaveAttribute("aria-selected", "true");
  await page.getByRole("searchbox", { name: "Rechercher un raccourci" }).fill("couper");
  await expect(page.locator("#shortcuts-count")).toContainText("commande");
});

for (const path of ["/", "/guide/"]) {
  for (const theme of ["dark", "light"]) {
    test(`axe sans violation grave sur ${path} en thème ${theme}`, async ({ page }) => {
      await page.addInitScript((selectedTheme) => localStorage.setItem("concertcutter-theme", selectedTheme), theme);
      await page.route("https://api.github.com/**", (route) => route.abort());
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const important = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact));
      expect(important, important.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
    });
  }
}

test("aucun runtime Tailwind ou analytics sur localhost", async ({ page }) => {
  await page.goto("/");
  const sources = await page.locator("script[src]").evaluateAll((scripts) => scripts.map((script) => script.src));
  expect(sources.some((source) => source.includes("cdn.tailwindcss.com"))).toBe(false);
  expect(sources.some((source) => source.includes("gc.zgo.at"))).toBe(false);
});

test("les deux routes et leurs ressources fonctionnent sous le sous-chemin GitHub Pages", async ({ page }) => {
  for (const path of ["/ConcertCutterWebSite/", "/ConcertCutterWebSite/guide/"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("link[rel=stylesheet]")).toHaveAttribute("href", /css\/site\.css$/);
    const firstImage = page.locator("main img").first();
    if (await firstImage.count()) {
      expect(await firstImage.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
  }
});

test("le thème choisi est mémorisé et synchronise les captures du guide", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    if (!localStorage.getItem("concertcutter-theme")) localStorage.setItem("concertcutter-theme", "light");
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const toggle = page.locator(".header-theme-toggle");
  await expect(toggle).toHaveAttribute("aria-label", "Activer le thème sombre");
  expect(await page.locator("#mock-waveform-canvas").evaluate((canvas) => canvas.width > 0 && canvas.height > 0)).toBe(true);
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("concertcutter-theme"))).toBe("dark");

  await page.goto("/guide/");
  const guideImage = page.locator("[data-theme-src-dark]").first();
  const cutImage = page.locator("#corriger [data-theme-src-dark]");
  await expect(guideImage).toHaveAttribute("src", /concert-editor-dark\.png$/);
  await expect(cutImage).toHaveAttribute("src", /concert-cut-dark\.png$/);
  await page.locator(".header-theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(guideImage).toHaveAttribute("src", /concert-editor-light\.png$/);
  await expect(cutImage).toHaveAttribute("src", /concert-cut-light\.png$/);
});

test("les captures du guide s’agrandissent au clavier", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/guide/");
  const openButton = page.getByRole("button", { name: "Agrandir la capture de l’analyse" });
  await openButton.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Capture agrandie" });
  await expect(dialog).toBeVisible();
  const dialogImage = dialog.locator("[data-shot-image]");
  await expect(dialogImage).toHaveAttribute("src", /concert-editor-dark\.png$/);
  const imageLayout = await dialogImage.evaluate((image) => {
    const frame = image.parentElement;
    if (!frame) return null;
    const imageBounds = image.getBoundingClientRect();
    const frameBounds = frame.getBoundingClientRect();
    const frameStyle = getComputedStyle(frame);
    return {
      overflowX: frameStyle.overflowX,
      overflowY: frameStyle.overflowY,
      image: { left: imageBounds.left, right: imageBounds.right, top: imageBounds.top, bottom: imageBounds.bottom },
      frame: { left: frameBounds.left, right: frameBounds.right, top: frameBounds.top, bottom: frameBounds.bottom },
    };
  });
  expect(imageLayout).not.toBeNull();
  expect(imageLayout?.overflowX).toBe("hidden");
  expect(imageLayout?.overflowY).toBe("hidden");
  expect(imageLayout?.image.left).toBeGreaterThanOrEqual((imageLayout?.frame.left || 0) - 1);
  expect(imageLayout?.image.right).toBeLessThanOrEqual((imageLayout?.frame.right || 0) + 1);
  expect(imageLayout?.image.top).toBeGreaterThanOrEqual((imageLayout?.frame.top || 0) - 1);
  expect(imageLayout?.image.bottom).toBeLessThanOrEqual((imageLayout?.frame.bottom || 0) + 1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
});

test("l’animation du mockup respecte la réduction des mouvements", async ({ page }) => {
  await page.goto("/");
  const playhead = page.locator(".mock-playhead");
  await expect(playhead).toHaveCSS("animation-name", "mock-playback");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(playhead).toHaveCSS("animation-name", "none");
});
