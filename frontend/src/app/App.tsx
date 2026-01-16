import { useState } from 'react';
import { VideoPlayer } from '@/app/components/VideoPlayer';
import { OverlayControls } from '@/app/components/OverlayControls';
import { OverlayData } from '@/app/components/OverlayItem';

export default function App() {
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });

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
    setOverlays([...overlays, newOverlay]);
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
      setOverlays([...overlays, newOverlay]);
      setSelectedOverlayId(newOverlay.id);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<OverlayData>) => {
    setOverlays(
      overlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const handleSelectOverlay = (id: string | null) => {
    setSelectedOverlayId(id);
  };

  return (
    <div className="relative w-full h-screen bg-zinc-900">
      <VideoPlayer
        videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
    </div>
  );
}
