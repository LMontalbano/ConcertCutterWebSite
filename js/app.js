/**
 * ConcertCutter - Main Web Application Logic
 * Gestion des interactions, recherche de raccourcis, FAQ et démonstration interactive
 */

(function () {
  // --- Données des gestes et raccourcis de ConcertCutter ---
  const SHORTCUTS_DATA = [
    {
      action: "Lire / Mettre en pause",
      keys: ["Espace"],
      gesture: "Bouton de transport ou Espace",
      desc: "Démarre ou suspend la lecture audio continue.",
      category: "lecture"
    },
    {
      action: "Placer la tête de lecture",
      keys: ["Clic"],
      gesture: "Clic simple dans le tracé",
      desc: "Positionne le curseur sans lancer automatiquement le son.",
      category: "lecture"
    },
    {
      action: "Placer et écouter immédiatement",
      keys: ["Double-clic"],
      gesture: "Double-clic dans la forme d'onde",
      desc: "Déplace la tête de lecture et démarre instantanément l'écoute.",
      category: "lecture"
    },
    {
      action: "Promener la tête de lecture",
      keys: ["Glisser"],
      gesture: "Saisir la tête de lecture et la glisser",
      desc: "Scrubbing fluide à travers l'enregistrement.",
      category: "lecture"
    },
    {
      action: "Revenir au début d'une section",
      keys: ["Origine (Home)"],
      gesture: "Touche Début du clavier",
      desc: "Revient au début de la section courante. Appuyé deux fois de suite : section précédente.",
      category: "navigation"
    },
    {
      action: "Aller de frontière en frontière",
      keys: ["←", "→"],
      gesture: "Flèches directionnelles",
      desc: "Saute directement à la coupe précédente ou suivante.",
      category: "navigation"
    },
    {
      action: "Répéter un passage (Boucle)",
      keys: ["B"],
      gesture: "Touche B",
      desc: "Joue en boucle le passage sélectionné pour caler une coupe à l'oreille.",
      category: "lecture"
    },
    {
      action: "Écouter à partir d'un segment",
      keys: ["▶"],
      gesture: "Bouton ▶ sur la ligne du tableau",
      desc: "Démarre la lecture à partir de cette piste. Un second clic met en pause.",
      category: "lecture"
    },
    {
      action: "Se déplacer dans le concert",
      keys: ["Clic barre"],
      gesture: "Clic sur la barre de progression globale",
      desc: "Navigation rapide à n'importe quel moment des 2h de concert.",
      category: "navigation"
    },
    {
      action: "Zoomer / Dézoomer",
      keys: ["Molette"],
      gesture: "Molette sur la forme d'onde",
      desc: "Zoom temporel haute précision sur les transitoires audio.",
      category: "navigation"
    },
    {
      action: "Faire défiler la vue (Pan)",
      keys: ["Maj + Glisser"],
      gesture: "Maj + Glisser ou clic dans la vue d'ensemble",
      desc: "Déplace la fenêtre temporelle visible horizontalement.",
      category: "navigation"
    },
    {
      action: "Écouter une coupe (Pré-écoute)",
      keys: ["Clic frontière"],
      gesture: "Cliquer sur une ligne de frontière",
      desc: "Démarre l'écoute 5 secondes avant la coupe pour vérifier la transition.",
      category: "edition"
    },
    {
      action: "Déplacer une frontière",
      keys: ["Glisser frontière"],
      gesture: "Saisir la barre et la glisser",
      desc: "Ajuste précisément le point de découpe sans lancer la lecture.",
      category: "edition"
    },
    {
      action: "Saisir un horaire précis",
      keys: ["Saisie texte"],
      gesture: "Cliquer colonne Début ou Fin et taper '12:34'",
      desc: "Prend en charge '12:34', '1:02:14' ou '754' (en secondes).",
      category: "edition"
    },
    {
      action: "Poser une frontière (Couper)",
      keys: ["C"],
      gesture: "Bouton 'Couper' ou touche C",
      desc: "Insère une coupe au curseur sans rien effacer. Fonctionne dans un morceau comme dans un blanc.",
      category: "edition"
    },
    {
      action: "Séparer en deux pistes distinctes",
      keys: ["Maj + C"],
      gesture: "Bouton 'Séparer' ou Maj+C",
      desc: "Insère le blanc nécessaire (2s) pour créer 2 pistes distinctes d'un même morceau.",
      category: "edition"
    },
    {
      action: "Fusionner deux segments",
      keys: ["Suppr"],
      gesture: "Sélectionner la frontière puis touche Suppr",
      desc: "Efface la séparation et réunit les deux zones en une seule.",
      category: "edition"
    },
    {
      action: "Garder / Supprimer un passage",
      keys: ["Bascule"],
      gesture: "Cliquer la colonne Action du tableau",
      desc: "Bascule instantanément entre Conservé (Bleu) et Retiré (Orange).",
      category: "edition"
    },
    {
      action: "Nommer / Renommer un morceau",
      keys: ["Entrée"],
      gesture: "Cliquer le nom dans la colonne Morceau",
      desc: "Ouvre le champ de saisie direct. 'Entrée' valide, 'Échap' annule.",
      category: "organisation"
    },
    {
      action: "Annuler / Rétablir",
      keys: ["Ctrl + Z", "Ctrl + Y"],
      gesture: "Raccourci standard ou boutons de l'interface",
      desc: "Historique de 50 actions réversibles (déplacements, coupes, bascules).",
      category: "edition"
    },
    {
      action: "Export Vidéo Diaporama (YouTube)",
      keys: ["Fenetre Export"],
      gesture: "Cocher l'option Vidéo dans l'export",
      desc: "Génère un diaporama MP4 animé avec le titre du morceau en surimpression.",
      category: "export"
    },
    {
      action: "Sélectionner les morceaux à exporter",
      keys: ["Fenetre Export"],
      gesture: "Cocher/décocher dans la liste d'export",
      desc: "Permet d'exporter seulement 1 ou 2 morceaux pour une démo sans casser la numérotation globale.",
      category: "export"
    }
  ];

  // --- Initialisation du tableau des raccourcis ---
  function initShortcutsTable() {
    const tbody = document.getElementById('shortcuts-tbody');
    const searchInput = document.getElementById('shortcuts-search');
    const categoryTabs = document.querySelectorAll('.shortcut-tab');
    const resultCount = document.getElementById('shortcuts-count');
    const emptyState = document.getElementById('shortcuts-empty');

    if (!tbody) return;

    let currentCategory = 'all';
    let currentSearchTerm = '';

    function render() {
      const filtered = SHORTCUTS_DATA.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = currentSearchTerm === '' || 
          item.action.toLowerCase().includes(currentSearchTerm) ||
          item.desc.toLowerCase().includes(currentSearchTerm) ||
          item.gesture.toLowerCase().includes(currentSearchTerm) ||
          item.keys.some(k => k.toLowerCase().includes(currentSearchTerm));
        return matchesCategory && matchesSearch;
      });

      tbody.innerHTML = '';

      if (filtered.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (resultCount) resultCount.textContent = '0 résultat';
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');
      if (resultCount) resultCount.textContent = `${filtered.length} commande${filtered.length > 1 ? 's' : ''}`;

      filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-border/40 hover:bg-surface-raised/60 transition-colors';

        // Badge category color
        let catBadge = '';
        if (item.category === 'lecture') {
          catBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-accent/15 text-accent border border-accent/20">Lecture</span>';
        } else if (item.category === 'navigation') {
          catBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/20">Navigation</span>';
        } else if (item.category === 'edition') {
          catBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gap/15 text-gap border border-gap/20">Édition</span>';
        } else if (item.category === 'organisation') {
          catBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">Titres</span>';
        } else {
          catBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20">Export</span>';
        }

        const keysHtml = item.keys.map(k => `<kbd class="custom-kbd">${k}</kbd>`).join(' ');

        tr.innerHTML = `
          <td class="py-3 px-4">
            <div class="font-semibold text-ink text-sm">${item.action}</div>
            <div class="text-xs text-ink-3 mt-0.5 sm:hidden">${item.desc}</div>
          </td>
          <td class="py-3 px-4 hidden sm:table-cell">
            <div class="text-xs text-ink-2">${item.gesture}</div>
          </td>
          <td class="py-3 px-4">
            <div class="flex flex-wrap gap-1.5 items-center">${keysHtml}</div>
          </td>
          <td class="py-3 px-4 hidden md:table-cell">
            <div class="text-xs text-ink-3 leading-relaxed">${item.desc}</div>
          </td>
          <td class="py-3 px-4 text-right hidden lg:table-cell">
            ${catBadge}
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim().toLowerCase();
        render();
      });
    }

    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => {
          t.classList.remove('bg-accent', 'text-on-accent', 'font-semibold');
          t.classList.add('bg-surface-raised', 'text-ink-2');
        });
        tab.classList.add('bg-accent', 'text-on-accent', 'font-semibold');
        tab.classList.remove('bg-surface-raised', 'text-ink-2');
        currentCategory = tab.dataset.category || 'all';
        render();
      });
    });

    render();
  }

  // --- Initialisation de la FAQ pliable ---
  function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header');
      if (header) {
        header.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // --- Menu Mobile Toggle ---
  function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuDrawer = document.getElementById('mobile-menu-drawer');
    const closeBtn = document.getElementById('mobile-menu-close');
    const menuLinks = document.querySelectorAll('.mobile-nav-link');

    if (!menuBtn || !menuDrawer) return;

    function openMenu() {
      menuDrawer.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuDrawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));
  }

  // --- Canvas Waveform Animation & Interaction Demo ---
  function initWaveformDemo() {
    const canvas = document.getElementById('hero-waveform-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    
    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      width = rect.width;
      height = rect.height;
    }

    window.addEventListener('resize', resize);
    resize();

    // Définition des segments (temps 0 à 100%)
    // Bleu = Conservé (Morceaux), Orange = Retiré (Blancs / Applaudissements)
    const segments = [
      { start: 0.00, end: 0.05, type: 'gap', title: 'Entrée en scène & bruits de salle' },
      { start: 0.05, end: 0.32, type: 'keep', title: '01 - Ouverture & Premier Titre' },
      { start: 0.32, end: 0.38, type: 'gap', title: 'Applaudissements & Discussion' },
      { start: 0.38, end: 0.65, type: 'keep', title: '02 - Le Long Chemin (Solo)' },
      { start: 0.65, end: 0.72, type: 'gap', title: 'Accordage des guitares' },
      { start: 0.72, end: 0.94, type: 'keep', title: '03 - Final Électrique' },
      { start: 0.94, end: 1.00, type: 'gap', title: 'Ovation & Saluts du groupe' }
    ];

    // Génération d'une fausse onde audio cohérente
    const numBars = 120;
    const waveData = [];
    for (let i = 0; i < numBars; i++) {
      const pos = i / numBars;
      const seg = segments.find(s => pos >= s.start && pos < s.end) || segments[segments.length - 1];
      
      let baseAmp;
      if (seg.type === 'keep') {
        baseAmp = 0.45 + 0.5 * Math.sin(i * 0.4) * Math.sin(i * 0.15) + Math.random() * 0.25;
      } else {
        baseAmp = 0.12 + Math.random() * 0.18; // plus faible pour les blancs/paroles
      }
      waveData.push({
        amp: Math.max(0.1, Math.min(0.95, Math.abs(baseAmp))),
        seg: seg
      });
    }

    let cursorX = 0;
    let isHovering = false;
    let hoveredInfo = document.getElementById('waveform-hover-info');

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      isHovering = true;

      const pos = cursorX / width;
      const seg = segments.find(s => pos >= s.start && pos < s.end);
      if (hoveredInfo && seg) {
        const isKeep = seg.type === 'keep';
        hoveredInfo.innerHTML = `
          <span class="inline-block w-2.5 h-2.5 rounded-full ${isKeep ? 'bg-accent shadow-[0_0_8px_#22b8cf]' : 'bg-gap shadow-[0_0_8px_#ff9248]'} mr-2"></span>
          <span class="font-semibold text-ink">${seg.title}</span>
          <span class="text-xs ${isKeep ? 'text-accent' : 'text-gap'} ml-2 font-mono">(${isKeep ? 'Conservé' : 'Retiré automatiquement'})</span>
        `;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      isHovering = false;
      if (hoveredInfo) {
        hoveredInfo.innerHTML = `<span class="text-ink-3 text-xs">Survolez le tracé audio pour inspecter les coupes automatiques</span>`;
      }
    });

    let playhead = 0;

    function draw() {
      if (!ctx || width === 0) return;
      ctx.clearRect(0, 0, width, height);

      playhead = (playhead + 0.001) % 1;

      // Draw background segments
      segments.forEach(seg => {
        const x1 = seg.start * width;
        const w = (seg.end - seg.start) * width;
        if (seg.type === 'keep') {
          ctx.fillStyle = 'rgba(34, 184, 207, 0.07)';
        } else {
          ctx.fillStyle = 'rgba(255, 146, 72, 0.07)';
        }
        ctx.fillRect(x1, 0, w, height);

        // Draw boundary line
        ctx.strokeStyle = seg.type === 'keep' ? 'rgba(34, 184, 207, 0.4)' : 'rgba(255, 146, 72, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1, height);
        ctx.stroke();
      });

      // Center baseline
      const centerY = height / 2;
      ctx.strokeStyle = 'rgba(45, 53, 66, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw waveform bars
      const barWidth = width / numBars;
      waveData.forEach((item, i) => {
        const x = i * barWidth + barWidth * 0.15;
        const w = barWidth * 0.7;
        const barH = item.amp * (height * 0.82);
        const y = centerY - barH / 2;

        if (item.seg.type === 'keep') {
          ctx.fillStyle = '#22b8cf';
        } else {
          ctx.fillStyle = '#ff9248';
        }

        ctx.beginPath();
        ctx.roundRect(x, y, w, barH, 2);
        ctx.fill();
      });

      // Draw active playhead
      const px = playhead * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw playhead knob
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, 6, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw cursor if hovering
      if (isHovering) {
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cursorX, 0);
        ctx.lineTo(cursorX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initShortcutsTable();
    initFaq();
    initMobileMenu();
    initWaveformDemo();
  });
})();
