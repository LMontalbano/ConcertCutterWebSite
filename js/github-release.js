/**
 * ConcertCutter - GitHub Release & Stats Fetcher
 * Récupère dynamiquement la dernière release et les statistiques GitHub
 */

(function () {
  const REPO_OWNER = 'LMontalbano';
  const REPO_NAME = 'ConcertCutter';
  const DEFAULT_EXE_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download/ConcertCutter.exe`;
  const REPO_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const RELEASES_API_URL = `${REPO_API_URL}/releases/latest`;

  function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '~25 Mo';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function formatDate(isoString) {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  async function fetchGitHubData() {
    // 1. Fetch Latest Release
    try {
      const res = await fetch(RELEASES_API_URL);
      if (res.ok) {
        const release = await res.json();
        const tagName = release.tag_name || 'v3.0.0';
        const publishedDate = formatDate(release.published_at);
        
        // Find exe asset
        let exeAsset = release.assets ? release.assets.find(a => a.name.endsWith('.exe')) : null;
        let downloadUrl = exeAsset ? exeAsset.browser_download_url : DEFAULT_EXE_URL;
        let fileSize = exeAsset ? formatBytes(exeAsset.size) : '~25 Mo';

        // Update UI elements
        document.querySelectorAll('.release-version').forEach(el => {
          el.textContent = tagName;
        });

        document.querySelectorAll('.release-file-size').forEach(el => {
          el.textContent = fileSize;
        });

        if (publishedDate) {
          document.querySelectorAll('.release-date').forEach(el => {
            el.textContent = `Publié le ${publishedDate}`;
          });
        }

        document.querySelectorAll('.download-link-exe').forEach(el => {
          el.href = downloadUrl;
        });
      }
    } catch (err) {
      console.warn('Impossible de récupérer la release GitHub:', err);
    }

    // 2. Fetch Repo Stars
    try {
      const repoRes = await fetch(REPO_API_URL);
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        const stars = repoData.stargazers_count;
        if (typeof stars === 'number') {
          document.querySelectorAll('.github-stars-count').forEach(el => {
            el.textContent = stars.toString();
            el.classList.remove('hidden');
          });
        }
      }
    } catch (err) {
      console.warn('Impossible de récupérer les étoiles GitHub:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', fetchGitHubData);
})();
