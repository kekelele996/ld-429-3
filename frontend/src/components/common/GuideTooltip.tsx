import type { GuideAnnotation } from '../../types';
import { AudioPlayer } from './AudioPlayer';

export function GuideTooltip({ annotation }: { annotation: GuideAnnotation }) {
  return (
    <div className="panel max-w-sm border-l-4 border-l-vermilion p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Guide {annotation.order}</p>
      <h4 className="mt-1 text-lg font-semibold">{annotation.title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{annotation.description}</p>
      {annotation.audioUrl && (
        <div className="mt-3">
          <AudioPlayer src={annotation.audioUrl} label="语音标注" />
        </div>
      )}
    </div>
  );
}
