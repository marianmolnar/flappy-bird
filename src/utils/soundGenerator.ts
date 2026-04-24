/**
 * Procedurally generates all game sound effects using the Web Audio API.
 * AudioBuffers are created once and cached for playback via Howler.
 */

/** Generate a short flap/swoosh sound */
function generateFlap(ctx: AudioContext): AudioBuffer {
  const duration = 0.12;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 25);
    const noise = (Math.random() * 2 - 1) * 0.3;
    const tone = Math.sin(2 * Math.PI * 400 * t * (1 - t * 4)) * 0.7;
    data[i] = (tone + noise) * envelope;
  }

  return buffer;
}

/** Generate a score ding (sine wave at 880Hz) */
function generateScore(ctx: AudioContext): AudioBuffer {
  const duration = 0.25;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 8);
    const tone = Math.sin(2 * Math.PI * 880 * t);
    const harmonic = Math.sin(2 * Math.PI * 1760 * t) * 0.3;
    data[i] = (tone + harmonic) * envelope * 0.6;
  }

  return buffer;
}

/** Generate a crash/hit sound using filtered noise */
function generateHit(ctx: AudioContext): AudioBuffer {
  const duration = 0.3;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 10);
    const noise = (Math.random() * 2 - 1);
    // Simulate low-pass filter by averaging with previous sample
    const filtered = i > 0 ? noise * 0.3 + data[i - 1] * 0.7 : noise;
    data[i] = filtered * envelope * 0.8;
  }

  return buffer;
}

/** Generate a descending die tone */
function generateDie(ctx: AudioContext): AudioBuffer {
  const duration = 0.5;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 4);
    // Descending frequency from 440Hz to 110Hz
    const freq = 440 * Math.pow(0.25, t / duration);
    const tone = Math.sin(2 * Math.PI * freq * t);
    data[i] = tone * envelope * 0.5;
  }

  return buffer;
}

/** Generate a short UI click feedback */
function generateMenuClick(ctx: AudioContext): AudioBuffer {
  const duration = 0.08;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = Math.exp(-t * 40);
    const tone = Math.sin(2 * Math.PI * 600 * t);
    data[i] = tone * envelope * 0.4;
  }

  return buffer;
}

/** Generate a gentle ambient background loop */
function generateAmbient(ctx: AudioContext): AudioBuffer {
  const duration = 4.0;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    let sample = 0;
    for (let n = 0; n < notes.length; n++) {
      const noteT = (t + (n * duration) / notes.length) % duration;
      const env = Math.sin((Math.PI * noteT) / (duration / notes.length));
      sample += Math.sin(2 * Math.PI * notes[n] * t) * env * 0.06;
    }
    // Smooth fade at loop boundaries
    const fadeLen = ctx.sampleRate * 0.1;
    const startFade = Math.min(1, i / fadeLen);
    const endFade = Math.min(1, (data.length - i) / fadeLen);
    data[i] = sample * startFade * endFade;
  }

  return buffer;
}

/** Convert AudioBuffer to a Blob URL for use with Howler */
function audioBufferToUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;

  // WAV header
  const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export interface GeneratedSounds {
  flap: string;
  score: string;
  hit: string;
  die: string;
  menuClick: string;
  ambient: string;
}

/** Generate all sounds and return Blob URLs */
export async function generateAllSounds(): Promise<GeneratedSounds> {
  const ctx = new AudioContext();

  const [flapBuf, scoreBuf, hitBuf, dieBuf, clickBuf, ambientBuf] = await Promise.all([
    Promise.resolve(generateFlap(ctx)),
    Promise.resolve(generateScore(ctx)),
    Promise.resolve(generateHit(ctx)),
    Promise.resolve(generateDie(ctx)),
    Promise.resolve(generateMenuClick(ctx)),
    Promise.resolve(generateAmbient(ctx)),
  ]);

  await ctx.close();

  return {
    flap: audioBufferToUrl(flapBuf),
    score: audioBufferToUrl(scoreBuf),
    hit: audioBufferToUrl(hitBuf),
    die: audioBufferToUrl(dieBuf),
    menuClick: audioBufferToUrl(clickBuf),
    ambient: audioBufferToUrl(ambientBuf),
  };
}
