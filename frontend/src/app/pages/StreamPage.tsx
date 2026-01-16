import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { OverlayControls } from '../components/OverlayControls';
import { OverlayData } from '../components/OverlayItem';

export default function StreamPage() {
  const { stream_id } = useParams();
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
  const [started, setStarted] = useState(false);
  const hlsUrl = useMemo(() => 'http://127.0.0.1:9000/output/stream.m3u8', []);
  const shareUrl = useMemo(() => `http://localhost:5173/watch/${stream_id}`, [stream_id]);

  useEffect(() => {
    if (!started) return;
    if (stream_id) {
      const initPayload = { stream_id, stream_url: hlsUrl, overlays: { image: [], text: [] }, positions: { image_position: [], text_position: [] } };
      fetch(`http://127.0.0.1:9000/api/overlays/${stream_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(initPayload) }).catch(() => {});
      fetch(`http://127.0.0.1:9000/api/overlays/${stream_id}`)
        .then(r => r.json())
        .then(d => {
          const imgs = (d.overlays?.image || []) as any[];
          const txts = (d.overlays?.text || []) as any[];
          const imgPos = (d.positions?.image_position || []) as any[];
          const txtPos = (d.positions?.text_position || []) as any[];
          const byIdPos: Record<string, any> = {};
          imgPos.forEach(p => byIdPos[p.id] = p);
          txtPos.forEach(p => byIdPos[p.id] = p);
          const mappedImgs = imgs.map(it => {
            const p = byIdPos[it.id] || {};
            return { id: it.id, type: 'image', src: it.src, xPct: p.xPct ?? 0.3, yPct: p.yPct ?? 0.3, wPct: p.wPct ?? 0.25, hPct: p.hPct ?? 0.25 } as OverlayData;
          });
          const mappedTxts = txts.map(it => {
            const p = byIdPos[it.id] || {};
            return { id: it.id, type: 'text', text: it.content, styles: it.styles, xPct: p.xPct ?? 0.25, yPct: p.yPct ?? 0.25, wPct: p.wPct ?? 0.2, hPct: p.hPct ?? 0.1 } as OverlayData;
          });
          setOverlays([...mappedImgs, ...mappedTxts]);
        }).catch(() => {});
    }
  }, [started, stream_id, hlsUrl]);

  const handleStart = async () => {
    try {
      await fetch('http://127.0.0.1:9000/api/stream/start', { method: 'POST' });
      setStarted(true);
    } catch {}
  };

  const saveOverlays = (next: OverlayData[]) => {
    if (!stream_id) return;
    const image = next.filter(o => o.type === 'image').map(o => ({ id: o.id, src: (o as any).src, styles: {} }));
    const text = next.filter(o => o.type === 'text').map(o => ({ id: o.id, content: (o as any).text, styles: (o as any).styles || {} }));
    const image_position = next.filter(o => o.type === 'image').map(o => ({ id: o.id, xPct: (o as any).xPct, yPct: (o as any).yPct, wPct: (o as any).wPct, hPct: (o as any).hPct }));
    const text_position = next.filter(o => o.type === 'text').map(o => ({ id: o.id, xPct: (o as any).xPct, yPct: (o as any).yPct, wPct: (o as any).wPct, hPct: (o as any).hPct }));
    const payload = { stream_id, stream_url: hlsUrl, overlays: { image, text }, positions: { image_position, text_position } };
    fetch(`http://127.0.0.1:9000/api/overlays/${stream_id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  };

  const handleAddText = () => {
    const newOverlay: OverlayData = {
      id: `text-${Date.now()}`,
      type: 'text',
      xPct: 25,
      yPct: 25,
      wPct: 20,
      hPct: 10,
      text: 'New Text',
      styles: {
        color: '#ffffff',
        fontSizePx: 24,
        fontFamily: 'Arial',
      },
    };
    const next = [...overlays, newOverlay];
    setOverlays(next);
    saveOverlays(next);
    setSelectedOverlayId(newOverlay.id);
  };

  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newOverlay: OverlayData = {
        id: `image-${Date.now()}`,
        type: 'image',
        xPct: 30,
        yPct: 30,
        wPct: 25,
        hPct: 25,
        src: e.target?.result as string,
      };
      const next = [...overlays, newOverlay];
      setOverlays(next);
      saveOverlays(next);
      setSelectedOverlayId(newOverlay.id);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<OverlayData>) => {
    const next = overlays.map((overlay) => (overlay.id === id ? { ...overlay, ...updates } : overlay));
    setOverlays(next);
    saveOverlays(next);
  };

  const handleSelectOverlay = (id: string | null) => {
    setSelectedOverlayId(id);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {}
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-900">
      <div className="p-4 flex items-center gap-4">
        <div className="text-white text-sm">Share URL: {shareUrl}</div>
        <button onClick={copyLink} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Copy Link</button>
      </div>
      {!started && (
        <div className="mx-auto w-full max-w-5xl aspect-video bg-black/80 rounded-lg flex items-center justify-center">
          <button onClick={handleStart} className="px-6 py-3 rounded-md bg-green-600 text-white text-base">Play Livestream</button>
        </div>
      )}
      {started && (
        <>
          <VideoPlayer
            videoSrc={hlsUrl}
            overlays={overlays}
            selectedOverlayId={selectedOverlayId}
            onOverlayUpdate={handleUpdateOverlay}
            onOverlaySelect={handleSelectOverlay}
            videoSize={videoSize}
            onVideoSizeChange={setVideoSize}
          />
          <OverlayControls
            overlays={overlays}
            selectedOverlayId={selectedOverlayId}
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            onUpdateOverlay={handleUpdateOverlay}
          />
        </>
      )}
    </div>
  );
}
