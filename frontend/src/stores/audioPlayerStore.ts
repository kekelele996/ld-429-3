import { create } from 'zustand';

interface AudioPlayerState {
  currentSrc: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  play: (src: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  currentSrc: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  play: (src) => set({ currentSrc: src, isPlaying: true, progress: 0, duration: 0 }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  stop: () => set({ currentSrc: null, isPlaying: false, progress: 0, duration: 0 }),
  seek: (time) => set({ progress: time }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));
