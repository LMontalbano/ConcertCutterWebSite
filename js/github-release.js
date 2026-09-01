(() => {
  const owner = "LMontalbano";
  const repo = "ConcertCutter";
  const assetName = "ConcertCutter.exe";
  const fallbackUrl = `https://github.com/${owner}/${repo}/releases/latest/download/${assetName}`;
  // Les valeurs de secours sont injectées à la compilation : elles restent
  // identiques à celles déjà écrites dans le HTML.
  const dataset = document.currentScript?.dataset ?? {};
  const fallbackVersion = dataset.fallbackVersion?.trim() || "";
  const fallbackSize = dataset.fallbackSize?.trim() || "";
  const formatBytes = (bytes) => !Number.isFinite(bytes) || bytes <= 0 ? fallbackSize : `${(bytes / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
  document.querySelectorAll(".download-link-exe").forEach((link) => { link.href = fallbackUrl; });
  async function json(url) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal });
      if (!response.ok) throw new Error(String(response.status));
      return await response.json();
    } finally { window.clearTimeout(timer); }
  }
  async function enhanceRelease() {
    try {
      const release = await json(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
      const asset = release.assets?.find((candidate) => candidate.name === assetName);
      const version = release.tag_name || fallbackVersion;
      if (version) document.querySelectorAll(".release-version").forEach((element) => { element.textContent = version; });
      if (asset) {
        document.querySelectorAll(".download-link-exe").forEach((link) => { link.href = asset.browser_download_url || fallbackUrl; });
        const size = formatBytes(asset.size);
        if (size) document.querySelectorAll(".release-file-size").forEach((element) => { element.textContent = size; });
      }
    } catch { /* Le contenu de secours reste complet et téléchargeable. */ }
  }
  async function enhanceStars() {
    try {
      const data = await json(`https://api.github.com/repos/${owner}/${repo}`);
      if (!Number.isFinite(data.stargazers_count) || data.stargazers_count <= 0) return;
      document.querySelectorAll(".github-stars-count").forEach((element) => { element.textContent = String(data.stargazers_count); element.classList.remove("hidden"); });
    } catch { /* Ce compteur décoratif reste masqué. */ }
  }
  enhanceRelease();
  enhanceStars();
})();
