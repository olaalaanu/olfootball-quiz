// small WebAudio-based sounds: correct, wrong, timeout
export function playTone({
  frequency = 440,
  duration = 0.12,
  type = "sine",
  volume = 0.08,
}) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = frequency;
    g.gain.value = volume;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    o.start(now);
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.stop(now + duration + 0.02);
    // close context after short delay to avoid too many open contexts
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, (duration + 0.1) * 1000);
  } catch (e) {
    // silently fail on very old browsers
    console.warn("Audio not supported", e);
  }
}

export function playCorrect() {
  // pleasant upward arpeggio
  playTone({ frequency: 600, duration: 0.09, type: "sine", volume: 0.09 });
  setTimeout(
    () =>
      playTone({ frequency: 750, duration: 0.07, type: "sine", volume: 0.07 }),
    90
  );
}

export function playWrong() {
  // short low buzz
  playTone({ frequency: 220, duration: 0.18, type: "sawtooth", volume: 0.12 });
}

export function playTimeout() {
  playTone({ frequency: 180, duration: 0.28, type: "square", volume: 0.1 });
}
