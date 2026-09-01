(() => {
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
