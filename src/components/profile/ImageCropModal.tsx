import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { cn } from '../../utils/helpers';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (blob: Blob) => void;
  imageFile: File | null;
  mode: 'avatar' | 'banner';
}

const CROP_SIZES = {
  avatar: { width: 400, height: 400, label: 'Profile Photo', aspectLabel: '1:1' },
  banner: { width: 1200, height: 400, label: 'Banner Image', aspectLabel: '3:1' },
};

export function ImageCropModal({ isOpen, onClose, onCrop, imageFile, mode }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const cropSize = CROP_SIZES[mode];
  const previewW = mode === 'avatar' ? 300 : 480;
  const previewH = mode === 'avatar' ? 300 : 160;

  // Load image
  useEffect(() => {
    if (!imageFile || !isOpen) return;
    setImgLoaded(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImgLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [imageFile, isOpen]);

  // Draw canvas preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = previewW;
    canvas.height = previewH;

    ctx.clearRect(0, 0, previewW, previewH);

    // Scale image to fit preview at zoom=1
    const scaleToFit = Math.max(previewW / naturalSize.w, previewH / naturalSize.h);
    const scaledW = naturalSize.w * scaleToFit * zoom;
    const scaledH = naturalSize.h * scaleToFit * zoom;

    const drawX = (previewW - scaledW) / 2 + position.x;
    const drawY = (previewH - scaledH) / 2 + position.y;

    ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
  }, [imgLoaded, zoom, position, previewW, previewH, naturalSize]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch handlers
  const touchStartRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, px: position.x, py: position.y };
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    setPosition({ x: touchStartRef.current.px + dx, y: touchStartRef.current.py + dy });
  };
  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = cropSize.width;
    outputCanvas.height = cropSize.height;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Scale from preview coords to output coords
    const scaleX = cropSize.width / previewW;
    const scaleY = cropSize.height / previewH;

    const scaleToFit = Math.max(previewW / naturalSize.w, previewH / naturalSize.h);
    const scaledW = naturalSize.w * scaleToFit * zoom;
    const scaledH = naturalSize.h * scaleToFit * zoom;
    const drawX = (previewW - scaledW) / 2 + position.x;
    const drawY = (previewH - scaledH) / 2 + position.y;

    ctx.drawImage(
      img,
      drawX * scaleX, drawY * scaleY,
      scaledW * scaleX, scaledH * scaleY
    );

    outputCanvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Crop ${cropSize.label}`} size="md">
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          Drag to reposition · Scroll or use slider to zoom · Aspect ratio: {cropSize.aspectLabel}
        </p>

        {/* Crop preview */}
        <div
          ref={previewRef}
          className={cn(
            'relative mx-auto overflow-hidden bg-gray-100 dark:bg-gray-700 select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            mode === 'avatar' ? 'rounded-full' : 'rounded-2xl'
          )}
          style={{ width: previewW, height: previewH }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {imgLoaded ? (
            <canvas
              ref={canvasRef}
              style={{ width: previewW, height: previewH, display: 'block' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Grid overlay for avatar */}
          {mode === 'avatar' && imgLoaded && (
            <div className="absolute inset-0 rounded-full ring-2 ring-white/30 pointer-events-none" />
          )}
        </div>

        {/* Rule of thirds overlay hint */}
        {mode === 'banner' && imgLoaded && (
          <div className="relative mx-auto overflow-hidden pointer-events-none" style={{ width: previewW, height: 0 }}>
          </div>
        )}

        {/* Zoom control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={50} max={400} step={5}
            value={Math.round(zoom * 100)}
            onChange={e => setZoom(Number(e.target.value) / 100)}
            className="flex-1 accent-indigo-600"
          />
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.1))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            <X size={14} /> Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={!imgLoaded}
            className="btn-primary flex-1 justify-center"
          >
            <Check size={14} /> Apply Crop
          </button>
        </div>
      </div>
    </Modal>
  );
}
