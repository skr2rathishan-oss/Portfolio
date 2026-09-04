import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  glow: boolean;
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      // Skip if width is unchanged and height change is small (e.g. mobile URL bar show/hide)
      if (canvas.width === newWidth && Math.abs(canvas.height - newHeight) < 160) {
        return;
      }
      width = canvas.width = newWidth;
      height = canvas.height = newHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate constellation nodes focused on center-right and ambient space
    const particleCount = Math.floor(Math.min(width, 1400) / 22);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const biasRight = Math.random() > 0.35;
      const x = biasRight
        ? width * 0.45 + Math.random() * (width * 0.55)
        : Math.random() * width;
      const y = Math.random() * height;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() > 0.85 ? 2.5 : Math.random() > 0.5 ? 1.8 : 1.2,
        baseAlpha: Math.random() * 0.6 + 0.3,
        glow: Math.random() > 0.7,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle 3D rotating elliptical wireframe rings centered on right-hero area
      const centerX = width > 1024 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.45;
      const ringRadiusX = Math.min(width * 0.22, 220);
      const ringRadiusY = ringRadiusX * 0.38;

      angle += 0.002;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Ring 1 (tilted)
      ctx.save();
      ctx.rotate(-0.25 + Math.sin(angle * 0.5) * 0.05);
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 171, 240, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ring 2 (larger, tilted opposite)
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX * 1.35, ringRadiusY * 1.3, 0.35, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 171, 240, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ring 3 (outer faint)
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX * 1.7, ringRadiusY * 1.6, -0.15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 171, 240, 0.03)';
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.restore();

      // 2. Update and draw connected constellation lines
      const maxDistance = width > 768 ? 130 : 90;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries smoothly
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 171, 240, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. Draw particles / nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.baseAlpha})`;
        ctx.fill();

        if (p.glow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 171, 240, ${p.baseAlpha * 0.35})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep atmospheric backdrop with cyan ambient glow hotspots */}
      <div 
        className="absolute inset-0 bg-[#06101c]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 75% 42%, rgba(0, 171, 240, 0.14) 0%, rgba(3, 105, 161, 0.05) 35%, transparent 65%),
            radial-gradient(circle at 20% 25%, rgba(0, 171, 240, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(2, 132, 199, 0.06) 0%, transparent 50%)
          `
        }}
      />

      {/* Grid Pattern overlay with refined perspective mask */}
      <div className="absolute inset-0 modern-grid-bg opacity-70" />

      {/* Animated Canvas Constellation Network */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

