// Dispara una explosion de particulas en el fondo animado global (ver
// AnimatedBackground.tsx). Se usa tras completar acciones importantes:
// enviar un formulario, crear un usuario, comentar, actualizar el perfil...
export const celebrate = (x?: number, y?: number): void => {
  const detailX = x ?? window.innerWidth / 2;
  const detailY = y ?? window.innerHeight / 3;

  window.dispatchEvent(
    new CustomEvent("sigrad:celebrate", { detail: { x: detailX, y: detailY } })
  );
};
