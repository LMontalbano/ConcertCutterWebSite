// Translate only human-readable HTML values, never URLs, classes or IDs.
export function mapHtml(html, translate) {
  return html.replace(/<!--[^]*?-->|<script\b[^]*?<\/script>|<[^>]+>|[^<]+/g, (part) => {
    if (part.startsWith('<!--')) return part;
    if (part.startsWith('<script')) {
      if (!part.includes('application/ld+json')) return part;
      return part.replace(/>([^]*)<\/script>/, (_, json) => `>${JSON.stringify(JSON.parse(json), (key, value) =>
        typeof value === 'string' && ['name', 'headline', 'description', 'text', 'inLanguage'].includes(key) ? translate(value) : value, 2)}</script>`);
    }
    if (part.startsWith('<')) {
      return part.replace(/\b(alt|aria-label|title|placeholder|content)="([^"]*)"/g, (attribute, name, value) => {
        if (name === 'content' && !/\b(?:name|property)="(?:description|og:(?:title|description|image:alt|locale)|twitter:(?:title|description))"/.test(part)) return attribute;
        return `${name}="${translate(value)}"`;
      });
    }
    return part.replace(/\S[^]*\S|\S/g, (value) => translate(value));
  });
}
