(() => {
  const shortcuts = [
    ["Lire / mettre en pause", "Bouton de transport", ["Espace"], "Démarre ou suspend la lecture.", "lecture"],
    ["Placer la tête de lecture", "Clic dans la forme d’onde", ["Clic"], "Déplace le curseur sans lancer automatiquement le son.", "lecture"],
    ["Placer et écouter", "Double-clic dans la forme d’onde", ["Double-clic"], "Déplace le curseur et démarre l’écoute.", "lecture"],
    ["Promener la tête de lecture", "Saisir puis glisser", ["Glisser"], "Scrubbing fluide dans l’enregistrement.", "lecture"],
    ["Revenir au début", "Touche Début", ["Origine"], "Revient au début de la section, puis à la précédente.", "navigation"],
    ["Frontière précédente / suivante", "Flèches directionnelles", ["←", "→"], "Saute directement d’une frontière à l’autre.", "navigation"],
    ["Boucler un passage", "Bouton Boucler", ["B"], "Répète le passage sous la tête de lecture.", "lecture"],
    ["Arrêter la lecture", "Bouton de transport", ["Échap"], "Arrête l’écoute en cours.", "lecture"],
    ["Zoomer / dézoomer", "Molette sur la forme d’onde", ["Molette"], "Change l’échelle temporelle de la vue détaillée.", "navigation"],
    ["Déplacer la vue", "Glisser dans la vue globale", ["Glisser"], "Déplace la fenêtre temporelle affichée.", "navigation"],
    ["Déplacer une frontière", "Saisir la poignée", ["Glisser"], "Ajuste précisément le début ou la fin du segment.", "edition"],
    ["Ajuster par demi-seconde", "Boutons − et +", ["−", "+"], "Recule ou avance la frontière de 0,5 seconde.", "edition"],
    ["Saisir un horaire précis", "Champ Début ou Fin", ["Saisie"], "Accepte une position temporelle saisie au clavier.", "edition"],
    ["Ajouter une frontière", "Bouton Couper ici", ["C"], "Crée une coupe à la tête de lecture.", "edition"],
    ["Séparer un morceau", "Commande de séparation", ["Maj", "C"], "Crée deux pistes distinctes.", "edition"],
    ["Fusionner deux segments", "Bouton Fusionner", ["Suppr"], "Retire la frontière de fin sélectionnée.", "edition"],
    ["Garder / supprimer", "Boutons de sort", ["Bascule"], "Change le sort du segment cyan ou orange.", "edition"],
    ["Renommer un morceau", "Cliquer sur le titre", ["Entrée"], "Valide le nouveau titre ; Échap annule.", "edition"],
    ["Annuler", "Bouton historique", ["Ctrl", "Z"], "Annule la dernière modification.", "edition"],
    ["Rétablir", "Bouton historique", ["Ctrl", "Y"], "Rétablit la dernière modification annulée.", "edition"],
    ["Ouvrir l’export", "Bouton Exporter", ["Exporter"], "Choisit les morceaux, formats et destination.", "export"],
    ["Sélectionner les pistes", "Cases de la fenêtre d’export", ["Cocher"], "Conserve les numéros d’origine lors d’un export partiel.", "export"],
  ];
  const tbody = document.getElementById("shortcuts-body");
  const search = document.getElementById("shortcuts-search");
  const count = document.getElementById("shortcuts-count");
  const empty = document.getElementById("shortcuts-empty");
  const tabs = [...document.querySelectorAll(".shortcut-tab")];
  const labels = { lecture: "Lecture", navigation: "Navigation", edition: "Édition", export: "Export" };
  let category = "all";
  const makeCell = (className, text) => { const td = document.createElement("td"); td.className = className; td.textContent = text; return td; };
  function render() {
    if (!tbody) return;
    const query = search?.value.trim().toLocaleLowerCase("fr") || "";
    const rows = shortcuts.filter(([action, gesture, keys, detail, itemCategory]) => {
      const haystack = [action, gesture, ...keys, detail].join(" ").toLocaleLowerCase("fr");
      return (category === "all" || category === itemCategory) && (!query || haystack.includes(query));
    });
    tbody.replaceChildren();
    for (const [action, gesture, keys, detail, itemCategory] of rows) {
      const row = document.createElement("tr"); row.className = "hover:bg-raised/50";
      const actionCell = makeCell("px-4 py-3 text-sm font-bold text-ink", action);
      const mobileDetail = document.createElement("span"); mobileDetail.className = "mt-1 block text-xs font-normal leading-relaxed text-subtle md:hidden"; mobileDetail.textContent = detail; actionCell.append(mobileDetail);
      row.append(actionCell, makeCell("gesture-cell px-4 py-3 text-xs text-muted", gesture));
      const keyCell = document.createElement("td"); keyCell.className = "px-4 py-3";
      keys.forEach((key) => { const kbd = document.createElement("kbd"); kbd.className = "kbd mr-1"; kbd.textContent = key; keyCell.append(kbd); });
      row.append(keyCell, makeCell("detail-cell px-4 py-3 text-xs leading-relaxed text-subtle", detail), makeCell("category-cell px-4 py-3 text-right text-xs font-bold text-muted", labels[itemCategory]));
      tbody.append(row);
    }
    if (count) count.textContent = `${rows.length} commande${rows.length > 1 ? "s" : ""}`;
    empty?.classList.toggle("hidden", rows.length !== 0);
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
