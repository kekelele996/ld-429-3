import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAudioPlayerStore, getGlobalAudio, resetAudioPlayerForTest } from '../stores/audioPlayerStore';

describe('audioPlayerStore — 全局单例播放器', () => {
  beforeEach(() => {
    resetAudioPlayerForTest();
  });

  describe('全局唯一 Audio 实例', () => {
    it('getGlobalAudio 多次调用返回同一个对象', () => {
      const a = getGlobalAudio();
      const b = getGlobalAudio();
      expect(a).toBe(b);
    });

    it('getGlobalAudio 不返回 null（浏览器环境）', () => {
      expect(getGlobalAudio()).not.toBeNull();
    });

    it('store 操作影响全局 Audio 元素的 src', () => {
      const audio = getGlobalAudio()!;
      const store = useAudioPlayerStore.getState();

      store.play('/audio/test-a.mp3');
      expect(audio.src).toContain('/audio/test-a.mp3');
    });
  });

  describe('play — 播放新源时互斥', () => {
    it('play(A) 后 play(B)，只有 B 在播放', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/a.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);

      store.play('/audio/b.mp3');
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/b.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('play(B) 后 currentSrc 不再是 A', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.play('/audio/b.mp3');

      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/b.mp3');
      expect(useAudioPlayerStore.getState().currentSrc).not.toBe('/audio/a.mp3');
    });

    it('play 同一源且正在播放时不重复操作', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      const stateBefore = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      const stateAfter = useAudioPlayerStore.getState();

      expect(stateBefore.currentSrc).toBe(stateAfter.currentSrc);
      expect(stateBefore.isPlaying).toBe(stateAfter.isPlaying);
    });
  });

  describe('pause / resume — 暂停与恢复', () => {
    it('pause 后 isPlaying 为 false 但 currentSrc 不变', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.pause();

      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/a.mp3');
    });

    it('resume 后 isPlaying 恢复为 true 且 currentSrc 不变', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.pause();
      store.resume();

      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/a.mp3');
    });

    it('没有 currentSrc 时 resume 不改变状态', () => {
      const store = useAudioPlayerStore.getState();

      store.resume();

      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useAudioPlayerStore.getState().currentSrc).toBeNull();
    });
  });

  describe('stop — 完全停止', () => {
    it('stop 清空 currentSrc、isPlaying、progress', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.stop();

      expect(useAudioPlayerStore.getState().currentSrc).toBeNull();
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useAudioPlayerStore.getState().progress).toBe(0);
    });

    it('stop 后 Audio 元素的 src 被清空', () => {
      const audio = getGlobalAudio()!;
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      expect(audio.src).toContain('/audio/a.mp3');

      store.stop();
      expect(audio.src === '' || audio.src.endsWith('/') || !audio.getAttribute('src')).toBe(true);
    });
  });

  describe('toggle — 切换播放/暂停', () => {
    it('无播放源时 toggle(A) 等同 play(A)', () => {
      const store = useAudioPlayerStore.getState();

      store.toggle('/audio/a.mp3');

      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/a.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('正在播放 A 时 toggle(A) 等同 pause', () => {
      const store = useAudioPlayerStore.getState();

      store.toggle('/audio/a.mp3');
      store.toggle('/audio/a.mp3');

      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/a.mp3');
    });

    it('暂停 A 时 toggle(A) 等同 resume', () => {
      const store = useAudioPlayerStore.getState();

      store.toggle('/audio/a.mp3');
      store.toggle('/audio/a.mp3');
      store.toggle('/audio/a.mp3');

      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });

    it('正在播放 A 时 toggle(B) 切换到 B', () => {
      const store = useAudioPlayerStore.getState();

      store.toggle('/audio/a.mp3');
      store.toggle('/audio/b.mp3');

      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/b.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });
  });

  describe('seek — 跳转进度', () => {
    it('seek 更新 store 的 progress', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.seek(30);

      expect(useAudioPlayerStore.getState().progress).toBe(30);
    });
  });

  describe('画廊→详情页切换场景', () => {
    it('从画廊切换到详情页：play(标注语音) 替换 play(展览导览)', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/exhibition-guide.mp3');
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/exhibition-guide.mp3');

      store.stop();
      store.play('/audio/annotation-1.mp3');
      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/annotation-1.mp3');
    });

    it('详情页切标注：play(标注2) 替换 play(标注1)，始终只有一路', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/annotation-1.mp3');
      store.stop();
      store.play('/audio/annotation-2.mp3');

      expect(useAudioPlayerStore.getState().currentSrc).toBe('/audio/annotation-2.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);
    });
  });

  describe('全局 Audio 元素事件同步', () => {
    it('ended 事件将 isPlaying 设为 false', () => {
      const audio = getGlobalAudio()!;
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      expect(useAudioPlayerStore.getState().isPlaying).toBe(true);

      audio.dispatchEvent(new Event('ended'));
      expect(useAudioPlayerStore.getState().isPlaying).toBe(false);
    });

    it('timeupdate 事件更新 progress', () => {
      const audio = getGlobalAudio()!;
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');

      Object.defineProperty(audio, 'currentTime', { value: 12.5, writable: true, configurable: true });
      audio.dispatchEvent(new Event('timeupdate'));

      expect(useAudioPlayerStore.getState().progress).toBe(12.5);
    });

    it('durationchange 事件更新 duration', () => {
      const audio = getGlobalAudio()!;
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');

      Object.defineProperty(audio, 'duration', { value: 180, writable: true, configurable: true });
      audio.dispatchEvent(new Event('durationchange'));

      expect(useAudioPlayerStore.getState().duration).toBe(180);
    });
  });

  describe('resetAudioPlayerForTest', () => {
    it('完全重置 store 状态', () => {
      const store = useAudioPlayerStore.getState();

      store.play('/audio/a.mp3');
      store.seek(50);
      resetAudioPlayerForTest();

      const state = useAudioPlayerStore.getState();
      expect(state.currentSrc).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.progress).toBe(0);
      expect(state.duration).toBe(0);
    });
  });
});
