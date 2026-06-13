import { useEffect, useRef, useCallback } from 'react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSrcRef = useRef<string>('');

  const currentSrc = useAudioPlayerStore((s) => s.currentSrc);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const progress = useAudioPlayerStore((s) => s.progress);
  const duration = useAudioPlayerStore((s) => s.duration);

  const storePlay = useAudioPlayerStore((s) => s.play);
  const storePause = useAudioPlayerStore((s) => s.pause);
  const storeResume = useAudioPlayerStore((s) => s.resume);
  const storeStop = useAudioPlayerStore((s) => s.stop);
  const storeSeek = useAudioPlayerStore((s) => s.seek);
  const storeSetProgress = useAudioPlayerStore((s) => s.setProgress);
  const storeSetDuration = useAudioPlayerStore((s) => s.setDuration);
  const storeSetPlaying = useAudioPlayerStore((s) => s.setPlaying);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      storeSetProgress(audio.currentTime);
    };

    const onDurationChange = () => {
      if (isFinite(audio.duration)) {
        storeSetDuration(audio.duration);
      }
    };

    const onEnded = () => {
      storeSetPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, [storeSetProgress, storeSetDuration, storeSetPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSrc) return;

    if (lastSrcRef.current !== currentSrc) {
      audio.src = currentSrc;
      audio.load();
      lastSrcRef.current = currentSrc;
    }

    if (isPlaying) {
      audio.play().catch(() => {
        storeSetPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentSrc, isPlaying, storeSetPlaying]);

  const play = useCallback(
    (src: string) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (lastSrcRef.current === src && !audio.paused) {
        storePause();
        return;
      }
      if (lastSrcRef.current !== src) {
        audio.src = src;
        audio.load();
        lastSrcRef.current = src;
      }
      storePlay(src);
    },
    [storePlay, storePause],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    storePause();
  }, [storePause]);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => storeSetPlaying(false));
    }
    storeResume();
  }, [storeResume, storeSetPlaying]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    lastSrcRef.current = '';
    storeStop();
  }, [storeStop]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = time;
      }
      storeSeek(time);
    },
    [storeSeek],
  );

  const toggle = useCallback(
    (src: string) => {
      if (currentSrc === src && isPlaying) {
        pause();
      } else if (currentSrc === src && !isPlaying) {
        resume();
      } else {
        play(src);
      }
    },
    [currentSrc, isPlaying, play, pause, resume],
  );

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
