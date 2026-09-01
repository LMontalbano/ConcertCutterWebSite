(() => {
  const root = document.documentElement;
  const themeButtons = [...document.querySelectorAll(".theme-toggle")];
  const themeImages = [...document.querySelectorAll("[data-theme-src-dark][data-theme-src-light]")];
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function applyTheme(theme, { persist = false } = {}) {
    root.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme === "light" ? "#f4f7fa" : "#0e1116");
    if (persist) {
      try { localStorage.setItem("concertcutter-theme", theme); } catch { /* Storage may be disabled. */ }
    }
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeButtons.forEach((button) => {
      button.setAttribute("aria-label", `Activer le thème ${nextTheme === "light" ? "clair" : "sombre"}`);
      button.setAttribute("title", `Activer le thème ${nextTheme === "light" ? "clair" : "sombre"}`);
      button.setAttribute("aria-pressed", String(theme === "light"));
    });
    themeImages.forEach((image) => {
      const nextSource = image.dataset[theme === "light" ? "themeSrcLight" : "themeSrcDark"];
      if (nextSource && image.getAttribute("src") !== nextSource) image.setAttribute("src", nextSource);
    });
    window.dispatchEvent(new CustomEvent("concertcutter:themechange", { detail: { theme } }));
  }

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");
  themeButtons.forEach((button) => button.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "light" ? "dark" : "light", { persist: true });
  }));
  systemTheme.addEventListener("change", (event) => {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("concertcutter-theme"); } catch { /* Storage may be disabled. */ }
    if (!savedTheme) applyTheme(event.matches ? "light" : "dark");
  });

  const waveformCanvas = document.getElementById("mock-waveform-canvas");
  function drawMockWaveform() {
    if (!(waveformCanvas instanceof HTMLCanvasElement)) return;
    const bounds = waveformCanvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    waveformCanvas.width = Math.round(bounds.width * scale);
    waveformCanvas.height = Math.round(bounds.height * scale);
    const context = waveformCanvas.getContext("2d");
    if (!context) return;
    context.scale(scale, scale);
    const width = bounds.width;
    const height = bounds.height;
    const middle = height / 2;
    const styles = getComputedStyle(root);
    const accent = styles.getPropertyValue("--cc-accent").trim() || "#22b8cf";
    const cut = styles.getPropertyValue("--cc-cut").trim() || "#ff9248";
    const grid = styles.getPropertyValue("--cc-grid").trim() || "rgba(45,53,66,.18)";

    context.clearRect(0, 0, width, height);
    context.strokeStyle = grid;
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 42) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y <= height; y += 42) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
    context.strokeStyle = grid;
    context.beginPath(); context.moveTo(0, middle); context.lineTo(width, middle); context.stroke();

    const top = [];
    const bottom = [];
    const samples = Math.max(180, Math.ceil(width / 1.5));
    for (let index = 0; index <= samples; index += 1) {
      const position = index / samples;
      const x = position * width;
      const noiseA = Math.abs(Math.sin(index * 12.9898 + 1.873) * 43758.5453) % 1;
      const noiseB = Math.abs(Math.sin(index * 4.731 + 8.219) * 24634.6345) % 1;
      const phrase = 0.76 + 0.12 * Math.sin(position * Math.PI * 5.3) + 0.08 * Math.sin(position * Math.PI * 13.7);
      const quietBreak = 1 - 0.72 * Math.exp(-Math.pow((position - 0.405) / 0.013, 2));
      const edgeFade = Math.min(1, position * 18, (1 - position) * 18);
      const amplitude = Math.max(3, height * 0.39 * phrase * quietBreak * edgeFade * (0.72 + noiseA * 0.24 + noiseB * 0.08));
      const asymmetry = (noiseB - 0.5) * height * 0.045;
      top.push([x, middle - amplitude - asymmetry]);
      bottom.push([x, middle + amplitude - asymmetry]);
    }

    const waveformPath = new Path2D();
    waveformPath.moveTo(top[0][0], top[0][1]);
    top.slice(1).forEach(([x, y]) => waveformPath.lineTo(x, y));
    [...bottom].reverse().forEach(([x, y]) => waveformPath.lineTo(x, y));
    waveformPath.closePath();
    context.globalAlpha = root.dataset.theme === "light" ? 0.92 : 0.94;
    context.fillStyle = accent;
    context.fill(waveformPath);
    context.save();
    context.beginPath();
    context.rect(width * 0.455, 0, width * 0.09, height);
    context.clip();
    context.fillStyle = cut;
    context.fill(waveformPath);
    context.restore();
    context.globalAlpha = 1;
  }

  if (waveformCanvas) {
    const waveformObserver = new ResizeObserver(drawMockWaveform);
    waveformObserver.observe(waveformCanvas);
    window.addEventListener("concertcutter:themechange", drawMockWaveform);
    drawMockWaveform();
  }

  const menuButton = document.getElementById("menu-open");
  const menu = document.getElementById("mobile-menu");
  const closeButton = document.getElementById("menu-close");
  let previousFocus = null;
  const focusable = () => menu ? [...menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')] : [];
  function openMenu() {
    if (!menu || !menuButton) return;
    previousFocus = document.activeElement;
    menu.inert = false;
    menu.setAttribute("aria-hidden", "false");
    menu.classList.remove("invisible", "translate-x-full");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeButton?.focus();
  }
  function closeMenu({ restoreFocus = true } = {}) {
    if (!menu || !menuButton) return;
    menu.classList.add("translate-x-full", "invisible");
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;
    menuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (restoreFocus && previousFocus instanceof HTMLElement) previousFocus.focus();
  }
  menuButton?.addEventListener("click", openMenu);
  closeButton?.addEventListener("click", () => closeMenu());
  menu?.querySelectorAll(".mobile-menu-link").forEach((link) => link.addEventListener("click", () => closeMenu({ restoreFocus: false })));
  document.addEventListener("keydown", (event) => {
    if (!menu || menu.getAttribute("aria-hidden") === "true") return;
    if (event.key === "Escape") { event.preventDefault(); closeMenu(); return; }
    if (event.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1280 && menu?.getAttribute("aria-hidden") === "false") closeMenu({ restoreFocus: false });
  });
  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    const triggers = [...accordion.querySelectorAll(".faq-trigger")];
    triggers.forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      trigger.addEventListener("click", () => {
        const willOpen = trigger.getAttribute("aria-expanded") !== "true";
        triggers.forEach((other) => {
          const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          other.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });
        trigger.setAttribute("aria-expanded", String(willOpen));
        panel.hidden = !willOpen;
      });
    });
  });
})();
