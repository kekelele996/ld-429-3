import { useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ArtworkInfoCard } from '../components/common/ArtworkInfoCard';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { GuideTooltip } from '../components/common/GuideTooltip';
import { EmptyState } from '../components/common/EmptyState';
import { useArtworkStore } from '../stores/artworkStore';
import { useGuideStore } from '../stores/guideStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useVisitorTracking } from '../hooks/useVisitorTracking';

export function ArtworkDetail() {
  const { id } = useParams();
  const [scale, setScale] = useState(1);
  const artworks = useArtworkStore((state) => state.artworks);
  const annotations = useGuideStore((state) => state.annotations);
  const artwork = useMemo(() => artworks.find((item) => item.id === id), [artworks, id]);
  useVisitorTracking(artwork?.id);

  const artworkAnnotations = useMemo(
    () => annotations.filter((a) => a.artworkId === id).sort((a, b) => a.order - b.order),
    [annotations, id],
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const { stop: stopAudio, play: playAudio } = useAudioPlayer();

  const annotationsWithAudio = useMemo(
    () => artworkAnnotations.filter((a) => a.audioUrl),
    [artworkAnnotations],
  );

  const handleAnnotationEnd = useCallback(() => {
    const nextIdx = activeIdx + 1;
    if (nextIdx < annotationsWithAudio.length) {
      setActiveIdx(nextIdx);
      const nextAudioUrl = annotationsWithAudio[nextIdx].audioUrl;
      if (nextAudioUrl) {
        stopAudio();
        playAudio(nextAudioUrl);
      }
    }
  }, [activeIdx, annotationsWithAudio, stopAudio, playAudio]);

  const activeAudioSrc = annotationsWithAudio[activeIdx]?.audioUrl;
  const currentAnnotation = artworkAnnotations[activeIdx];

  if (!artwork) {
    return <EmptyState title="未找到作品" description="当前作品可能已经移出展览，返回展览列表继续浏览。" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="panel overflow-hidden p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-4xl font-semibold">{artwork.title}</h1>
          <label className="text-sm text-[var(--color-muted)]">
            缩放
            <input className="ml-3 align-middle" type="range" min="0.8" max="1.8" step="0.1" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
          </label>
        </div>
        <div className="grid min-h-[58vh] place-items-center overflow-auto bg-[#211f1a] p-8">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="max-h-[70vh] max-w-full border-[10px] border-[#f4efe6] object-contain shadow-2xl transition-transform"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
        {annotationsWithAudio.length > 0 && (
          <div className="mt-4 border-t border-[var(--color-line)] pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
                语音导览 {activeIdx + 1} / {annotationsWithAudio.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="border border-[var(--color-line)] px-3 py-1 text-xs disabled:opacity-40"
                  disabled={activeIdx === 0}
                  onClick={() => {
                    const prevIdx = Math.max(0, activeIdx - 1);
                    setActiveIdx(prevIdx);
                    const prevUrl = annotationsWithAudio[prevIdx]?.audioUrl;
                    if (prevUrl) { stopAudio(); playAudio(prevUrl); }
                  }}
                >
                  上一条
                </button>
                <button
                  type="button"
                  className="border border-[var(--color-line)] px-3 py-1 text-xs disabled:opacity-40"
                  disabled={activeIdx >= annotationsWithAudio.length - 1}
                  onClick={() => {
                    const nextIdx = Math.min(annotationsWithAudio.length - 1, activeIdx + 1);
                    setActiveIdx(nextIdx);
                    const nextUrl = annotationsWithAudio[nextIdx]?.audioUrl;
                    if (nextUrl) { stopAudio(); playAudio(nextUrl); }
                  }}
                >
                  下一条
                </button>
              </div>
            </div>
            <AudioPlayer
              src={activeAudioSrc ?? ''}
              label={currentAnnotation?.title}
            />
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <ArtworkInfoCard artwork={artwork} />
        {artworkAnnotations.map((annotation, idx) => (
          <div
            key={annotation.id}
            className={`cursor-pointer transition-opacity ${activeIdx === idx ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => {
              setActiveIdx(idx);
              if (annotation.audioUrl) { stopAudio(); playAudio(annotation.audioUrl); }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveIdx(idx);
                if (annotation.audioUrl) { stopAudio(); playAudio(annotation.audioUrl); }
              }
            }}
          >
            <GuideTooltip annotation={annotation} />
          </div>
        ))}
      </aside>
    </div>
  );
}
