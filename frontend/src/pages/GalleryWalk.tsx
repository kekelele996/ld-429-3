import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArtworkInfoCard } from '../components/common/ArtworkInfoCard';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { GuideTooltip } from '../components/common/GuideTooltip';
import { MiniMap } from '../components/common/MiniMap';
import { GalleryScene } from '../components/scene/GalleryScene';
import { useFirstPersonController } from '../hooks/useFirstPersonController';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useGalleryScene } from '../hooks/useGalleryScene';
import { useVisitorTracking } from '../hooks/useVisitorTracking';
import { useArtworkStore } from '../stores/artworkStore';
import { useExhibitionStore } from '../stores/exhibitionStore';
import { useGuideStore } from '../stores/guideStore';

export function GalleryWalk() {
  const { room, artworks } = useGalleryScene();
  const activeArtworkId = useArtworkStore((state) => state.activeArtworkId);
  const activeArtwork = useArtworkStore((state) => state.artworks.find((a) => a.id === activeArtworkId));
  const annotation = useGuideStore((state) => state.annotations.find((item) => item.artworkId === activeArtworkId));
  const { hintVisible, velocity } = useFirstPersonController();
  useVisitorTracking(activeArtworkId);

  const activeExhibitionId = useExhibitionStore((state) => state.activeExhibitionId);
  const activeExhibition = useExhibitionStore((state) => state.exhibitions.find((e) => e.id === activeExhibitionId));
  const audioGuideUrl = activeExhibition?.audioGuideUrls?.[0];

  const { currentSrc, isPlaying, stop: stopAudio, play: playAudio } = useAudioPlayer();

  useEffect(() => {
    if (annotation?.audioUrl) {
      if (currentSrc !== annotation.audioUrl) {
        stopAudio();
        playAudio(annotation.audioUrl);
      }
    } else if (currentSrc && !audioGuideUrl) {
      stopAudio();
    }
  }, [activeArtworkId, annotation?.audioUrl, currentSrc, audioGuideUrl, stopAudio, playAudio]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="relative min-h-[70vh] overflow-hidden border border-[var(--color-line)] bg-black">
        <GalleryScene />
        <div className="pointer-events-none absolute left-4 top-4 border border-white/30 bg-black/50 px-3 py-2 text-sm text-white">
          {hintVisible ? 'WASD / 方向键记录漫游意图，鼠标拖动画面观察展厅' : `移动向量 ${velocity.x}, ${velocity.z}`}
        </div>
        {audioGuideUrl && (
          <div className="pointer-events-auto absolute bottom-4 left-4 right-4">
            <div className="border border-white/20 bg-black/70 px-4 py-3 backdrop-blur-sm">
              <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-white/60">展览导览</p>
              <AudioPlayer src={audioGuideUrl} />
            </div>
          </div>
        )}
        {(currentSrc || isPlaying) && (
          <div className="pointer-events-none absolute right-4 top-4">
            <span className="inline-flex items-center gap-1.5 border border-white/20 bg-black/60 px-2.5 py-1 text-xs text-white/80">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" />
              播放中
            </span>
          </div>
        )}
      </section>
      <aside className="space-y-4">
        {room && <MiniMap room={room} artworks={artworks} />}
        {activeArtwork ? <ArtworkInfoCard artwork={activeArtwork} /> : null}
        {annotation ? <GuideTooltip annotation={annotation} /> : null}
        <Link className="block border border-[var(--color-line)] p-4 text-center text-sm uppercase tracking-[0.2em] hover:bg-[var(--color-panel)]" to="/editor">
          Open room editor
        </Link>
      </aside>
    </div>
  );
}
