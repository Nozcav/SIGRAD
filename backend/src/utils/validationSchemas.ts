import { z } from "zod";
import { env } from "../config/env";

export const fullNameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres")
  .max(120)
  .regex(/^[\p{L} ]+$/u, "El nombre solo puede contener letras y espacios");

export const institutionalEmailSchema = z
  .string()
  .trim()
  .email("Correo invalido")
  .refine(
    (email) => email.toLowerCase().endsWith(`@${env.EMAIL_DOMAIN.toLowerCase()}`),
    `El correo debe pertenecer al dominio institucional (@${env.EMAIL_DOMAIN})`
  );

export const documentIdSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "La cedula debe contener entre 6 y 10 digitos");
