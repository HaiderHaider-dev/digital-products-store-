/**
 * useFrameScrubber
 * 
 * Maps cursor X-position within a container to a frame index (0–299).
 * 
 * Frame sequence (analyzed from actual PNG frames):
 * ─────────────────────────────────────────────────
 *   Frame   0 :  Head looking STRAIGHT (center/idle)
 *   Frame  ~60:  Head looking LEFT (from viewer's perspective)  ← maximum left
 *   Frame ~120:  Head returning to CENTER
 *   Frame ~150:  Head looking RIGHT (from viewer's perspective) ← maximum right
 *   Frame ~210:  Head returning to CENTER
 *   Frame ~270:  Head back to STRAIGHT (idle)
 * ─────────────────────────────────────────────────
 * 
 * Strategy (direct frame mapping — NO canvas flipping):
 *   - Mouse at center of hero → frame 0 (idle / center)
 *   - Mouse moves LEFT        → scrub 0 → ~75 (head looks left)
 *   - Mouse moves RIGHT       → scrub ~225 → ~150 (head looks right, reversed)
 *   
 *   Smooth interpolation via lerp in a rAF loop.
 *   On mouse leave → graceful ease back to idle (frame 0).
 */

import { useRef, useCallback, useEffect, useState } from 'react';

const TOTAL_FRAMES = 300;

// Key frame positions (from visual analysis)
const IDLE_FRAME = 0;            // Center / idle
const MAX_LEFT_FRAME = 75;       // Head looking full left
const CENTER_RETURN_FRAME = 120; // After left, returns to center
const MAX_RIGHT_FRAME = 150;     // Head looking full right
const RETURN_TO_IDLE = 225;      // After right, nearing idle again

const LERP_SPEED = 0.08;        // Smooth interpolation factor
const RETURN_LERP_SPEED = 0.05; // Even smoother ease-back to idle
const DEAD_ZONE = 0.04;         // Center dead zone (4% of width)

export interface FrameScrubberState {
  currentFrame: number;
  isHovering: boolean;
}

export function useFrameScrubber(containerRef: React.RefObject<HTMLElement | null>) {
  const [state, setState] = useState<FrameScrubberState>({
    currentFrame: IDLE_FRAME,
    isHovering: false,
  });

  const targetFrameRef = useRef(IDLE_FRAME);
  const currentFrameRef = useRef(IDLE_FRAME);
  const isHoveringRef = useRef(false);
  const rafIdRef = useRef<number>(0);

  // Lerp helper
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  /**
   * Map normalized X position to frame index.
   * normalizedX: -1 (far left) ... 0 (center) ... +1 (far right)
   */
  const mapToFrame = useCallback((normalizedX: number): number => {
    // Dead zone → stay at idle
    if (Math.abs(normalizedX) < DEAD_ZONE) {
      return IDLE_FRAME;
    }

    if (normalizedX < 0) {
      // ── MOUSE MOVING LEFT → head should look LEFT ──
      // Map -1...-DEAD_ZONE → frames 0...MAX_LEFT_FRAME
      const intensity = Math.min(Math.abs(normalizedX) / (1 - DEAD_ZONE), 1);
      const eased = 1 - Math.pow(1 - intensity, 2.5); // Ease-out curve
      return Math.round(eased * MAX_LEFT_FRAME);
    } else {
      // ── MOUSE MOVING RIGHT → head should look RIGHT ──
      // The right-looking frames are around 150. To get there from idle (0),
      // we go backwards: TOTAL_FRAMES-1 → MAX_RIGHT_FRAME
      // i.e., frame 299 → 150 as intensity goes 0 → 1
      const intensity = Math.min(normalizedX / (1 - DEAD_ZONE), 1);
      const eased = 1 - Math.pow(1 - intensity, 2.5); // Ease-out curve
      return Math.round(TOTAL_FRAMES - 1 - eased * (TOTAL_FRAMES - 1 - MAX_RIGHT_FRAME));
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const speed = isHoveringRef.current ? LERP_SPEED : RETURN_LERP_SPEED;
    const target = isHoveringRef.current ? targetFrameRef.current : IDLE_FRAME;
    
    const current = currentFrameRef.current;

    // Handle wrap-around: choose the shortest path
    // e.g., going from frame 5 to frame 280 should go 5→4→3→2→1→0→299→298...→280
    let diff = target - current;
    
    // If target is in the "right" range (150-299) and current is near 0,
    // or vice-versa, take the short path through 0/299
    if (Math.abs(diff) > TOTAL_FRAMES / 2) {
      if (diff > 0) {
        diff -= TOTAL_FRAMES;
      } else {
        diff += TOTAL_FRAMES;
      }
    }

    let next = current + diff * speed;
    
    // Normalize to 0-299 range
    if (next < 0) next += TOTAL_FRAMES;
    if (next >= TOTAL_FRAMES) next -= TOTAL_FRAMES;

    // Snap when very close
    if (Math.abs(diff) < 0.5) {
      currentFrameRef.current = target;
    } else {
      currentFrameRef.current = next;
    }

    // Clamp frame index
    let frameIndex = Math.round(currentFrameRef.current) % TOTAL_FRAMES;
    if (frameIndex < 0) frameIndex += TOTAL_FRAMES;

    setState({
      currentFrame: frameIndex,
      isHovering: isHoveringRef.current,
    });

    rafIdRef.current = requestAnimationFrame(animate);
  }, []);

  // Mouse & Touch handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    // Normalize X: -1 (left edge) to +1 (right edge)
    const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    
    targetFrameRef.current = mapToFrame(normalizedX);
    isHoveringRef.current = true;
  }, [containerRef, mapToFrame]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    targetFrameRef.current = IDLE_FRAME;
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const normalizedX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    
    targetFrameRef.current = mapToFrame(normalizedX);
    isHoveringRef.current = true;
  }, [containerRef, mapToFrame]);

  const handleTouchEnd = useCallback(() => {
    isHoveringRef.current = false;
    targetFrameRef.current = IDLE_FRAME;
  }, []);

  // Setup listeners & animation loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseenter', handleMouseEnter);

    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseenter', handleMouseEnter);

      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      cancelAnimationFrame(rafIdRef.current);
    };
  }, [containerRef, handleMouseMove, handleMouseLeave, handleMouseEnter, handleTouchMove, handleTouchEnd, animate]);

  return state;
}
