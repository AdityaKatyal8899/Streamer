import React, { useRef, useState } from 'react';
import { Plus, Type, Image as ImageIcon, Palette } from 'lucide-react';
import { OverlayData } from './OverlayItem';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Slider } from '@/app/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface OverlayControlsProps {
  overlays: OverlayData[];
  selectedOverlayId: string | null;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onUpdateOverlay: (id: string, updates: Partial<OverlayData>) => void;
}

export function OverlayControls({
  overlays,
  selectedOverlayId,
  onAddText,
  onAddImage,
  onUpdateOverlay,
}: OverlayControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(true);

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId);
  const isTextSelected = selectedOverlay?.type === 'text';

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-20 transition-all ${collapsed ? 'w-8' : 'w-72'} bg-zinc-800 border border-zinc-700 rounded-r-lg shadow-2xl`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-8 top-1/2 -translate-y-1/2 bg-zinc-800 text-white px-2 py-1 rounded-r-lg border border-zinc-700"
      >
        {collapsed ? '›' : '‹'}
      </button>
      {!collapsed && (
      <div className="p-6">
      <h2 className="text-white font-semibold text-lg mb-4">Overlay Controls</h2>

      {/* Add Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={onAddText}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Type className="mr-2 h-4 w-4" />
          Add Text
        </Button>
        <Button
          onClick={handleImageClick}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Text Styling Controls */}
      {isTextSelected && selectedOverlay && (
        <div className="space-y-4 border-t border-zinc-700 pt-4">
          <h3 className="text-white font-medium text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Text Styling
          </h3>

          {/* Text Content */}
          <div className="space-y-2">
            <Label htmlFor="text-content" className="text-zinc-300">
              Text
            </Label>
            <Input
              id="text-content"
              value={selectedOverlay.text || ''}
              onChange={(e) =>
                onUpdateOverlay(selectedOverlay.id, { text: e.target.value })
              }
              placeholder="Enter text..."
              className="bg-zinc-700 border-zinc-600 text-white"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="text-color" className="text-zinc-300">
              Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={selectedOverlay.styles?.color || '#ffffff'}
                onChange={(e) =>
                  onUpdateOverlay(selectedOverlay.id, {
                    styles: {
                      ...selectedOverlay.styles,
                      color: e.target.value,
                      fontSizePx: selectedOverlay.styles?.fontSizePx || 24,
                      fontFamily: selectedOverlay.styles?.fontFamily || 'Arial',
                    },
                  })
                }
                className="w-16 h-10 cursor-pointer bg-zinc-700 border-zinc-600"
              />
              <Input
                type="text"
                value={selectedOverlay.styles?.color || '#ffffff'}
                onChange={(e) =>
                  onUpdateOverlay(selectedOverlay.id, {
                    styles: {
                      ...selectedOverlay.styles,
                      color: e.target.value,
                      fontSizePx: selectedOverlay.styles?.fontSizePx || 24,
                      fontFamily: selectedOverlay.styles?.fontFamily || 'Arial',
                    },
                  })
                }
                className="flex-1 bg-zinc-700 border-zinc-600 text-white"
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="font-size" className="text-zinc-300">
              Font Size: {selectedOverlay.styles?.fontSizePx || 24}px
            </Label>
            <Slider
              id="font-size"
              min={12}
              max={120}
              step={1}
              value={[selectedOverlay.styles?.fontSizePx || 24]}
              onValueChange={(value) =>
                onUpdateOverlay(selectedOverlay.id, {
                  styles: {
                    ...selectedOverlay.styles,
                    fontSizePx: value[0],
                    color: selectedOverlay.styles?.color || '#ffffff',
                    fontFamily: selectedOverlay.styles?.fontFamily || 'Arial',
                  },
                })
              }
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="font-family" className="text-zinc-300">
              Font Family
            </Label>
            <Select
              value={selectedOverlay.styles?.fontFamily || 'Arial'}
              onValueChange={(value) =>
                onUpdateOverlay(selectedOverlay.id, {
                  styles: {
                    ...selectedOverlay.styles,
                    fontFamily: value,
                    color: selectedOverlay.styles?.color || '#ffffff',
                    fontSizePx: selectedOverlay.styles?.fontSizePx || 24,
                  },
                })
              }
            >
              <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                <SelectItem value="Pacifico">Pacifico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!selectedOverlay && (
        <p className="text-zinc-400 text-sm text-center py-4">
          Select an overlay to edit its properties
        </p>
      )}
      </div>
      )}
    </div>
  );
}
