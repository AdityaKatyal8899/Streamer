import React, { useRef, useEffect, useState } from 'react';
import styles from './VideoPlayer.module.css';
import { OverlayLayer } from './OverlayLayer';

interface VideoPlayerProps {
  videoSrc?: string;
  overlays: any[];
  selectedOverlayId: string | null;
  onOverlayUpdate: (id: string, updates: any) => void;
  onOverlaySelect: (id: string | null) => void;
  videoSize: { width: number; height: number };
  onVideoSizeChange: (size: { width: number; height: number }) => void;
}

export function VideoPlayer({
  videoSrc,
  overlays,
  selectedOverlayId,
  onOverlayUpdate,
  onOverlaySelect,
  videoSize,
  onVideoSizeChange,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readySrc, setReadySrc] = useState<string | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [lastNonZeroVolume, setLastNonZeroVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        onVideoSizeChange({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [onVideoSizeChange]);

  useEffect(() => {
    let cancelled = false;
    async function waitForPlaylist(url: string) {
      const maxAttempts = 15;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const resp = await fetch(url, { cache: 'no-store' });
          if (resp.ok) {
            const text = await resp.text();
            const hasManifest = text && text.includes('#EXTM3U');
            const hasSegments = text.includes('#EXTINF') || text.includes('.ts');
            if (hasManifest && hasSegments) {
              if (!cancelled) setReadySrc(url);
              return;
            }
          }
        } catch {}
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!cancelled) setReadySrc(url);
    }
    if (!videoSrc) {
      setReadySrc(undefined);
      return;
    }
    if (videoSrc.endsWith('.m3u8')) {
      waitForPlaylist(videoSrc);
    } else {
      setReadySrc(videoSrc);
    }
    return () => {
      cancelled = true;
    };
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!readySrc) return;
    if (readySrc.endsWith('.m3u8')) {
      import('hls.js').then(({ default: Hls }: any) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30, liveSyncDurationCount: 2, liveMaxLatencyDurationCount: 5, maxLiveSyncPlaybackRate: 1.02 });
          hls.loadSource(readySrc);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = readySrc;
        }
      });
    }
  }, [readySrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
  }, [volume]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setDuration(v.duration || 0);
      setProgress(v.currentTime || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = pct * duration;
  };

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      setVolume(lastNonZeroVolume || 1);
    } else {
      if (volume > 0) setLastNonZeroVolume(volume);
      setMuted(true);
      setVolume(0);
    }
  };

  const onVolumeChange = (val: number) => {
    const clamped = Math.min(Math.max(val, 0), 1);
    setVolume(clamped);
    if (clamped === 0) {
      setMuted(true);
    } else {
      setLastNonZeroVolume(clamped);
      setMuted(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        onVideoSizeChange({ width: offsetWidth, height: offsetHeight });
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onVideoSizeChange]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex left-4 justify-center items-center min-h-screen bg-zinc-500 p-8">
      <div ref={containerRef} className={`${styles.player} relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl`}>
        <button
          onClick={toggleFullscreen}
          className={`${styles.fsBtn} absolute z-10 top-2 right-2 bg-zinc-800/70 text-white text-xs px-2 py-1 rounded opacity-0 ${styles.hoverShow}`}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={readySrc && !readySrc.endsWith('.m3u8') ? readySrc : undefined}
          controls={false}
          playsInline
          autoPlay
          muted={muted}
        />

        <div className={styles.controlsBar}>
          <button className={styles.playBtn} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            <span className={`${styles.icon} ${isPlaying ? styles.pause : styles.play}`}></span>
          </button>
          <div className={styles.seek} onClick={onSeek} aria-label="Seek">
            <div className={styles.seekTrack}>
              <div className={styles.seekFill} style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}></div>
            </div>
          </div>
          <button className={styles.moreBtn} aria-label="Settings">
            <span className={styles.ellipsis}></span>
          </button>
          <button className={styles.fullscreenBtn} onClick={toggleFullscreen} aria-label="Fullscreen">
            <span className={`${styles.icon} ${styles.fullscreen}`}></span>
          </button>
        </div>

        <div className={styles.volumeWrap}>
          <button className={styles.muteBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            <span className={`${styles.muteIcon} ${muted ? styles.isMuted : ''}`}></span>
          </button>
          <div className={styles.volumeSlider}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Overlay Layer */}
        <OverlayLayer
          overlays={overlays}
          selectedOverlayId={selectedOverlayId}
          onOverlayUpdate={onOverlayUpdate}
          onOverlaySelect={onOverlaySelect}
          videoSize={videoSize}
        />
      </div>
    </div>
  );
}
