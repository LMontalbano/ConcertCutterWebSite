(() => {
  const owner = "LMontalbano";
  const repo = "ConcertCutter";
  const assetName = "ConcertCutter.exe";
  const fallbackUrl = `https://github.com/${owner}/${repo}/releases/latest/download/${assetName}`;
  const formatBytes = (bytes) => !Number.isFinite(bytes) || bytes <= 0 ? "28,1 Mo" : `${(bytes / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
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
      document.querySelectorAll(".release-version").forEach((element) => { element.textContent = release.tag_name || "v3.0"; });
      if (asset) {
        document.querySelectorAll(".download-link-exe").forEach((link) => { link.href = asset.browser_download_url || fallbackUrl; });
        document.querySelectorAll(".release-file-size").forEach((element) => { element.textContent = formatBytes(asset.size); });
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
