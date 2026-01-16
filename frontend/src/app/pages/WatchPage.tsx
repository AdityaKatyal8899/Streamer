import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { OverlayData } from '../components/OverlayItem';

export default function WatchPage() {
  const { stream_id } = useParams();
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
  const hlsUrl = useMemo(() => 'http://127.0.0.1:9000/output/stream.m3u8', []);
  const [overlays, setOverlays] = useState<OverlayData[]>([]);

  useEffect(() => {
    if (!stream_id) return;
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
          return { id: it.id, type: 'text', text: it.content, styles: it.style, xPct: p.xPct ?? 0.25, yPct: p.yPct ?? 0.25, wPct: p.wPct ?? 0.2, hPct: p.hPct ?? 0.1 } as OverlayData;
        });
        setOverlays([...mappedImgs, ...mappedTxts]);
      }).catch(() => {});
  }, [stream_id]);

  return (
    <div className="relative w-full min-h-screen bg-zinc-900">
      <div className="p-4 text-white text-sm">Watching stream: {stream_id}</div>
      <VideoPlayer
        videoSrc={hlsUrl}
        overlays={overlays}
        selectedOverlayId={null}
        onOverlayUpdate={() => {}}
        onOverlaySelect={() => {}}
        videoSize={videoSize}
        onVideoSizeChange={setVideoSize}
      />
    </div>
  );
}
