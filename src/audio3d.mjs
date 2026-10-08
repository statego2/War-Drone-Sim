// War Drone Sim — Quiet Air-Glide Director v3.
// Original fictional arcade sounds. Deliberately musical, soft-edged and non-literal.
// Procedural Web Audio, no downloads, no microphones, no real aircraft audio.
const clamp = (v, a, b) => Math.min(b, Math.max(a, Number.isFinite(v) ? v : 0));
const ease = x => x*x*(3-2*x);

// Pure, bounded and independently testable sound-to-gameplay mapping.
export function deriveFlightMix(speed=0, height=0, options={}) {
  const v=clamp(speed/85,0,1);
  const h=clamp(height/170,0,1);
  const down=ease(clamp(-(options.verticalSpeed ?? 0)/32,0,1));
  const near=ease(clamp((42-height)/42,0,1));
  const throttle=clamp(((options.throttle ?? .72)+.38)/1.38,0,1);
  const fast=options.throttleMode==='fast'?1:0;
  const turn=ease(clamp(Math.abs(options.bank ?? 0)*3.3+Math.abs(options.sideRate ?? 0)/24,0,1));
  return {
    // v3: NO CONTINUOUS MOTOR/ROTOR OSCILLATOR. Fly on silky, breathable airflow.
    windGain: .034+.065*v+.012*h,
    windFilter: 520+600*v+130*near,
    // "Lift" layer follows movement without tonal buzz or mechanical engine loops.
    glideGain: .016+.058*v+.016*fast,
    glideFilter: 365+390*v+145*near,
    bankGain: .004+.037*turn,
    bankFilter: 520+340*turn,
    diveGain: .003+.155*down+.018*fast,
    diveFilter: 840+760*down,
    ambienceGain: Math.max(.10,.22-.075*v-.065*down),
    proximity: near, dive:down, turn
  };
}

export function deriveImpactMix({chain=1,finale=false,intensity=1}={}) {
  const tier=clamp(Math.round(chain),1,3);
  return {
    chain:tier,
    finale:!!finale,
    force:clamp(intensity,.7,1.15),
    // Each successful hit is pleasant on its own; the third resolves a little bigger.
    rewardNotes: finale ? [392,494,587,784] : tier===2 ? [392,494,659] : [392,494],
    bodyLevel:.16+(.016*(tier-1)),
    airLevel:.095
  };
}

export function createFlightAudio() {
  let ctx=null, gate=null, flightBus=null, worldBus=null, effectsBus=null;
  let windGain=null, windFilter=null, glideGain=null, glideFilter=null;
  let bankGain=null, bankFilter=null, diveGain=null, diveFilter=null;
  let ambienceGain=null, sources=[], airy=null, warm=null;
  let enabled=true, active=false, hidden=false, voices=0, nextUpdate=0;
  let birdsAt=15, birdElapsed=0, lastCueTime=-100, duckUntil=0;
  const MAX_VOICES=32;
  const nodeGain=v=>{const n=ctx.createGain();n.gain.value=v;return n;};
  const filter=(type,frequency,Q=.7)=>{const n=ctx.createBiquadFilter();n.type=type;n.frequency.value=frequency;n.Q.value=Q;return n;};

  function noiseBuffer(kind) {
    const rate=ctx.sampleRate, len=Math.ceil(rate*2.6);
    const buffer=ctx.createBuffer(1,len,rate);
    const data=buffer.getChannelData(0);
    let seed=kind==='warm'?24681357:1357911, slow=0, fast=0;
    for(let i=0;i<len;i++) {
      // Repeatable noise, smoothed before playback to suppress gritty digital fizz.
      seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
      const white=seed/2147483648;
      fast=fast*.68+white*.32;
      slow=slow*.97+white*.03;
      data[i]=kind==='warm'?clamp((fast*.55+slow*1.3)*.78,-1,1)
                           :clamp((fast*.72+slow*.45)*.78,-1,1);
    }
    return buffer;
  }

  function loop(buffer,destination,high,low) {
    const src=ctx.createBufferSource(), hp=filter('highpass',high), lp=filter('lowpass',low);
    src.buffer=buffer;src.loop=true;src.connect(hp).connect(lp).connect(destination);
    src.start();sources.push(src);
    return lp;
  }

  function build() {
    if(ctx)return;
    const Ctx=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Ctx)return;
    ctx=new Ctx({latencyHint:'interactive'});
    gate=nodeGain(enabled?1:0);
    const master=nodeGain(.62), hiPass=filter('highpass',70,.65);
    const comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-15;comp.knee.value=12;comp.ratio.value=3.2;
    comp.attack.value=.004;comp.release.value=.2;
    gate.connect(master).connect(hiPass).connect(comp).connect(ctx.destination);
    flightBus=nodeGain(.8);worldBus=nodeGain(0);effectsBus=nodeGain(.92);
    flightBus.connect(gate);worldBus.connect(gate);effectsBus.connect(gate);

    warm=noiseBuffer('warm');airy=noiseBuffer('airy');

    // The player reported every permanent electric drone note as irritating.
    // ONLY naturally flowing noise runs continuously; sine tones are short event cues.
    // Each layer has a different spectral shape and a long gain/filter smoothing time.
    windGain=nodeGain(0);
    windFilter=loop(airy,windGain,145,940);
    windGain.connect(flightBus);
    glideGain=nodeGain(0);
    glideFilter=loop(warm,glideGain,110,700);
    glideGain.connect(flightBus);
    bankGain=nodeGain(0);
    bankFilter=loop(airy,bankGain,200,650);
    bankGain.connect(flightBus);
    diveGain=nodeGain(0);
    diveFilter=loop(warm,diveGain,155,1050);
    diveGain.connect(flightBus);
    ambienceGain=nodeGain(.09);
    ambienceGain.connect(worldBus);
    loop(warm,ambienceGain,90,440);
  }

  async function unlock() {
    try {
      build();
      if(!ctx)return;
      if(ctx.state!=='running')await ctx.resume();
      hidden=false;
    }catch(e){console.warn('Audio unavailable; flight remains playable.',e);}
  }

  function envelope(g,at,attack,seconds,level,curve='exp') {
    const p=g.gain;
    p.setValueAtTime(.0001,at);
    p.linearRampToValueAtTime(level,at+Math.min(attack,seconds*.45));
    if(curve==='soft') {
      p.linearRampToValueAtTime(level*.48,at+seconds*.48);
    }
    p.exponentialRampToValueAtTime(.0001,at+seconds);
  }

  // One-shots are fully owned and cleaned after playback.
  function play(source,nodes,at,length) {
    source.connect(nodes[0]);
    for(let i=0;i<nodes.length-1;i++)nodes[i].connect(nodes[i+1]);
    nodes[nodes.length-1].connect(effectsBus);
    voices++;
    source.onended=()=> {
      try{source.disconnect();for(const node of nodes)node.disconnect();}finally{voices=Math.max(0,voices-1);}
    };
    source.start(at);source.stop(at+length+.008);
  }

  function tone(at,a,b,length,level,type='sine',attack=.009) {
    if(!ctx||voices>=MAX_VOICES)return;
    const o=ctx.createOscillator(),g=nodeGain(0);
    o.type=type;
    o.frequency.setValueAtTime(Math.max(32,a),at);
    o.frequency.exponentialRampToValueAtTime(Math.max(32,b),at+length);
    envelope(g,at,attack,length,level,'soft');
    play(o,[g],at,length);
  }

  function noise(at,length,level,hp=120,lp=1800,attack=.014) {
    if(!ctx||voices>=MAX_VOICES)return;
    const src=ctx.createBufferSource(),hi=filter('highpass',hp),lo=filter('lowpass',lp),g=nodeGain(0);
    src.buffer=warm;
    envelope(g,at,attack,length,level,'soft');
    play(src,[hi,lo,g],at,length);
  }

  function canPlay(){return !!ctx&&ctx.state==='running'&&enabled&&!hidden;}
  function softBird() {
    if(!canPlay()||!active)return;
    const t=ctx.currentTime;
    // Almost subliminal natural punctuation — never a piercing telephone beep.
    tone(t,970,1160,.18,.008,'sine',.045);
    tone(t+.16,1130,850,.23,.007,'sine',.04);
  }

  function cue(name, mode='') {
    if(!canPlay())return;
    const t=ctx.currentTime;
    // Avoid stacking UI chirps from rapid control changes.
    if((name==='mode'||name==='view')&&t-lastCueTime<.095)return;
    if(name==='mode'||name==='view')lastCueTime=t;
    if(name==='start'){
      noise(t,.23,.055,120,1350,.06);
      tone(t+.025,255,390,.21,.038,'sine',.032);
    }else if(name==='respawn'){
      // Short "ready again" lift, not a new fanfare every second.
      tone(t,240,400,.135,.034,'sine',.012);
      noise(t,.16,.024,170,950,.025);
    }else if(name==='mode'){
      if(mode==='fast'){
        // A warm acceleration shimmer, clearly different from the standard click.
        tone(t,245,390,.18,.040,'sine',.026);
        noise(t,.24,.040,140,1200,.075);
      }else if(mode==='hover'||mode==='reverse'){
        tone(t,370,290,.13,.027,'sine',.012);
      }else{
        tone(t,315,420,.115,.030,'sine',.012);
      }
    }else if(name==='view'){
      tone(t,450,340,.095,.022,'sine',.012);
    }else if(name==='miss'){
      tone(t,300,225,.20,.043,'sine',.018);
      tone(t+.085,245,188,.21,.027,'sine',.023);
    }
  }

  function impact(vehicle,opts={}) {
    if(!canPlay())return;
    const t=ctx.currentTime;
    if(!vehicle) {
      // Ground/tree = a soft, compact "oof", never the reward chord.
      duckUntil=t+.33;
      tone(t,155,83,.23,.12,'sine',.012);
      tone(t+.006,290,150,.13,.055,'triangle',.009);
      noise(t,.16,.082,110,1200,.017);
      noise(t+.065,.22,.028,100,690,.04);
      return;
    }
    const design=deriveImpactMix(opts);
    const force=design.force;
    duckUntil=t+.85;
    // A deep rounded "BOOM" with a punch in audible mids; no brittle white-noise crack.
    tone(t,175,63,.32,design.bodyLevel*force,'sine',.012);
    tone(t+.005,345,122,.18,.085*force,'triangle',.009);
    tone(t+.03,122,77,.37,.085*force,'sine',.04);
    noise(t,.12,design.airLevel*force,120,1950,.008);
    noise(t+.035,.36,.055*force,110,990,.022);
    noise(t+.13,.46,.026,105,520,.06);

    // Little audible sparkles after the thump, not four repetitions of harsh hiss.
    tone(t+.12,740,550,.10,.017,'sine',.025);
    tone(t+.205,630,455,.13,.013,'sine',.025);

    // Hit confirmation is a tiny two-note musical cadence; subsequent targets
    // develop it into a three-hit arc, final target gets a tasteful resolution.
    const rewardStart=t+.19;
    for(let i=0;i<design.rewardNotes.length;i++){
      const hz=design.rewardNotes[i],at=rewardStart+i*.077;
      const level=(i===design.rewardNotes.length-1?.052:.034)*(i===0?1:.90);
      tone(at,hz*.985,hz,.23+(design.finale?.075:0),level,'sine',.022);
    }
    if(design.finale) {
      // A short warm bloom rather than an extra noisy explosion.
      tone(t+.40,196,196,.31,.038,'sine',.032);
      noise(t+.39,.34,.017,240,1450,.09);
    }
  }

  function setEnabled(value){
    enabled=!!value;
    if(ctx)gate.gain.setTargetAtTime(enabled?1:0,ctx.currentTime,.025);
  }

  function setActive(value){
    active=!!value;
    if(!active&&ctx) {
      const t=ctx.currentTime;
      windGain.gain.setTargetAtTime(0,t,.12);
      glideGain.gain.setTargetAtTime(0,t,.14);
      bankGain.gain.setTargetAtTime(0,t,.12);
      diveGain.gain.setTargetAtTime(0,t,.08);
      worldBus.gain.setTargetAtTime(0,t,.16);
    }
  }

  function update(speed,height,dt,airborne=true,options={}){
    if(!ctx||ctx.state!=='running')return;
    if(active&&enabled&&!hidden&&airborne&&height<125){
      birdElapsed+=Math.max(0,dt||0);
      if(birdElapsed>=birdsAt){softBird();birdElapsed=0;birdsAt=13+Math.random()*14;}
    }
    const t=ctx.currentTime;
    if(t<nextUpdate)return;
    nextUpdate=t+.045;
    const m=deriveFlightMix(speed,height,options);
    const playing=active&&enabled&&!hidden;
    windFilter.frequency.setTargetAtTime(m.windFilter,t,.24);
    glideFilter.frequency.setTargetAtTime(m.glideFilter,t,.22);
    bankFilter.frequency.setTargetAtTime(m.bankFilter,t,.20);
    diveFilter.frequency.setTargetAtTime(m.diveFilter,t,.12);
    const duck=t<duckUntil?.30:1;
    windGain.gain.setTargetAtTime(playing?m.windGain*duck:0,t,.21);
    glideGain.gain.setTargetAtTime(playing?m.glideGain*duck:0,t,.25);
    bankGain.gain.setTargetAtTime(playing?m.bankGain*duck:0,t,.16);
    diveGain.gain.setTargetAtTime(playing?m.diveGain*duck:0,t,.11);
    worldBus.gain.setTargetAtTime(playing?m.ambienceGain*.7:0,t,.33);
  }

  function suspendOnHidden(){
    hidden=true;setActive(false);
    if(ctx?.state==='running')ctx.suspend().catch(()=>{});
  }

  async function dispose(){
    setActive(false);
    for(const src of sources){try{src.stop();}catch{}}
    sources=[];
    if(ctx&&ctx.state!=='closed')await ctx.close();
    ctx=null;
  }
  return {unlock,setEnabled,setActive,update,impact,cue,suspendOnHidden,dispose,
    get enabled(){return enabled;},
    get supported(){return !!(globalThis.AudioContext||globalThis.webkitAudioContext);}
  };
}
