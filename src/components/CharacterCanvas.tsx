/**
 * CharacterCanvas
 * 
 * High-performance canvas renderer for character frame sequences.
 * Uses smart nearest-frame fallback so the canvas renders instantly
 * without waiting for 100% of frames to download.
 */

import React, { useRef, useEffect, useCallback } from 'react';

interface CharacterCanvasProps {
  frames: HTMLImageElement[];
  currentFrame: number;
  className?: string;
  style?: React.CSSProperties;
}

function getBestFrame(frames: HTMLImageElement[], targetIndex: number): HTMLImageElement | null {
  if (!frames || frames.length === 0) return null;

  // 1. Direct hit
  const exact = frames[targetIndex];
  if (exact && exact.complete && exact.naturalWidth > 0) {
    return exact;
  }

  // 2. Search outwards for the nearest available loaded frame
  let offset = 1;
  const maxOffset = Math.max(targetIndex, frames.length - targetIndex);
  while (offset <= maxOffset) {
    const prev = targetIndex - offset;
    if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) {
      return frames[prev];
    }
    const next = targetIndex + offset;
    if (next < frames.length && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) {
      return frames[next];
    }
    offset++;
  }

  return null;
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  frames,
  currentFrame,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDrawnImgRef = useRef<HTMLImageElement | null>(null);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = getBestFrame(frames, frameIndex);
    if (!img) return;

    // Avoid unnecessary duplicate draws of the exact same image
    if (lastDrawnImgRef.current === img && canvas.width > 0) return;
    lastDrawnImgRef.current = img;

    // Match canvas pixel dimensions to display size (DPR-aware)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = container.clientWidth;
    const displayH = container.clientHeight;
    const canvasW = Math.round(displayW * dpr);
    const canvasH = Math.round(displayH * dpr);

    if (canvas.width !== canvasW || canvas.height !== canvasH) {
      canvas.width = canvasW;
      canvas.height = canvasH;
    }

    // Cover logic (object-fit: cover)
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const imgAspect = imgW / imgH;
    const canvasAspect = canvasW / canvasH;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (canvasAspect > imgAspect) {
      drawW = canvasW;
      drawH = canvasW / imgAspect;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawH = canvasH;
      drawW = canvasH * imgAspect;
      drawX = (canvasW - drawW) / 2;
      const verticalOverflow = drawH - canvasH;
      drawY = -(verticalOverflow * 0.1);
    }

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [frames]);

  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      lastDrawnImgRef.current = null;
      drawFrame(currentFrame);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [currentFrame, drawFrame]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'auto',
        }}
      />
    </div>
  );
};
