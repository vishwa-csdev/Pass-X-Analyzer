import { useEffect, useRef, useCallback } from 'react';

const STAR_COUNT = 280;
const SHOOTING_STAR_INTERVAL = 3000;
const NEBULA_COLORS = [
  { r: 110, g: 86, b: 207 },  // signal purple
  { r: 45, g: 212, b: 191 },  // teal
  { r: 255, g: 77, b: 109 },  // pink
  { r: 80, g: 60, b: 180 },   // deep indigo
];

function SpaceBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastShootRef = useRef(0);

  const createStars = useCallback((width, height) => {
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        parallaxFactor: Math.random() * 0.03 + 0.005,
        // Some stars have color tint
        color: Math.random() > 0.85
          ? NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)]
          : { r: 255, g: 255, b: 255 },
      });
    }
    return stars;
  }, []);

  const spawnShootingStar = useCallback((width, height) => {
    const startX = Math.random() * width * 0.8;
    const startY = Math.random() * height * 0.4;
    const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
    const speed = Math.random() * 8 + 6;
    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: Math.random() * 0.015 + 0.01,
      length: Math.random() * 60 + 40,
      width: Math.random() * 1.5 + 0.8,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      starsRef.current = createStars(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const drawNebula = (ctx, w, h, time) => {
      // Draw soft nebula clouds
      const nebulae = [
        { cx: w * 0.2, cy: h * 0.3, rx: 350, ry: 250, color: NEBULA_COLORS[0], opacity: 0.06 },
        { cx: w * 0.75, cy: h * 0.15, rx: 300, ry: 200, color: NEBULA_COLORS[3], opacity: 0.04 },
        { cx: w * 0.5, cy: h * 0.7, rx: 400, ry: 300, color: NEBULA_COLORS[1], opacity: 0.035 },
        { cx: w * 0.85, cy: h * 0.65, rx: 250, ry: 200, color: NEBULA_COLORS[2], opacity: 0.03 },
      ];

      nebulae.forEach((n, i) => {
        const drift = Math.sin(time * 0.0003 + i * 1.5) * 20;
        const mx = mouseRef.current.x * 15;
        const my = mouseRef.current.y * 15;
        const grad = ctx.createRadialGradient(
          n.cx + drift + mx, n.cy + drift * 0.7 + my,
          0,
          n.cx + drift + mx, n.cy + drift * 0.7 + my,
          n.rx
        );
        grad.addColorStop(0, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity})`);
        grad.addColorStop(0.5, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.opacity * 0.4})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(
          n.cx + drift + mx, n.cy + drift * 0.7 + my,
          n.rx, n.ry, 0, 0, Math.PI * 2
        );
        ctx.fill();
      });
    };

    const drawStars = (ctx, time) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;
        const px = star.x + mx * star.parallaxFactor * 40;
        const py = star.y + my * star.parallaxFactor * 40;

        ctx.beginPath();
        ctx.arc(px, py, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha})`;
        ctx.fill();

        // Glow for bigger stars
        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(px, py, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, ${alpha * 0.1})`;
          ctx.fill();
        }
      });
    };

    const drawShootingStars = (ctx) => {
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) return false;

        const tailX = s.x - (s.vx / Math.sqrt(s.vx ** 2 + s.vy ** 2)) * s.length * s.life;
        const tailY = s.y - (s.vy / Math.sqrt(s.vx ** 2 + s.vy ** 2)) * s.length * s.life;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.life * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width * s.life;
        ctx.lineCap = 'round';
        ctx.stroke();

        // bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * s.life * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life * 0.6})`;
        ctx.fill();

        return true;
      });
    };

    const animate = (time) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Deep space gradient base
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.5, '#060612');
      bgGrad.addColorStop(1, '#020208');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      drawNebula(ctx, w, h, time);
      drawStars(ctx, time);

      // Shooting stars
      if (time - lastShootRef.current > SHOOTING_STAR_INTERVAL) {
        shootingStarsRef.current.push(spawnShootingStar(w, h));
        lastShootRef.current = time;
      }
      drawShootingStars(ctx);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [createStars, spawnShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}

export default SpaceBackground;
