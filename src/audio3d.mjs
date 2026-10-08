// Entirely synthetic game soundscape. No audio files, hardware integration or network.
export function createFlightAudio() {
  let context = null, output = null, motorGain = null, windGain = null;
  let motorLow = null, motorHigh = null, windSource = null, birdAt = 0;
  let enabled = true, active = false, birdCounter = 0;
  function build() {
    if (context) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    context = new AudioCtx();
    output = context.createGain(); output.gain.value = 0.65; output.connect(context.destination);
    const lowPass = context.createBiquadFilter();
    lowPass.type = 'lowpass'; lowPass.frequency.value = 850;
    motorGain = context.createGain(); motorGain.gain.value = 0;
    motorGain.connect(lowPass); lowPass.connect(output);
    const a = context.createOscillator(), b = context.createOscillator();
    a.type = 'sawtooth'; b.type = 'triangle';
    a.frequency.value = 105; b.frequency.value = 210;
    const low = context.createGain(), high = context.createGain();
    low.gain.value = .032; high.gain.value = .016;
    a.connect(low).connect(motorGain);
    b.connect(high).connect(motorGain);
    a.start(); b.start(); motorLow = a; motorHigh = b;
    // Filtered looping noise: rotor wash + atmosphere, more noticeable at altitude.
    const sampleRate = context.sampleRate, length = Math.max(4096, Math.round(sampleRate * 2));
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let acc = 0;
    for (let i = 0; i < length; i++) {
      acc = (acc + (Math.random() * 2 - 1) * .032) * .997;
      data[i] = acc;
    }
    const windFilter = context.createBiquadFilter();
    windFilter.type = 'lowpass'; windFilter.frequency.value = 520;
    windGain = context.createGain(); windGain.gain.value = 0;
    windGain.connect(windFilter).connect(output);
    windSource = context.createBufferSource();
    windSource.buffer = buffer; windSource.loop = true;
    windSource.connect(windGain);
    windSource.start();
  }
  async function unlock() {
    try {
      build();
      if (context?.state === 'suspended') await context.resume();
    } catch (error) { console.warn('Browser audio not available:', error); }
  }
  function setEnabled(value) {
    enabled = !!value;
    if (!context) return;
    const t = context.currentTime;
    if (!enabled) {
      motorGain?.gain.setTargetAtTime(0, t, .07);
      windGain?.gain.setTargetAtTime(0, t, .10);
    }
  }
  function setActive(value) {
    active = !!value;
    if (!active && context) {
      const t=context.currentTime;
      motorGain?.gain.setTargetAtTime(0,t,.1);
      windGain?.gain.setTargetAtTime(0,t,.15);
    }
  }
  function bird() {
    if (!context || !active || !enabled) return;
    const now=context.currentTime, o=context.createOscillator(), envelope=context.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(1650,now);
    o.frequency.exponentialRampToValueAtTime(2380,now+.09);
    o.frequency.exponentialRampToValueAtTime(1340,now+.23);
    envelope.gain.setValueAtTime(.0001,now);
    envelope.gain.exponentialRampToValueAtTime(.0045,now+.035);
    envelope.gain.exponentialRampToValueAtTime(.0001,now+.26);
    o.connect(envelope).connect(output);
    o.start(now);o.stop(now+.27);
    o.onended=()=>{o.disconnect();envelope.disconnect();};
  }
  function update(speed, height, delta, airborne=true) {
    if (!context || context.state!=='running') return;
    const time=context.currentTime;
    const playing=enabled && active;
    const v=Math.max(0, Math.min(1, speed / 65));
    const a=Math.max(0, Math.min(1, height / 150));
    motorLow.frequency.setTargetAtTime(76 + 77 * v, time, .14);
    motorHigh.frequency.setTargetAtTime(171 + 165 * v, time, .14);
    motorGain.gain.setTargetAtTime(playing ? .55 + .35 * v : 0, time, .08);
    windGain.gain.setTargetAtTime(playing ? .22 + .25 * v + .25 * a : 0,time,.3);
    if (playing && airborne && height<140) {
      birdCounter+=delta;
      if (birdCounter>birdAt) {
        bird();
        birdCounter=0;
        birdAt=5.1+Math.random()*9;
      }
    }
  }
  function suspendOnHidden() {
    setActive(false);
    if (context?.state==='running') context.suspend().catch(()=>{});
  }
  function impact(vehicle) {
    if (!context || context.state !== 'running' || !enabled) return;
    const t=context.currentTime;
    const pulse=context.createOscillator(), gain=context.createGain();
    pulse.type=vehicle?'sawtooth':'triangle';
    pulse.frequency.setValueAtTime(vehicle?150:92,t);
    pulse.frequency.exponentialRampToValueAtTime(vehicle?39:47,t+.36);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(vehicle?.35:.18,t+.016);
    gain.gain.exponentialRampToValueAtTime(.0001,t+(vehicle?.62:.28));
    pulse.connect(gain).connect(output);pulse.start(t);pulse.stop(t+(vehicle?.65:.31));
    pulse.onended=()=>{pulse.disconnect();gain.disconnect();};
    const n=context.createBuffer(1,Math.floor(context.sampleRate*.45),context.sampleRate);
    const data=n.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(context.sampleRate*(vehicle?.12:.055)));
    const src=context.createBufferSource(), filter=context.createBiquadFilter(), g=context.createGain();
    src.buffer=n;filter.type='lowpass';filter.frequency.value=vehicle?1250:620;
    g.gain.value=vehicle?.22:.12;
    src.connect(filter).connect(g).connect(output);src.start(t);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};
  }
  return { unlock, setEnabled, setActive, update, impact, suspendOnHidden, get enabled(){return enabled;} };
}
