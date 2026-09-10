import { expect, test } from '@playwright/test';

for (const [locale, language] of [['fr-FR', 'fr'], ['fr-CA', 'fr'], ['en-US', 'en'], ['en-GB', 'en'], ['de-DE', 'en']]) {
  test.describe(locale, () => {
    test.use({ locale });
    test('localizes all routes and dynamic controls', async ({ page }) => {
      await page.route('https://api.github.com/**', (route) => route.abort());
      await page.goto('/ConcertCutterWebSite/');
      const fr = language === 'fr';
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('h1')).toContainText(fr ? 'Découpez vos concerts.' : 'Cut your concerts.');
      await expect(page.locator('.release-file-size').first()).toHaveText(fr ? '32,6 Mo' : '32.6 MB');
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', fr ? 'fr_FR' : 'en_US');
      await expect(page.locator('.header-theme-toggle')).toHaveAttribute('aria-label', fr ? 'Activer le thème clair' : 'Switch to light theme');

      await page.goto('/ConcertCutterWebSite/guide/');
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page).toHaveTitle(fr ? 'Guide utilisateur — ConcertCutter' : 'User guide — ConcertCutter');
      const article = await page.locator('script[type="application/ld+json"]').evaluate((script) => JSON.parse(script.textContent));
      expect(article.inLanguage).toBe(fr ? 'fr-FR' : 'en-US');
      await page.getByRole('searchbox', { name: fr ? 'Rechercher un raccourci' : 'Search shortcuts' }).fill(fr ? 'annuler' : 'undo');
      const rows = page.locator('#shortcuts-body tr:visible');
      expect(await rows.count()).toBeGreaterThan(0);
      expect(await rows.count()).toBeLessThan(22);
      await expect(page.locator('#shortcuts-count')).toContainText(fr ? 'commande' : 'command');
      await page.getByRole('searchbox').fill('no-such-command');
      await expect(page.locator('#shortcuts-empty')).toBeVisible();
      await expect(page.locator('#shortcuts-count')).toHaveText(fr ? '0 commande' : '0 commands');

      const response = await page.goto('/ConcertCutterWebSite/missing/deep/page');
      expect(response.status()).toBe(404);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('h1')).toHaveText(fr ? 'Cette page n’existe pas.' : 'This page does not exist.');
    });
  });
}

for (const [languages, language] of [[['de-DE', 'fr-CA', 'en'], 'fr'], [['en', 'fr'], 'en'], [[], 'en']]) {
  test(`browser preferences ${JSON.stringify(languages)} select ${language}`, async ({ page }) => {
    await page.addInitScript((values) => {
      Object.defineProperty(navigator, 'languages', { value: values });
      Object.defineProperty(navigator, 'language', { value: '' });
    }, languages);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', language);
  });
}

test.describe('English without JavaScript', () => {
  test.use({ javaScriptEnabled: false, locale: 'fr-FR' });
  test('provides readable English on every page', async ({ page }) => {
    for (const path of ['/', '/guide/', '/404.html']) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).not.toContainText(/Découpez|téléchargement|n’existe/);
    }
  });
});

for (const width of [320, 390, 768, 1280]) {
  test(`English layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/guide/']) {
      await page.goto(path);
      expect(await page.evaluate(() => {
        document.body.style.overflowX = 'visible';
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      })).toBeLessThanOrEqual(0);
      if (width < 1280) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await expect(page.locator('#mobile-menu')).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
  });
}

test('formats successful release API responses in English', async ({ page }) => {
  await page.route('https://api.github.com/**', (route) => route.fulfill({ json: {
    tag_name: 'v4.0', assets: [{ name: 'ConcertCutter.exe', size: 30 * 1024 * 1024 }],
  } }));
  await page.goto('/');
  await expect(page.locator('.release-version').first()).toHaveText('v4.0');
  await expect(page.locator('.release-file-size').first()).toHaveText('30 MB');
});
