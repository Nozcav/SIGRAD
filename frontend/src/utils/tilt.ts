import { MouseEvent } from "react";

// Inclinacion 3D que sigue al cursor dentro de una tarjeta. No usa React
// state (evitaria re-renders en cada movimiento de mouse): escribe el estilo
// directo sobre el elemento via event.currentTarget, que funciona igual sobre
// un <div>, un <a> o un <button> sin necesidad de tipar un ref distinto.
const MAX_TILT_DEG = 8;
const LIFT_PX = 6;
const HOVER_SCALE = 1.015;

export const handleTiltMove = (event: MouseEvent<HTMLElement>): void => {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -MAX_TILT_DEG;
  const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * MAX_TILT_DEG;

  element.style.transform = `perspective(900px) translateY(-${LIFT_PX}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${HOVER_SCALE}, ${HOVER_SCALE}, ${HOVER_SCALE})`;
  element.style.transitionDuration = "0.1s";
};

export const handleTiltLeave = (event: MouseEvent<HTMLElement>): void => {
  const element = event.currentTarget;
  element.style.transform = "perspective(900px) translateY(0) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  element.style.transitionDuration = "0.6s";
};
