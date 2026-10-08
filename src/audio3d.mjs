// War Drone Sim — procedural arcade sound director.
// Original synthesized sound, with no external samples, network traffic or real-world systems.
// All signals are headroom-limited for mobile speakers and unlock only on a user gesture.

const clamp = (value, low, high) => Math.min(high, Math.max(low, Number.isFinite(value) ? value : 0));
const smooth = x => x * x * (3 - 2 * x);

export function deriveFlightMix(speed = 0, height = 0, options = {}) {
  const velocity = clamp(speed / 85, 0, 1);
  const altitude = clamp(height / 180, 0, 1);
  const dive = smooth(clamp(-(options.verticalSpeed ?? 0) / 35, 0, 1));
  const proximity = smooth(clamp((38 - height) / 38, 0, 1));
  const throttle = clamp((options.throttle ?? 0.72) * .5 + .5, 0, 1);
  const isFast = options.throttleMode === 'fast' ? 1 : 0;
  return {
    rotorHz: 84 + velocity * 92 + throttle * 27,
    rotorGain: .39 + velocity * .19 + throttle * .08,
    rotorFilter: 330 + 450 * velocity + 160 * throttle,
    windGain: .13 + .24 * velocity + .09 * altitude,
    windFilter: 540 + 1700 * velocity + 450 * proximity,
    diveGain: .015 + .28 * dive + .09 * isFast,
    diveFilter: 800 + 2200 * dive,
    ambienceGain: Math.max(.11, .36 - .19 * velocity - .09 * dive),
    proximity,
    dive
  };
}

export function createFlightAudio() {
  let ctx = null, gate = null, master = null, flightBus = null;
  let worldBus = null, effectsBus = null, rotorGain = null, windGain = null;
  let diveGain = null, rotorFilter = null, windFilter = null, diveFilter = null;
  let rotor = [], sources = [], whiteNoise = null, softNoise = null;
  let enabled = true, active = false, birdClock = 0, nextBird = 8;
  let nextUpdateAt = 0, duckUntil = 0, mutedByVisibility = false;
  let voiceCount = 0;
  const MAX_VOICES = 36;

  function noisyBuffer(mode) {
    const duration = 3.2, rate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, Math.ceil(duration * rate), rate);
    const data = buffer.getChannelData(0);
    let seed = mode === 'soft' ? 1357911 : 24681357, low = 0;
    for (let i = 0; i < data.length; i++) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      const white = (seed / 2147483648);
      low = low * .97 + white * .03;
      data[i] = mode === 'soft' ? low * 2.9 : white * .8 + low * .7;
    }
    return buffer;
  }

  function filter(type, frequency, Q = .7) {
    const node = ctx.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.Q.value = Q;
    return node;
  }

  function gain(value) {
    const node = ctx.createGain();
    node.gain.value = value;
    return node;
  }

  function loopNoise(buffer, destination, highHz, lowHz) {
    const source = ctx.createBufferSource();
    const hp = filter('highpass', highHz), lp = filter('lowpass', lowHz);
    source.buffer = buffer;
    source.loop = true;
    source.connect(hp).connect(lp).connect(destination);
    source.start();
    sources.push(source);
    return lp;
  }

  function build() {
    if (ctx) return;
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtx) return; // visual game continues normally when audio is unsupported
    ctx = new AudioCtx({ latencyHint: 'interactive' });
    gate = gain(enabled ? 1 : 0);
    master = gain(.72);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 10;
    limiter.ratio.value = 6;
    limiter.attack.value = .003;
    limiter.release.value = .18;
    const lowCut = filter('highpass', 48, .65);
    gate.connect(master).connect(lowCut).connect(limiter).connect(ctx.destination);
    flightBus = gain(1); flightBus.connect(gate);
    worldBus = gain(0); worldBus.connect(gate);
    effectsBus = gain(.88); effectsBus.connect(gate);

    whiteNoise = noisyBuffer('white');
    softNoise = noisyBuffer('soft');

    // Dual-detuned harmonics create a rounded electric rotor, not a brittle alarm.
    rotorGain = gain(0);
    rotorFilter = filter('lowpass', 620, .62);
    rotorGain.connect(rotorFilter).connect(flightBus);
    for (const [type, ratio, level] of [['triangle', 1, .10], ['sawtooth', 1.015, .023], ['sine', 2.01, .036]]) {
      const oscillator = ctx.createOscillator(), balance = gain(level);
      oscillator.type = type;
      oscillator.frequency.value = 125 * ratio;
      oscillator.connect(balance).connect(rotorGain);
      oscillator.start();
      rotor.push({ oscillator, ratio });
      sources.push(oscillator);
    }

    // Broadband air + an independent dive rush are deliberately independent.
    windGain = gain(0);
    windFilter = loopNoise(whiteNoise, windGain, 110, 800);
    windGain.connect(flightBus);
    diveGain = gain(0);
    diveFilter = loopNoise(whiteNoise, diveGain, 260, 900);
    diveGain.connect(flightBus);

    // Forest atmosphere has space without a piercing, constantly repeated beep.
    const canopy = gain(.075), ground = gain(.06);
    canopy.connect(worldBus);
    ground.connect(worldBus);
    loopNoise(softNoise, canopy, 140, 1000);
    loopNoise(softNoise, ground, 55, 420);
  }

  async function unlock() {
    try {
      build();
      if (!ctx) return;
      if (ctx.state !== 'running') await ctx.resume();
      mutedByVisibility = false;
    } catch (error) {
      console.warn('Audio unavailable; gameplay remains playable.', error);
    }
  }

  // Every one-shot owns its nodes and disconnects them when playback ends.
  function oneShot(source, nodes, at, duration) {
    source.connect(nodes[0]);
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
    nodes[nodes.length - 1].connect(effectsBus);
    voiceCount++;
    source.onended = () => {
      source.disconnect();
      for (const node of nodes) node.disconnect();
      voiceCount = Math.max(0, voiceCount - 1);
    };
    source.start(at);
    source.stop(at + duration + .008);
  }

  function envelope(node, at, attack, duration, peak) {
    const g = node.gain;
    g.setValueAtTime(.0001, at);
    g.linearRampToValueAtTime(peak, at + Math.min(attack, duration * .45));
    g.exponentialRampToValueAtTime(.0001, at + duration);
  }

  function tone(at, startHz, endHz, seconds, level, type = 'sine', attack = .006) {
    if (!ctx || voiceCount >= MAX_VOICES) return;
    const oscillator = ctx.createOscillator(), amp = gain(0);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(30, startHz), at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endHz), at + seconds);
    envelope(amp, at, attack, seconds, level);
    oneShot(oscillator, [amp], at, seconds);
  }

  function noise(at, seconds, level, hp = 100, lp = 5000, attack = .003, soft = false) {
    if (!ctx || voiceCount >= MAX_VOICES) return;
    const source = ctx.createBufferSource();
    source.buffer = soft ? softNoise : whiteNoise;
    const high = filter('highpass', hp), low = filter('lowpass', lp), amp = gain(0);
    envelope(amp, at, attack, seconds, level);
    oneShot(source, [high, low, amp], at, seconds);
  }

  function bird() {
    if (!ctx || !enabled || !active || mutedByVisibility) return;
    const t = ctx.currentTime;
    tone(t, 1670, 2200, .105, .012, 'sine', .016);
    tone(t + .105, 2290, 1500, .19, .010, 'sine', .012);
  }

  function cue(name) {
    if (!ctx || ctx.state !== 'running' || !enabled || mutedByVisibility) return;
    const t = ctx.currentTime;
    if (name === 'start') {
      noise(t, .22, .060, 270, 2700, .09, true);
      tone(t, 310, 620, .24, .029, 'sine', .014);
      tone(t + .10, 470, 700, .22, .019, 'triangle', .01);
    } else if (name === 'respawn') {
      tone(t, 370, 620, .15, .020, 'sine');
      noise(t, .14, .025, 320, 1800);
    } else if (name === 'mode') {
      tone(t, 470, 570, .075, .019, 'sine');
      tone(t + .072, 630, 750, .09, .015, 'sine');
    } else if (name === 'view') {
      tone(t, 520, 410, .085, .018, 'triangle');
    }
  }

  function impact(vehicle) {
    if (!ctx || ctx.state !== 'running' || !enabled || mutedByVisibility) return;
    const t = ctx.currentTime;
    duckUntil = t + (vehicle ? .88 : .40);
    // Distinct fictional arcade payoff: transient + mid-body + low body + debris + air tail.
    // Upper-mid punch translates on phone speakers; low end is present, never the only impact.
    if (vehicle) {
      tone(t, 142, 43, .46, .30, 'sine', .008);
      tone(t + .008, 275, 97, .25, .096, 'triangle', .005);
      noise(t, .115, .28, 370, 6800, .002);
      noise(t + .022, .38, .19, 115, 2400, .012, true);
      noise(t + .045, .79, .105, 180, 1300, .02, true);
      for (let i = 0; i < 4; i++) {
        const at = t + .105 + i * .085;
        noise(at, .055 + i * .016, .060 - i * .008, 630, 4800 - i * 620);
        tone(at, 950 - i * 100, 250 - i * 18, .075, .012, 'triangle');
      }
      // Reward motif blends into the tail; deliberately softer than the hit.
      tone(t + .32, 392, 392, .21, .025, 'sine', .016);
      tone(t + .42, 494, 494, .21, .023, 'sine', .018);
      tone(t + .52, 587, 587, .29, .021, 'sine', .025);
    } else {
      tone(t, 108, 52, .28, .21, 'sine', .008);
      tone(t + .002, 185, 90, .17, .062, 'triangle');
      noise(t, .13, .17, 180, 3100);
      noise(t + .03, .34, .090, 190, 1100, .025, true);
    }
  }

  function setEnabled(value) {
    enabled = !!value;
    if (ctx) gate.gain.setTargetAtTime(enabled ? 1 : 0, ctx.currentTime, .015);
  }

  function setActive(value) {
    active = !!value;
    if (ctx && !active) {
      const t = ctx.currentTime;
      rotorGain.gain.setTargetAtTime(0, t, .07);
      windGain.gain.setTargetAtTime(0, t, .10);
      diveGain.gain.setTargetAtTime(0, t, .08);
      worldBus.gain.setTargetAtTime(0, t, .3);
    }
  }

  function update(speed, height, delta, airborne = true, options = {}) {
    if (!ctx || ctx.state !== 'running') return;
    if (active && enabled && airborne && height < 160) {
      birdClock += Math.max(0, delta || 0);
      if (birdClock >= nextBird) {
        bird();
        birdClock = 0;
        nextBird = 6.5 + Math.random() * 10;
      }
    }
    const t = ctx.currentTime;
    if (t < nextUpdateAt) return; // bounded automation overhead on high-refresh screens
    nextUpdateAt = t + .038;
    const values = deriveFlightMix(speed, height, options);
    const playing = enabled && active && !mutedByVisibility;
    for (const { oscillator, ratio } of rotor) oscillator.frequency.setTargetAtTime(values.rotorHz * ratio, t, .13);
    rotorFilter.frequency.setTargetAtTime(values.rotorFilter, t, .17);
    windFilter.frequency.setTargetAtTime(values.windFilter, t, .2);
    diveFilter.frequency.setTargetAtTime(values.diveFilter, t, .13);
    rotorGain.gain.setTargetAtTime(playing ? values.rotorGain : 0, t, .085);
    windGain.gain.setTargetAtTime(playing ? values.windGain : 0, t, .14);
    diveGain.gain.setTargetAtTime(playing ? values.diveGain : 0, t, .09);
    worldBus.gain.setTargetAtTime(playing ? values.ambienceGain * (t < duckUntil ? .35 : 1) : 0, t, .20);
  }

  function suspendOnHidden() {
    mutedByVisibility = true;
    setActive(false);
    if (ctx?.state === 'running') ctx.suspend().catch(() => {});
  }

  async function dispose() {
    setActive(false);
    for (const source of sources) { try { source.stop(); } catch {} }
    sources = [];
    if (ctx && ctx.state !== 'closed') await ctx.close();
    ctx = null;
  }

  return {
    unlock, setEnabled, setActive, update, impact, cue, suspendOnHidden, dispose,
    get enabled() { return enabled; },
    get supported() { return !!(globalThis.AudioContext || globalThis.webkitAudioContext); }
  };
}
