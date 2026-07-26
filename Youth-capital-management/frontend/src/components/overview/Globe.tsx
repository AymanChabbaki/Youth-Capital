import createGlobe from "cobe";
import { useEffect, useRef } from "react";

// Rabat, Morocco — the marker + the globe's resting orientation both point here.
const MOROCCO: [number, number] = [34.0209, -6.8416];
const SIZE = 220; // matches .stat-card-map-globe-wrap's fixed CSS size

// The phi value where the marker faces the viewer head-on (empirically
// tuned — this is also why the globe starts at phi=4.2 instead of 0).
const FACING_PHI = 4.2;
const FACING_WINDOW = 0.25; // radians of tolerance either side of FACING_PHI

export function Globe({ onFacingChange }: { onFacingChange?: (facing: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // A ref, not a dependency — so the animation effect below never has to
  // see this prop change and re-run. It reads the latest callback each
  // frame without needing to tear down and recreate the globe (which was
  // resetting phi back to FACING_PHI every time facing toggled, making the
  // globe look stuck instead of rotating).
  const onFacingChangeRef = useRef(onFacingChange);
  onFacingChangeRef.current = onFacingChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = FACING_PHI; // starting rotation, roughly facing Morocco instead of a random side
    let globe: ReturnType<typeof createGlobe> | null = null;
    let frameId: number;
    let wasFacing = false;

    // Deferred a frame on purpose: React 18 StrictMode fires this effect,
    // its cleanup, then the effect again, synchronously, in dev. Creating
    // the WebGL globe eagerly meant the first (throwaway) instance and the
    // second raced on the same <canvas>'s GL context and broke it ("no
    // buffer bound" errors). Scheduling the real init via rAF means
    // StrictMode's fake mount gets cancelled before its frame ever fires,
    // so only the real mount actually creates a globe.
    const initId = requestAnimationFrame(() => {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: SIZE * 2,
        height: SIZE * 2,
        phi,
        theta: 0.3,
        dark: 0,
        diffuse: 1.3,
        mapSamples: 16000,
        mapBrightness: 3.5,
        baseColor: [0.22, 0.27, 0.42], // navy, back from grey
        markerColor: [0.4, 0.35, 0.92], // #6659ea
        glowColor: [0.4, 0.35, 0.92],
        markers: [{ location: MOROCCO, size: 0.09 }],
      });

      const animate = () => {
        phi += 0.004;
        globe!.update({ phi });

        // How far the current rotation is from the marker's front-facing
        // angle, wrapped into [0, 2π) so it doesn't matter how many times
        // phi has looped around.
        const twoPi = Math.PI * 2;
        const diff = Math.abs(((phi - FACING_PHI) % twoPi + twoPi + Math.PI) % twoPi - Math.PI);
        const isFacing = diff < FACING_WINDOW;
        if (isFacing !== wasFacing) {
          wasFacing = isFacing;
          onFacingChangeRef.current?.(isFacing);
        }

        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(initId);
      cancelAnimationFrame(frameId);
      globe?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE * 2}
      height={SIZE * 2}
      className="stat-card-map-globe"
      style={{ width: SIZE, height: SIZE }}
    />
  );
}
