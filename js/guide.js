(() => {
  // Les lignes sont écrites dans le HTML : la table reste lisible sans
  // JavaScript et indexable par les moteurs. Ce script ne fait que filtrer.
  const rows = [...document.querySelectorAll("#shortcuts-body tr")];
  const search = document.getElementById("shortcuts-search");
  const count = document.getElementById("shortcuts-count");
  const empty = document.getElementById("shortcuts-empty");
  const tabs = [...document.querySelectorAll(".shortcut-tab")];
  let category = "all";
  function render() {
    if (!rows.length) return;
    const query = search?.value.trim().toLocaleLowerCase("fr") || "";
    let visible = 0;
    for (const row of rows) {
      const matches = (category === "all" || row.dataset.category === category)
        && (!query || (row.dataset.search || "").includes(query));
      row.hidden = !matches;
      if (matches) visible += 1;
    }
    if (count) count.textContent = `${visible} commande${visible > 1 ? "s" : ""}`;
    empty?.classList.toggle("hidden", visible !== 0);
  }
  search?.addEventListener("input", render);
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    category = tab.dataset.category || "all";
    tabs.forEach((other) => { const active = other === tab; other.setAttribute("aria-selected", String(active)); other.classList.toggle("bg-accent", active); other.classList.toggle("text-[#061a1e]", active); other.classList.toggle("border", !active); other.classList.toggle("border-border", !active); other.classList.toggle("bg-raised", !active); other.classList.toggle("text-muted", !active); });
    render();
  }));
  render();
  const smartTabs = [...document.querySelectorAll(".smart-tab")];
  function selectSmartTab(tab) {
    smartTabs.forEach((other) => { const active = other === tab; other.setAttribute("aria-selected", String(active)); other.tabIndex = active ? 0 : -1; other.classList.toggle("bg-accent", active); other.classList.toggle("text-[#061a1e]", active); other.classList.toggle("border", !active); other.classList.toggle("border-border", !active); other.classList.toggle("bg-raised", !active); other.classList.toggle("text-muted", !active); const panel = document.getElementById(other.getAttribute("aria-controls")); if (panel) panel.hidden = !active; });
  }
  smartTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectSmartTab(tab));
    tab.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); let next = index; if (event.key === "ArrowLeft") next = (index - 1 + smartTabs.length) % smartTabs.length; if (event.key === "ArrowRight") next = (index + 1) % smartTabs.length; if (event.key === "Home") next = 0; if (event.key === "End") next = smartTabs.length - 1; selectSmartTab(smartTabs[next]); smartTabs[next].focus(); });
  });

  const shotDialog = document.getElementById("shot-dialog");
  const shotDialogImage = shotDialog?.querySelector("[data-shot-image]");
  const shotDialogCaption = document.getElementById("shot-dialog-caption");
  const shotDialogClose = shotDialog?.querySelector("[data-shot-close]");
  let activeShotButton = null;

  function syncOpenShot() {
    const thumbnail = activeShotButton?.querySelector("img");
    if (!(thumbnail instanceof HTMLImageElement) || !(shotDialogImage instanceof HTMLImageElement)) return;
    shotDialogImage.src = thumbnail.getAttribute("src") || thumbnail.currentSrc;
    shotDialogImage.alt = thumbnail.alt;
  }

  document.querySelectorAll("[data-shot-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const thumbnail = button.querySelector("img");
      if (!(thumbnail instanceof HTMLImageElement)) return;
      if (!(shotDialog instanceof HTMLDialogElement) || typeof shotDialog.showModal !== "function") {
        window.open(thumbnail.currentSrc || thumbnail.src, "_blank", "noopener,noreferrer");
        return;
      }
      activeShotButton = button;
      syncOpenShot();
      const caption = button.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || thumbnail.alt;
      if (shotDialogCaption) shotDialogCaption.textContent = caption;
      shotDialog.showModal();
      document.body.style.overflow = "hidden";
      shotDialogClose?.focus();
    });
  });

  shotDialogClose?.addEventListener("click", () => shotDialog?.close());
  shotDialog?.addEventListener("click", (event) => {
    if (event.target === shotDialog) shotDialog.close();
  });
  shotDialog?.addEventListener("close", () => {
    document.body.style.overflow = "";
    activeShotButton?.focus();
    activeShotButton = null;
    if (shotDialogImage instanceof HTMLImageElement) shotDialogImage.removeAttribute("src");
  });
  window.addEventListener("concertcutter:themechange", () => {
    if (shotDialog?.open) syncOpenShot();
  });
})();
