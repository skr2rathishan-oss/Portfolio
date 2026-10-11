// Ambient constellation behind the site: the one perpetual animation.
//  - DPR-aware (capped at 1.5x), ~30fps, pauses while the tab is hidden;
//  - static single frame for prefers-reduced-motion, Save-Data and small screens;
//  - particles are regenerated after a significant resize/rotation.
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

const FRAME_MS = 1000 / 30;

function shouldAnimate(): boolean {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 1023px)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduce && !small && !saveData;
}

function makeParticles(width: number, height: number): Particle[] {
  const count = Math.max(18, Math.floor(Math.min(width, 1400) / 44));
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Bias towards the right half, where the hero portrait sits.
    const right = Math.random() > 0.4;
    particles.push({
      x: right ? width * 0.45 + Math.random() * width * 0.55 : Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() > 0.85 ? 2 : Math.random() > 0.5 ? 1.5 : 1.1,
      a: Math.random() * 0.45 + 0.25,
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
    let animating = shouldAnimate();

    const resize = (force = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Ignore small height changes (mobile URL bar show/hide).
      if (!force && w === width && Math.abs(h - height) < 160) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const significant = Math.abs(w - width) > 120 || Math.abs(h - height) > 200;
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (force || significant || particles.length === 0) particles = makeParticles(w, h);
      if (!animating) draw(false);
    };

    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const maxDist = width > 768 ? 130 : 90;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (move) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 171, 240, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.a})`;
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      if (t - last < FRAME_MS) return;
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

    const mqs = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(max-width: 1023px)'),
    ];
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
            'radial-gradient(circle at 78% 38%, rgba(0, 171, 240, 0.10) 0%, rgba(0, 171, 240, 0.03) 35%, transparent 62%), radial-gradient(circle at 12% 18%, rgba(0, 171, 240, 0.05) 0%, transparent 42%)',
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
