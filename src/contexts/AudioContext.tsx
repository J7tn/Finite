import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AudioContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  countdownVolume: number;
  setCountdownVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const DEFAULT_VOLUME = 0.25;
const DEFAULT_COUNTDOWN_VOLUME = 0.1;

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('isMuted') === 'true';
  });

  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('volume');
    if (stored) {
      const val = parseFloat(stored);
      if (val > DEFAULT_VOLUME) {
        localStorage.setItem('volume', String(DEFAULT_VOLUME));
        return DEFAULT_VOLUME;
      }
      return val;
    }
    localStorage.setItem('volume', String(DEFAULT_VOLUME));
    return DEFAULT_VOLUME;
  });

  const [countdownVolume, setCountdownVolume] = useState(() => {
    const stored = localStorage.getItem('countdownVolume');
    if (stored) return parseFloat(stored);
    localStorage.setItem('countdownVolume', String(DEFAULT_COUNTDOWN_VOLUME));
    return DEFAULT_COUNTDOWN_VOLUME;
  });

  useEffect(() => {
    localStorage.setItem('isMuted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('countdownVolume', countdownVolume.toString());
  }, [countdownVolume]);

  return (
    <AudioContext.Provider value={{ isMuted, setIsMuted, volume, setVolume, countdownVolume, setCountdownVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
