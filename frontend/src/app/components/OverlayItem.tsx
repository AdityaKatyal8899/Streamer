import React from 'react';
import { Rnd } from 'react-rnd';

export interface OverlayData {
  id: string;
  type: 'text' | 'image';
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  text?: string;
  src?: string;
  styles?: {
    color: string;
    fontSizePx: number;
    fontFamily: string;
  };
}

interface OverlayItemProps {
  overlay: OverlayData;
  isSelected: boolean;
  videoSize: { width: number; height: number };
  onUpdate: (updates: Partial<OverlayData>) => void;
  onSelect: () => void;
}

export function OverlayItem({
  overlay,
  isSelected,
  videoSize,
  onUpdate,
  onSelect,
}: OverlayItemProps) {
  const x = (overlay.xPct / 100) * videoSize.width;
  const y = (overlay.yPct / 100) * videoSize.height;
  const width = (overlay.wPct / 100) * videoSize.width;
  const height = (overlay.hPct / 100) * videoSize.height;

  const handleDragStop = (_e: any, d: any) => {
    const xPct = (d.x / videoSize.width) * 100;
    const yPct = (d.y / videoSize.height) * 100;
    onUpdate({ xPct, yPct });
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: any
  ) => {
    const wPct = (ref.offsetWidth / videoSize.width) * 100;
    const hPct = (ref.offsetHeight / videoSize.height) * 100;
    const xPct = (position.x / videoSize.width) * 100;
    const yPct = (position.y / videoSize.height) * 100;
    onUpdate({ wPct, hPct, xPct, yPct });
  };

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      style={{
        border: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'move',
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={onSelect}
    >
      <div className="w-full h-full flex items-center justify-center">
        {overlay.type === 'text' && (
          <div
            style={{
              color: overlay.styles?.color || '#ffffff',
              fontSize: `${overlay.styles?.fontSizePx || 24}px`,
              fontFamily: overlay.styles?.fontFamily || 'Arial',
              wordWrap: 'break-word',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '8px',
            }}
          >
            {overlay.text || 'Text Overlay'}
          </div>
        )}
        {overlay.type === 'image' && overlay.src && (
          <img
            src={overlay.src}
            alt="Overlay"
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
      </div>
    </Rnd>
  );
}
