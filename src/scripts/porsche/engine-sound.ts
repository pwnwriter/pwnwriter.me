// A synthesized Porsche flat-six "vrooom" — no audio files, so it's CSP-safe.
//
// The engine is modelled rather than sampled:
//   - layered, detuned sawtooths + a square sub  -> rough boxer tone
//   - a WaveShaper soft-clip                     -> the metallic rasp
//   - a resonant bandpass swept with the revs    -> the howl
//   - a fast tremolo whose rate tracks the revs  -> the firing "braaaap"
//   - a filtered noise bed                        -> exhaust / intake air
//
// It runs as ONE continuous engine that idles and gets "blipped", so it never
// cuts to silence between revs.

export function playVroom(): void {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);

    // soft-clip curve = the metallic flat-six rasp
    const makeCurve = (amount: number) => {
      const n = 2048;
      const c = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        c[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
      }
      return c;
    };
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeCurve(16);
    shaper.oversample = "4x";

    // resonant "howl" formant, swept each rev
    const formant = ctx.createBiquadFilter();
    formant.type = "bandpass";
    formant.Q.value = 4.5;
    const formantGain = ctx.createGain();
    formantGain.gain.value = 0.9;

    // tame the harsh top end
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3600;

    // rasp -> (dry + howl) -> tone -> master
    shaper.connect(tone);
    shaper.connect(formant);
    formant.connect(formantGain);
    formantGain.connect(tone);
    tone.connect(master);

    // white noise for exhaust / intake air
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.4, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // ---- one continuous engine that idles and gets blipped ----
    const t0 = ctx.currentTime + 0.03;
    const idleF = 52; // idle fundamental
    const peakF = 255; // redline-ish
    const idleG = 0.11; // engine never drops below idle -> no silence
    const peakG = 0.32;

    // amplitude bus (envelope + firing flutter live here)
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, t0);
    bus.gain.linearRampToValueAtTime(idleG, t0 + 0.1); // fire up to idle
    bus.connect(shaper);

    // layered, detuned voices -> rough boxer tone (run the whole time)
    const voices = [
      { type: "sawtooth", detune: -9, mul: 1, g: 0.5 },
      { type: "sawtooth", detune: 8, mul: 1, g: 0.5 },
      { type: "sawtooth", detune: 3, mul: 2, g: 0.22 },
      { type: "square", detune: 0, mul: 0.5, g: 0.5 },
    ];
    const oscNodes: OscillatorNode[] = [];
    const freqParams: { p: AudioParam; mul: number }[] = [];
    voices.forEach((v) => {
      const o = ctx.createOscillator();
      o.type = v.type as OscillatorType;
      o.detune.value = v.detune;
      o.frequency.setValueAtTime(idleF * v.mul, t0);
      const vg = ctx.createGain();
      vg.gain.value = v.g;
      o.connect(vg);
      vg.connect(bus);
      oscNodes.push(o);
      freqParams.push({ p: o.frequency, mul: v.mul });
    });

    // firing flutter: tremolo rate tracks the revs -> "braaaap"
    const chop = ctx.createOscillator();
    chop.type = "sawtooth";
    chop.frequency.setValueAtTime(34, t0);
    const chopDepth = ctx.createGain();
    chopDepth.gain.value = 0.16;
    chop.connect(chopDepth);
    chopDepth.connect(bus.gain);

    // howl formant (continuous)
    formant.frequency.setValueAtTime(320, t0);

    // exhaust air (continuous, sits under everything)
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const nbp = ctx.createBiquadFilter();
    nbp.type = "bandpass";
    nbp.Q.value = 0.8;
    nbp.frequency.setValueAtTime(900, t0);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.linearRampToValueAtTime(0.025, t0 + 0.1);
    noise.connect(nbp);
    nbp.connect(ng);
    ng.connect(tone);

    // schedule a rev "blip" onto the running engine (returns to idle, not silence)
    let t = t0 + 0.14;
    const blip = (
      rise: number,
      hold: number,
      fall: number,
      intensity: number,
    ) => {
      const pf = idleF + (peakF - idleF) * intensity;
      const gf = idleG + (peakG - idleG) * intensity;
      const cf = 34 + 150 * intensity;
      const ff = 320 + 1650 * intensity;
      const tUp = t + rise;
      const tHold = tUp + hold;
      const tDown = tHold + fall;

      freqParams.forEach(({ p, mul }) => {
        p.linearRampToValueAtTime(pf * mul, tUp);
        p.linearRampToValueAtTime(pf * 0.96 * mul, tHold);
        p.linearRampToValueAtTime(idleF * mul, tDown);
      });
      bus.gain.linearRampToValueAtTime(gf, tUp);
      bus.gain.linearRampToValueAtTime(gf * 0.95, tHold);
      bus.gain.linearRampToValueAtTime(idleG, tDown);
      chop.frequency.linearRampToValueAtTime(cf, tUp);
      chop.frequency.linearRampToValueAtTime(38, tDown);
      formant.frequency.linearRampToValueAtTime(ff, tUp);
      formant.frequency.linearRampToValueAtTime(420, tDown);
      nbp.frequency.linearRampToValueAtTime(900 + 1700 * intensity, tUp);
      nbp.frequency.linearRampToValueAtTime(900, tDown);

      t = tDown;
    };

    // rhythm: vrooooommmmm (long) ... vrom ... vrm ... vroommmm ... vroomm
    // (idle gaps between each = the engine breathing)
    blip(0.28, 0.72, 0.34, 1.0);
    t += 0.05;
    blip(0.1, 0.03, 0.16, 0.68);
    t += 0.04;
    blip(0.08, 0.0, 0.13, 0.52);
    t += 0.05;
    blip(0.18, 0.34, 0.28, 0.95);
    t += 0.05;
    blip(0.15, 0.14, 0.26, 0.8);

    // let it settle to idle, then cut the engine at the very end only
    const tEnd = t + 0.18;
    bus.gain.linearRampToValueAtTime(idleG, t + 0.08);
    bus.gain.linearRampToValueAtTime(0.0001, tEnd);
    ng.gain.linearRampToValueAtTime(0.0001, tEnd);

    const stop = tEnd + 0.05;
    oscNodes.forEach((o) => {
      o.start(t0);
      o.stop(stop);
    });
    chop.start(t0);
    chop.stop(stop);
    noise.start(t0);
    noise.stop(stop);
    setTimeout(() => ctx.close(), (stop - ctx.currentTime + 0.3) * 1000);
  } catch (e) {
    /* audio blocked (e.g. no user gesture yet) — the car still drives */
  }
}
