/**
 * ConcertCutter - Interactive SmartScreen Simulator
 * Guide interactif pas-à-pas pour rassurer et guider les utilisateurs sous Windows
 */

(function () {
  let currentStep = 1;

  function initSmartScreenSimulator() {
    const step1Btn = document.getElementById('smartscreen-tab-1');
    const step2Btn = document.getElementById('smartscreen-tab-2');
    const resetBtn = document.getElementById('smartscreen-reset-btn');
    const infoLink = document.getElementById('smartscreen-info-link');
    const runAnywayBtn = document.getElementById('smartscreen-run-anyway-btn');
    const dontRunBtn = document.getElementById('smartscreen-dont-run-btn');
    const appDetails = document.getElementById('smartscreen-app-details');
    const runAnywayContainer = document.getElementById('smartscreen-run-container');
    const stepGuideText = document.getElementById('smartscreen-guide-text');
    const successToast = document.getElementById('smartscreen-success-toast');

    if (!step1Btn || !step2Btn) return;

    function setStep(step) {
      currentStep = step;
      if (step === 1) {
        // Tab styling
        step1Btn.classList.add('bg-accent', 'text-on-accent', 'font-semibold');
        step1Btn.classList.remove('text-ink-2', 'bg-surface-raised');
        step2Btn.classList.remove('bg-accent', 'text-on-accent', 'font-semibold');
        step2Btn.classList.add('text-ink-2', 'bg-surface-raised');

        // Modal state
        if (appDetails) appDetails.classList.add('hidden');
        if (runAnywayContainer) runAnywayContainer.classList.add('hidden');
        if (infoLink) {
          infoLink.classList.remove('hidden');
          infoLink.classList.add('underline');
        }
        if (successToast) successToast.classList.add('hidden');

        if (stepGuideText) {
          stepGuideText.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 text-accent font-mono font-bold text-xs flex items-center justify-center">1</span>
              <div>
                <p class="font-semibold text-ink text-sm">Cliquez sur <span class="text-accent underline">« Informations complémentaires »</span></p>
                <p class="text-xs text-ink-3">Au premier lancement, Windows masque le bouton d'exécution par défaut.</p>
              </div>
            </div>
          `;
        }
      } else {
        // Step 2
        step2Btn.classList.add('bg-accent', 'text-on-accent', 'font-semibold');
        step2Btn.classList.remove('text-ink-2', 'bg-surface-raised');
        step1Btn.classList.remove('bg-accent', 'text-on-accent', 'font-semibold');
        step1Btn.classList.add('text-ink-2', 'bg-surface-raised');

        // Modal state
        if (appDetails) appDetails.classList.remove('hidden');
        if (runAnywayContainer) runAnywayContainer.classList.remove('hidden');
        if (infoLink) infoLink.classList.add('hidden');

        if (stepGuideText) {
          stepGuideText.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">2</span>
              <div>
                <p class="font-semibold text-ink text-sm">Cliquez sur <span class="text-emerald-400 font-bold">« Exécuter quand même »</span></p>
                <p class="text-xs text-ink-3">L'application se lance immédiatement, sans aucune installation requise !</p>
              </div>
            </div>
          `;
        }
      }
    }

    step1Btn.addEventListener('click', () => setStep(1));
    step2Btn.addEventListener('click', () => setStep(2));

    if (infoLink) {
      infoLink.addEventListener('click', (e) => {
        e.preventDefault();
        setStep(2);
      });
    }

    if (runAnywayBtn) {
      runAnywayBtn.addEventListener('click', () => {
        if (successToast) {
          successToast.classList.remove('hidden');
          setTimeout(() => {
            successToast.classList.add('hidden');
          }, 3500);
        }
      });
    }

    if (dontRunBtn) {
      dontRunBtn.addEventListener('click', () => {
        setStep(1);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => setStep(1));
    }

    // Default to Step 1
    setStep(1);
  }

  document.addEventListener('DOMContentLoaded', initSmartScreenSimulator);
})();
