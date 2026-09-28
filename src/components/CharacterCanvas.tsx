/**
 * CharacterCanvas
 * 
 * High-performance canvas renderer for the character frame sequence.
 * Draws the frame image to fill the entire canvas using "cover" logic
 * (like CSS object-fit: cover) so the frame fully covers the hero section.
 * 
 * No flipping — the frame sequence itself contains both left/right head poses.
 */

import React, { useRef, useEffect, useCallback } from 'react';

interface CharacterCanvasProps {
  frames: HTMLImageElement[];
  currentFrame: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  frames,
  currentFrame,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFrameRef = useRef<number>(-1);

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = frames[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Only redraw if frame actually changed
    if (lastFrameRef.current === frameIndex) return;
    lastFrameRef.current = frameIndex;

    // Match canvas pixel dimensions to its CSS display size (DPR-aware)
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
    const displayW = container.clientWidth;
    const displayH = container.clientHeight;
    const canvasW = Math.round(displayW * dpr);
    const canvasH = Math.round(displayH * dpr);

    if (canvas.width !== canvasW || canvas.height !== canvasH) {
      canvas.width = canvasW;
      canvas.height = canvasH;
    }

    // "object-fit: cover" logic — scale image to fill, then crop
    // On portrait (mobile), bias crop upward so the character stays visible
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const imgAspect = imgW / imgH;
    const canvasAspect = canvasW / canvasH;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image → fit width, crop top/bottom
      drawW = canvasW;
      drawH = canvasW / imgAspect;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      // Canvas is taller than image (portrait/mobile) → fit height, crop sides
      // Bias the vertical offset: show character from ~15% down instead of dead-center
      // This keeps the character's head/body in frame
      drawH = canvasH;
      drawW = canvasH * imgAspect;
      drawX = (canvasW - drawW) / 2;
      // Slight upward bias: shift image up by 10% of the overflow
      const verticalOverflow = drawH - canvasH;
      drawY = -(verticalOverflow * 0.1);
    }

    // Clear and draw
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, [frames]);

  // Redraw on frame change
  useEffect(() => {
    drawFrame(currentFrame);
  }, [currentFrame, drawFrame]);

  // Handle container resize — redraw at new dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      lastFrameRef.current = -1; // Force redraw
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
