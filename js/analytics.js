(() => {
  const script = document.currentScript;
  const code = script?.dataset.goatcounterCode?.trim() || "";
  const local = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  if (local || !/^[a-z0-9-]+$/i.test(code)) return;
  window.goatcounter = { no_events: false };
  const counter = document.createElement("script");
  counter.async = true;
  counter.src = "https://gc.zgo.at/count.js";
  counter.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.append(counter);
})();
