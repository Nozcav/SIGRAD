import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GlowOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const PARTICLE_RGB = "163, 230, 53"; // lime-400: los puntos
const LINE_RGB = "52, 211, 153"; // emerald-400: las conexiones entre puntos
const MOUSE_LINE_RGB = "190, 242, 100"; // lime-300: conexiones hacia el cursor, mas brillantes
const CONNECT_DISTANCE = 165;
const MOUSE_RADIUS = 190;

const ORB_COLORS = [
  "rgba(43, 115, 73, 0.16)", // brand-600
  "rgba(16, 185, 129, 0.14)", // emerald-500
  "rgba(163, 230, 53, 0.10)", // lime-400
];

const BURST_COLORS = ["163, 230, 53", "52, 211, 153", "110, 231, 183"];

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;
    const mouse = { x: -9999, y: -9999 };
    let bursts: BurstParticle[] = [];

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();

    const particleCount = Math.min(130, Math.max(45, Math.floor((width * height) / 11000)));
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 1,
    }));

    const orbCount = 6;
    const glowOrbs: GlowOrb[] = Array.from({ length: orbCount }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: 140 + Math.random() * 120,
      color: ORB_COLORS[index % ORB_COLORS.length],
    }));

    const spawnBurst = (x: number, y: number) => {
      if (prefersReducedMotion) {
        return;
      }
      const count = 14;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1.5 + Math.random() * 2.5;
        bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const handleClick = (event: MouseEvent) => {
      spawnBurst(event.clientX, event.clientY);
    };
    const handleResize = () => setSize();

    // Celebracion: cualquier componente de la app puede disparar esto (ver
    // utils/celebrate.ts) cuando el usuario completa una accion importante
    // (enviar un formulario, crear un usuario, comentar, etc.).
    const handleCelebrate = (event: Event) => {
      const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
      spawnBurst(detail.x, detail.y);
      spawnBurst(detail.x - 60, detail.y + 30);
      spawnBurst(detail.x + 60, detail.y - 30);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    window.addEventListener("sigrad:celebrate", handleCelebrate);

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      // Capa 1: manchas de luz grandes y difusas, dan profundidad de fondo
      for (const orb of glowOrbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < -orb.radius) orb.x = width + orb.radius;
          if (orb.x > width + orb.radius) orb.x = -orb.radius;
          if (orb.y < -orb.radius) orb.y = height + orb.radius;
          if (orb.y > height + orb.radius) orb.y = -orb.radius;
        }

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Capa 2: red de particulas conectadas, reacciona al cursor
      for (const particle of particles) {
        if (!prefersReducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < MOUSE_RADIUS && distance > 0.01) {
            const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
            particle.x += (dx / distance) * force * 1.6;
            particle.y += (dy / distance) * force * 1.6;
          }

          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;
          if (particle.y < -10) particle.y = height + 10;
          if (particle.y > height + 10) particle.y = -10;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_RGB}, 0.75)`;
        ctx.shadowColor = `rgba(${PARTICLE_RGB}, 0.95)`;
        ctx.shadowBlur = 7;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECT_DISTANCE) {
            const opacity = (1 - distance / CONNECT_DISTANCE) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const dxm = particles[i].x - mouse.x;
        const dym = particles[i].y - mouse.y;
        const distanceToMouse = Math.sqrt(dxm * dxm + dym * dym);
        const mouseConnectDistance = CONNECT_DISTANCE * 1.5;

        if (distanceToMouse < mouseConnectDistance) {
          const opacity = (1 - distanceToMouse / mouseConnectDistance) * 0.55;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${MOUSE_LINE_RGB}, ${opacity})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }

      // Capa 3: destellos que explotan al hacer clic en cualquier parte de la app
      if (bursts.length > 0) {
        bursts = bursts.filter((burst) => burst.life < burst.maxLife);
        for (const burst of bursts) {
          burst.x += burst.vx;
          burst.y += burst.vy;
          burst.vx *= 0.96;
          burst.vy *= 0.96;
          burst.life += 1;

          const progress = burst.life / burst.maxLife;
          const opacity = 1 - progress;
          const radius = 2.5 * (1 - progress * 0.6);

          ctx.beginPath();
          ctx.arc(burst.x, burst.y, Math.max(radius, 0), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${burst.color}, ${opacity})`;
          ctx.shadowColor = `rgba(${burst.color}, ${opacity})`;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    step();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("sigrad:celebrate", handleCelebrate);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
};
