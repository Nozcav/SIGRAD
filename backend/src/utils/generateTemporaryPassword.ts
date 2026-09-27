import { randomInt } from "node:crypto";

// Alfabeto sin caracteres ambiguos (sin 0/O, 1/I/l) para que la contrasena
// temporal sea facil de leer y transcribir cuando el administrador la
// comparte con el usuario por un canal externo (no la genera el usuario).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const PASSWORD_LENGTH = 10;

export const generateTemporaryPassword = (): string => {
  let password = "";
  for (let i = 0; i < PASSWORD_LENGTH; i += 1) {
    password += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return password;
};
