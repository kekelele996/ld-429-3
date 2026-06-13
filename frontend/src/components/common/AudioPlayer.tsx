import { useAudioPlayerStore } from '../../stores/audioPlayerStore';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface AudioPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

export function AudioPlayer({ src, label, className }: AudioPlayerProps) {
  const currentSrc = useAudioPlayerStore((s) => s.currentSrc);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const progress = useAudioPlayerStore((s) => s.progress);
  const duration = useAudioPlayerStore((s) => s.duration);
  const toggle = useAudioPlayerStore((s) => s.toggle);
  const seek = useAudioPlayerStore((s) => s.seek);
  const isActive = currentSrc === src;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => toggle(src)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-white focus-ring"
        aria-label={isActive && isPlaying ? '暂停' : '播放'}
      >
        {isActive && isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="1" y="1" width="4" height="12" rx="1" />
            <rect x="9" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <polygon points="2,1 13,7 2,13" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        {label && (
          <p className="truncate text-xs text-[var(--color-muted)]">{label}</p>
        )}
        <div
          className="mt-1 h-1.5 cursor-pointer rounded-full bg-[var(--color-line)]"
          onClick={handleProgressClick}
          role="progressbar"
          aria-valuenow={isActive ? progress : 0}
          aria-valuemin={0}
          aria-valuemax={duration || 0}
        >
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-200"
            style={{ width: isActive && duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
          />
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] text-[var(--color-muted)]">
          <span>{isActive ? formatTime(progress) : '0:00'}</span>
          <span>{isActive ? formatTime(duration) : '0:00'}</span>
        </div>
      </div>
    </div>
  );
}
