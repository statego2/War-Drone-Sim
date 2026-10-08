import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlightAudio, deriveFlightMix } from '../src/audio3d.mjs';

test('higher speed increases aerodynamic feedback without changing global state', () => {
  const slow = deriveFlightMix(12, 20, { throttle: .72 });
  const fast = deriveFlightMix(78, 20, { throttle: 1, throttleMode: 'fast' });
  assert.ok(fast.rotorHz > slow.rotorHz);
  assert.ok(fast.windGain > slow.windGain);
  assert.ok(fast.windFilter > slow.windFilter);
  assert.equal(deriveFlightMix(12, 20).rotorHz, deriveFlightMix(12, 20).rotorHz);
});

test('nosedive increases rush without excessively raising ambient effects', () => {
  const level = deriveFlightMix(57, 40, { verticalSpeed: 0 });
  const dive = deriveFlightMix(57, 40, { verticalSpeed: -32 });
  assert.ok(dive.diveGain > level.diveGain * 3);
  assert.ok(dive.diveFilter > level.diveFilter);
  assert.ok(dive.ambienceGain < level.ambienceGain);
  assert.ok(deriveFlightMix(0, 0, { verticalSpeed: Number.NaN }).diveGain > 0);
  for (const v of Object.values(deriveFlightMix(Infinity, NaN, { throttle: -999, verticalSpeed: -Infinity }))) {
    assert.ok(Number.isFinite(v), 'audio parameters stay safe and finite');
  }
});

class FakeParam {
  value = 0;
  setTargetAtTime(value) { this.value = value; }
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  threshold = new FakeParam();
  knee = new FakeParam();
  ratio = new FakeParam();
  attack = new FakeParam();
  release = new FakeParam();
  onended = null;
  connect(other) { return other; }
  disconnect() {}
  start() {}
  stop() { if (this.onended) this.onended(); }
}
class FakeAudioContext {
  static constructions = 0;
  constructor() { FakeAudioContext.constructions++; this.sampleRate = 8000; this.currentTime = 0; this.state = 'suspended'; this.destination = new FakeNode(); }
  createGain() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createDynamicsCompressor() { return new FakeNode(); }
  createOscillator() { return new FakeNode(); }
  createBufferSource() { return new FakeNode(); }
  createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
}

test('gesture gating, dynamic updates, SFX, mute and cleanup are browser-safe', async () => {
  const original = globalThis.AudioContext;
  try {
    globalThis.AudioContext = FakeAudioContext;
    FakeAudioContext.constructions = 0;
    const audio = createFlightAudio();
    assert.equal(audio.enabled, true);
    assert.equal(audio.supported, true);
    assert.equal(FakeAudioContext.constructions, 0, 'nothing starts before user gesture');
    await audio.unlock();
    assert.equal(FakeAudioContext.constructions, 1);
    audio.setActive(true);
    audio.update(57, 26, 1 / 60, true, { verticalSpeed: -22, throttleMode: 'fast', throttle: 1 });
    audio.cue('start');
    audio.cue('mode');
    audio.cue('view');
    audio.impact(true);
    audio.impact(false);
    audio.cue('respawn');
    audio.setEnabled(false);
    assert.equal(audio.enabled, false);
    audio.impact(true); // ignored when muted
    audio.setActive(false);
    audio.suspendOnHidden();
    await audio.unlock();
    audio.setEnabled(true);
    audio.setActive(true);
    audio.update(50, 10, 1 / 60);
    await audio.dispose();
    assert.equal(FakeAudioContext.constructions, 1, 'reuse one context');
  } finally {
    if (original === undefined) delete globalThis.AudioContext;
    else globalThis.AudioContext = original;
  }
});
