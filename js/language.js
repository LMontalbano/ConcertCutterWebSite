(() => {
  // Respect the browser's preference order among supported languages.
  // Unsupported or unavailable preferences fall back to English.
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  const language = preferences.map((locale) => String(locale || '').toLowerCase().split(/[-_]/)[0])
    .find((locale) => locale === 'fr' || locale === 'en') || 'en';
  document.documentElement.lang = language;
  const dictionary = document.getElementById('locale-fr');
  if (language === 'fr' && dictionary) {
    const messages = JSON.parse(dictionary.textContent);
    const translate = (value) => value.replace(/\S[^]*\S|\S/g, (text) => messages[text] ?? text);
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => ['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    while (walker.nextNode()) walker.currentNode.textContent = translate(walker.currentNode.textContent);
    document.querySelectorAll('[alt], [aria-label], [title], [placeholder], meta[content]').forEach((element) => {
      for (const name of ['alt', 'aria-label', 'title', 'placeholder', 'content']) {
        if (element.hasAttribute(name)) element.setAttribute(name, translate(element.getAttribute(name)));
      }
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      script.textContent = JSON.stringify(JSON.parse(script.textContent), (key, value) =>
        typeof value === 'string' && ['name', 'headline', 'description', 'text', 'inLanguage'].includes(key)
          ? translate(value) : value);
    });
    document.querySelectorAll('[data-fallback-size]').forEach((script) => {
      script.dataset.fallbackSize = translate(script.dataset.fallbackSize);
    });
  }
  dictionary?.remove();
})();
