'use client';
import { useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';

const COLORS = ['#7B6FFF', '#2DD4BF', '#F59E0B', '#F87171', '#34D399', '#60A5FA', '#F472B6'];

interface Particle {
  x: number; y: number; r: number; c: string;
  vx: number; vy: number; rot: number; vrot: number;
  shape: 'rect' | 'circle';
}

export default function Confetti() {
  const { confettiTrigger } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (confettiTrigger === 0) return; // don't fire on initial mount
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const count = 140;
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      r: 4 + Math.random() * 5,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      vrot: -8 + Math.random() * 16,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let frame = 0;
    const maxFrames = 130;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        if (p.shape === 'rect') ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      frame++;
      if (frame < maxFrames) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [confettiTrigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 400 }}
      aria-hidden="true"
    />
  );
}
