import React from 'react';
import { OverlayItem, OverlayData } from './OverlayItem';

interface OverlayLayerProps {
  overlays: OverlayData[];
  selectedOverlayId: string | null;
  onOverlayUpdate: (id: string, updates: Partial<OverlayData>) => void;
  onOverlaySelect: (id: string | null) => void;
  videoSize: { width: number; height: number };
}

export function OverlayLayer({
  overlays,
  selectedOverlayId,
  onOverlayUpdate,
  onOverlaySelect,
  videoSize,
}: OverlayLayerProps) {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicking the background itself
    if (e.target === e.currentTarget) {
      onOverlaySelect(null);
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onClick={handleBackgroundClick}
    >
      {overlays.map((overlay) => (
        <OverlayItem
          key={overlay.id}
          overlay={overlay}
          isSelected={selectedOverlayId === overlay.id}
          videoSize={videoSize}
          onUpdate={(updates) => onOverlayUpdate(overlay.id, updates)}
          onSelect={() => onOverlaySelect(overlay.id)}
        />
      ))}
    </div>
  );
}
