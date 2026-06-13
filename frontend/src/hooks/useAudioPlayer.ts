import { useAudioPlayerStore } from '../stores/audioPlayerStore';

export function useAudioPlayer() {
  const currentSrc = useAudioPlayerStore((s) => s.currentSrc);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const progress = useAudioPlayerStore((s) => s.progress);
  const duration = useAudioPlayerStore((s) => s.duration);
  const play = useAudioPlayerStore((s) => s.play);
  const pause = useAudioPlayerStore((s) => s.pause);
  const resume = useAudioPlayerStore((s) => s.resume);
  const stop = useAudioPlayerStore((s) => s.stop);
  const seek = useAudioPlayerStore((s) => s.seek);
  const toggle = useAudioPlayerStore((s) => s.toggle);

  return {
    currentSrc,
    isPlaying,
    progress,
    duration,
    play,
    pause,
    resume,
    stop,
    seek,
    toggle,
  };
}
