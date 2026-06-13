import { create } from 'zustand';

const globalAudio = typeof window !== 'undefined' ? new Audio() : null;

let lastAppliedSrc = '';

if (globalAudio) {
  globalAudio.addEventListener('timeupdate', () => {
    useAudioPlayerStore.setState({ progress: globalAudio.currentTime });
  });
  globalAudio.addEventListener('durationchange', () => {
    if (isFinite(globalAudio.duration)) {
      useAudioPlayerStore.setState({ duration: globalAudio.duration });
    }
  });
  globalAudio.addEventListener('ended', () => {
    useAudioPlayerStore.setState({ isPlaying: false });
  });
  globalAudio.addEventListener('play', () => {
    useAudioPlayerStore.setState({ isPlaying: true });
  });
  globalAudio.addEventListener('pause', () => {
    useAudioPlayerStore.setState((s) => (s.isPlaying ? { isPlaying: false } : s));
  });
}

function syncAudio(src: string | null, playing: boolean) {
  if (!globalAudio) return;
  if (src && src !== lastAppliedSrc) {
    globalAudio.src = src;
    globalAudio.load();
    lastAppliedSrc = src;
  }
  if (playing && src) {
    const result = globalAudio.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        useAudioPlayerStore.setState({ isPlaying: false });
      });
    }
  } else {
    globalAudio.pause();
  }
}

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
  toggle: (src: string) => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentSrc: null,
  isPlaying: false,
  progress: 0,
  duration: 0,

  play: (src) => {
    if (get().currentSrc === src && get().isPlaying) return;
    set({ currentSrc: src, isPlaying: true, progress: 0, duration: 0 });
    syncAudio(src, true);
  },

  pause: () => {
    set({ isPlaying: false });
    syncAudio(get().currentSrc, false);
  },

  resume: () => {
    if (!get().currentSrc) return;
    set({ isPlaying: true });
    syncAudio(get().currentSrc, true);
  },

  stop: () => {
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio.src = '';
    }
    lastAppliedSrc = '';
    set({ currentSrc: null, isPlaying: false, progress: 0, duration: 0 });
  },

  seek: (time) => {
    if (globalAudio) {
      globalAudio.currentTime = time;
    }
    set({ progress: time });
  },

  toggle: (src) => {
    const { currentSrc, isPlaying } = get();
    if (currentSrc === src && isPlaying) {
      get().pause();
    } else if (currentSrc === src && !isPlaying) {
      get().resume();
    } else {
      get().play(src);
    }
  },
}));

export function getGlobalAudio(): HTMLAudioElement | null {
  return globalAudio;
}

export function resetAudioPlayerForTest(): void {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.removeAttribute('src');
    globalAudio.load();
  }
  lastAppliedSrc = '';
  useAudioPlayerStore.setState({
    currentSrc: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
  });
}
