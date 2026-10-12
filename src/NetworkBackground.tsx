// Ambient constellation behind the site: the one perpetual animation.
//  - DPR-aware (capped at 1.5x), ~30fps (24fps below 768px), pauses while the tab is hidden;
//  - a single static frame for prefers-reduced-motion and Save-Data;
//  - links are batched into a few alpha buckets (one path + stroke each), no per-frame allocations;
//  - particles are regenerated after a significant resize/rotation.
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fill: string;
  /** Soft cyan halo (larger screens only); empty when the particle has none. */
  halo: string;
}

const FRAME_MS_DESKTOP = 1000 / 30;
const FRAME_MS_MOBILE = 1000 / 24;
const BUCKETS = 5;
const LINK_ALPHA = 0.28;
/** Stroke colour per bucket: bucket k covers link strength (1 - d/max) in [k/5, (k+1)/5), drawn at its midpoint. */
const BUCKET_STYLES = Array.from(
  { length: BUCKETS },
  (_, k) => `rgba(0, 171, 240, ${(((k + 0.5) / BUCKETS) * LINK_ALPHA).toFixed(3)})`,
);

function shouldAnimate(): boolean {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduce && !saveData;
}

function linkDistance(width: number): number {
  return width >= 1024 ? 140 : width >= 768 ? 120 : 96;
}

function makeParticles(width: number, height: number): Particle[] {
  const density = width < 768 ? 1 / 13000 : 1 / 17000;
  const count = Math.min(72, Math.max(20, Math.round(width * height * density)));
  const wide = width >= 1024;
  const halos = width >= 768;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // On wide screens bias towards the right, where the hero portrait sits.
    const right = wide && Math.random() < 0.6;
    const roll = Math.random();
    const r = roll < 0.5 ? 1.2 : roll < 0.85 ? 1.6 : 2.2;
    const a = 0.35 + Math.random() * 0.5;
    particles.push({
      x: right ? width * 0.45 + Math.random() * width * 0.55 : Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r,
      fill: `rgba(186, 230, 253, ${a.toFixed(3)})`,
      halo: halos && Math.random() < 0.25 ? `rgba(0, 171, 240, ${(a * 0.3).toFixed(3)})` : '',
    });
  }
  return particles;
}

export default function NetworkBackground({ subdued = false }: { subdued?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let last = 0;
    let frameMs = FRAME_MS_DESKTOP;
    let animating = shouldAnimate();
    // Squared distance thresholds between buckets, and per-bucket pair lists (preallocated per particle set).
    let maxD2 = 0;
    const edges = new Float64Array(BUCKETS);
    let pairs: Uint16Array[] = [];
    const counts = new Uint32Array(BUCKETS);

    const allocate = () => {
      const n = particles.length;
      const maxPairs = (n * (n - 1)) / 2;
      pairs = Array.from({ length: BUCKETS }, () => new Uint16Array(maxPairs * 2));
    };

    const setLinkDistance = () => {
      const max = linkDistance(width);
      maxD2 = max * max;
      // Bucket k holds strengths >= k/5, i.e. distances <= max * (1 - k/5).
      for (let k = 0; k < BUCKETS; k++) {
        const d = max * (1 - k / BUCKETS);
        edges[k] = d * d;
      }
    };

    const resize = (force = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Ignore small height changes (mobile URL bar show/hide).
      if (!force && w === width && Math.abs(h - height) < 160) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const significant = Math.abs(w - width) > 120 || Math.abs(h - height) > 200;
      width = w;
      height = h;
      frameMs = w < 768 ? FRAME_MS_MOBILE : FRAME_MS_DESKTOP;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setLinkDistance();
      if (force || significant || particles.length === 0) {
        particles = makeParticles(w, h);
        allocate();
      }
      if (!animating) draw(false);
    };

    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const n = particles.length;

      if (move) {
        for (let i = 0; i < n; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }
      }

      // Links: sort each close pair into an alpha bucket, then one path per bucket.
      counts.fill(0);
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= maxD2) continue;
          let k = BUCKETS - 1;
          while (k > 0 && d2 > edges[k]) k--;
          const list = pairs[k];
          const c = counts[k];
          list[c] = i;
          list[c + 1] = j;
          counts[k] = c + 2;
        }
      }
      ctx.lineWidth = 0.8;
      for (let k = 0; k < BUCKETS; k++) {
        const c = counts[k];
        if (c === 0) continue;
        const list = pairs[k];
        ctx.beginPath();
        for (let m = 0; m < c; m += 2) {
          const p = particles[list[m]];
          const q = particles[list[m + 1]];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = BUCKET_STYLES[k];
        ctx.stroke();
      }

      // Nodes (halo first, then the dot). Never shadowBlur.
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        if (p.halo) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.halo;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.fill;
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      if (t - last < frameMs) return;
      last = t;
      draw(true);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (animating && !document.hidden) frame = requestAnimationFrame(loop);
      else draw(false);
    };

    const onPrefChange = () => {
      animating = shouldAnimate();
      start();
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else start();
    };
    const onResize = () => resize(false);

    const mqs = [window.matchMedia('(prefers-reduced-motion: reduce)')];
    mqs.forEach((mq) => mq.addEventListener('change', onPrefChange));
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    resize(true);
    start();

    return () => {
      cancelAnimationFrame(frame);
      mqs.forEach((mq) => mq.removeEventListener('change', onPrefChange));
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-canvas">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 38%, rgba(0, 171, 240, 0.12) 0%, rgba(0, 171, 240, 0.03) 35%, transparent 62%), radial-gradient(circle at 12% 18%, rgba(0, 171, 240, 0.05) 0%, transparent 42%), radial-gradient(circle at 50% 85%, rgba(2, 132, 199, 0.06) 0%, transparent 50%)',
        }}
      />
      {/* Faint static grid, Home only: masked to the middle of the first screen. */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: subdued ? 0 : 1,
          backgroundImage:
            'linear-gradient(to right, rgb(0 171 240 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 171 240 / 0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 55% 40%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 55% 40%, black 10%, transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-500"
        style={{ opacity: subdued ? 0.45 : 1 }}
      />
    </div>
  );
}
