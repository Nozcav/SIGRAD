import { useEffect, useRef } from "react";

// Resplandor grande y suave que sigue al cursor con un pequeno retraso
// (lerp), como una fuente de luz que se mueve por la pagina. Es una capa
// CSS aparte del canvas de particulas: mas barata (compuesta por el GPU)
// y le da una segunda capa de profundidad al fondo.
export const MouseSpotlight = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let animationFrameId: number;
    let hasMoved = false;

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!hasMoved) {
        current.x = target.x;
        current.y = target.y;
        hasMoved = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const step = () => {
      if (prefersReducedMotion) {
        current.x = target.x;
        current.y = target.y;
      } else {
        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
      }

      spotlight.style.setProperty("--spotlight-x", `${current.x}px`);
      spotlight.style.setProperty("--spotlight-y", `${current.y}px`);
      spotlight.style.opacity = hasMoved ? "1" : "0";

      animationFrameId = requestAnimationFrame(step);
    };

    step();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(650px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(163, 230, 53, 0.10), rgba(16, 185, 129, 0.05) 40%, transparent 65%)",
      }}
    />
  );
};
