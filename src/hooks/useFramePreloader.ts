/**
 * useFramePreloader
 * 
 * Progressive, instant-paint frame preloader for 3D character sequences.
 * Returns isLoaded = true as soon as initial skeleton frames (5-8 frames)
 * finish loading (~150ms), allowing instant interactive canvas rendering
 * without blocking UI thread or network.
 */

import { useState, useEffect, useRef } from 'react';

const TOTAL_FRAMES = 300;
const INITIAL_PAINT_THRESHOLD = 5; // Unblock hero section after just 5 key frames load!

function getFramePath(index: number): string {
  return `/frames/website_${index}.png`;
}

export interface FramePreloaderState {
  isLoaded: boolean;
  progress: number; // 0 to 1
  frames: HTMLImageElement[];
}

export function useFramePreloader(): FramePreloaderState {
  const [state, setState] = useState<FramePreloaderState>({
    isLoaded: false,
    progress: 0,
    frames: [],
  });

  const loadedCountRef = useRef(0);
  const isLoadedEmittedRef = useRef(false);

  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let cancelled = false;

    // Priority 1: Key skeleton frames for instant first paint
    const priorityOrder: number[] = [];
    
    // Skeleton step 1: Key milestones (0, 30, 60, 90, 120, 150, 180, 210, 240, 270)
    for (let i = 0; i < TOTAL_FRAMES; i += 30) {
      priorityOrder.push(i);
    }
    // Skeleton step 2: Every 10th frame
    for (let i = 0; i < TOTAL_FRAMES; i += 10) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }
    // Skeleton step 3: All remaining frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!priorityOrder.includes(i)) priorityOrder.push(i);
    }

    const onLoad = () => {
      if (cancelled) return;
      loadedCount++;
      loadedCountRef.current = loadedCount;
      const progress = loadedCount / TOTAL_FRAMES;

      const readyForPaint = loadedCount >= INITIAL_PAINT_THRESHOLD || loadedCount === TOTAL_FRAMES;

      if (readyForPaint && !isLoadedEmittedRef.current) {
        isLoadedEmittedRef.current = true;
        setState({
          isLoaded: true,
          progress: progress,
          frames: images,
        });
      } else if (isLoadedEmittedRef.current && (loadedCount % 10 === 0 || loadedCount === TOTAL_FRAMES)) {
        setState({
          isLoaded: true,
          progress: progress,
          frames: images,
        });
      }
    };

    // Load in small staggered background batches to avoid network congestion
    const BATCH_SIZE = 10;
    let batchIndex = 0;

    function loadBatch() {
      if (cancelled) return;
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);

      for (let b = start; b < end; b++) {
        const frameIdx = priorityOrder[b];
        const img = new Image();
        img.decoding = 'async';
        img.onload = onLoad;
        img.onerror = onLoad;
        img.src = getFramePath(frameIdx);
        images[frameIdx] = img;
      }

      batchIndex++;
      if (end < TOTAL_FRAMES) {
        // Stagger next batch by 40ms to keep main thread smooth
        setTimeout(loadBatch, 40);
      }
    }

    loadBatch();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
