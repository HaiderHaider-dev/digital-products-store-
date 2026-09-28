/**
 * useFramePreloader
 * 
 * Preloads all 300 character frames into memory for instant scrubbing.
 * Shows loading progress and provides Image objects for canvas rendering.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_FRAMES = 300;

function getFramePath(index: number): string {
  return `/frames/website_${index}.png`;
}

export interface FramePreloaderState {
  isLoaded: boolean;
  progress: number;      // 0 to 1
  frames: HTMLImageElement[];
}

export function useFramePreloader(): FramePreloaderState {
  const [state, setState] = useState<FramePreloaderState>({
    isLoaded: false,
    progress: 0,
    frames: [],
  });

  const loadedCountRef = useRef(0);
  const framesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let cancelled = false;

    const onLoad = () => {
      if (cancelled) return;
      loadedCount++;
      loadedCountRef.current = loadedCount;

      const progress = loadedCount / TOTAL_FRAMES;
      
      if (loadedCount === TOTAL_FRAMES) {
        framesRef.current = images;
        setState({
          isLoaded: true,
          progress: 1,
          frames: images,
        });
      } else {
        // Update progress every 5 frames to avoid excessive re-renders
        if (loadedCount % 5 === 0 || loadedCount === TOTAL_FRAMES) {
          setState(prev => ({
            ...prev,
            progress,
          }));
        }
      }
    };

    // Load frames in priority order: 
    // First load idle (0) and every 10th frame for fast first paint
    // Then fill in the rest
    const priorityOrder: number[] = [];
    
    // Phase 1: Every 30th frame (skeleton)
    for (let i = 0; i < TOTAL_FRAMES; i += 30) {
      priorityOrder.push(i);
    }
    // Phase 2: Every 10th frame
    for (let i = 0; i < TOTAL_FRAMES; i += 10) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }
    // Phase 3: All remaining
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }

    // Load in batches to avoid overwhelming the browser
    const BATCH_SIZE = 15;
    let batchIndex = 0;

    function loadBatch() {
      if (cancelled) return;
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);
      
      for (let b = start; b < end; b++) {
        const i = priorityOrder[b];
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          onLoad();
        };
        img.onerror = () => {
          // Still count as loaded to not block
          onLoad();
        };
        img.src = getFramePath(i);
        images[i] = img;
      }

      batchIndex++;
      if (end < TOTAL_FRAMES) {
        // Stagger batches slightly to keep UI responsive
        setTimeout(loadBatch, 16);
      }
    }

    loadBatch();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
