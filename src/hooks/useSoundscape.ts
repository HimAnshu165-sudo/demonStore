'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Sub Bass Drone (43.65 Hz - F1 note)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(43.65, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.25, ctx.currentTime);
      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start();

      // Atmospheric Castle Wind Noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(220, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      whiteNoise.start();

      // Harmonic Ethereal Pad (130.81 Hz - C3 with subtle detune)
      const padOsc = ctx.createOscillator();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(130.81, ctx.currentTime);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.08, ctx.currentTime);
      padOsc.connect(padGain);
      padGain.connect(master);
      padOsc.start();
    } catch {
      // Audio context initialization error handling
    }
  }, []);

  const toggleSound = useCallback(() => {
    if (!audioCtxRef.current) {
      initAudio();
    }

    if (!audioCtxRef.current || !masterGainRef.current) return;

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;

    if (!isPlaying) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.4, ctx.currentTime, 1.2);
      setIsPlaying(true);
    } else {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.0, ctx.currentTime, 0.8);
      setIsPlaying(false);
    }
  }, [isPlaying, initAudio]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { isPlaying, toggleSound };
}
