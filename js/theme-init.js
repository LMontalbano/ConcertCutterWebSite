(() => {
  // Ce script bloque le rendu : la classe est posée avant le premier affichage
  // et sert de bascule aux replis (FAQ, onglets) qui exigent JavaScript.
  document.documentElement.classList.add("js");
  let theme;
  try {
    theme = localStorage.getItem("concertcutter-theme");
  } catch {
    theme = null;
  }
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.dataset.theme = theme;
})();
