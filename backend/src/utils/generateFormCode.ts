import { randomInt } from "node:crypto";
import { prisma } from "../config/db";

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I) para que el codigo sea facil de leer y transcribir
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 10;

const randomSegment = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return result;
};

export const generateUniqueFormCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = `SIG-${randomSegment(CODE_LENGTH)}`;

    const existing = await prisma.form.findUnique({
      where: { code: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(
    "No se pudo generar un codigo unico para el formulario tras varios intentos, intenta nuevamente"
  );
};
