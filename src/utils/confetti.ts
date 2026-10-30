import confetti from "canvas-confetti";

/**
 * Fires a high-energy celebratory confetti particle burst in PU UNICARE emerald, gold, and cyan colors.
 */
export function fireCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#34D399", "#2ECC71", "#E0C88B", "#C2A05A", "#38BDF8", "#FFFFFF"],
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Side-cannon confetti blast for major milestones (e.g. ticket verified or tour completed).
 */
export function fireMilestoneCannons() {
  const end = Date.now() + 1.2 * 1000;
  const colors = ["#34D399", "#E0C88B", "#38BDF8"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
