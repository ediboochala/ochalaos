// lib/sound.ts
// Lightweight Web Audio beeps — no external audio assets required.
// All functions degrade silently (try/catch) if AudioContext is unavailable
// or blocked by the browser's autoplay policy.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, start: number, duration: number, type: OscillatorType, gainPeak: number) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

export function playClick() {
  try {
    const c = getCtx(); if (!c) return;
    tone(c, 720, 0, 0.06, 'sine', 0.05);
  } catch { /* audio unavailable — ignore */ }
}

export function playTick() {
  try {
    const c = getCtx(); if (!c) return;
    tone(c, 880, 0, 0.03, 'square', 0.03);
  } catch { /* audio unavailable — ignore */ }
}

export function playSuccess() {
  try {
    const c = getCtx(); if (!c) return;
    tone(c, 523.25, 0,    0.12, 'sine', 0.06); // C5
    tone(c, 659.25, 0.08, 0.14, 'sine', 0.06); // E5
    tone(c, 783.99, 0.16, 0.22, 'sine', 0.07); // G5
  } catch { /* audio unavailable — ignore */ }
}

export function playComplete() {
  try {
    const c = getCtx(); if (!c) return;
    tone(c, 392.00, 0,    0.10, 'triangle', 0.06);
    tone(c, 523.25, 0.09, 0.10, 'triangle', 0.06);
    tone(c, 659.25, 0.18, 0.20, 'triangle', 0.07);
  } catch { /* audio unavailable — ignore */ }
}

export function playError() {
  try {
    const c = getCtx(); if (!c) return;
    tone(c, 220, 0,   0.14, 'sawtooth', 0.05);
    tone(c, 160, 0.1, 0.18, 'sawtooth', 0.05);
  } catch { /* audio unavailable — ignore */ }
}

export function playAchievement() {
  try {
    const c = getCtx(); if (!c) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => tone(c, f, i * 0.09, 0.18, 'sine', 0.065));
  } catch { /* audio unavailable — ignore */ }
}

export type SoundName = 'click' | 'tick' | 'success' | 'complete' | 'error' | 'achievement';

export const SOUNDS: Record<SoundName, () => void> = {
  click: playClick,
  tick: playTick,
  success: playSuccess,
  complete: playComplete,
  error: playError,
  achievement: playAchievement,
};
