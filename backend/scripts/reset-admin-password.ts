import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const resetAdminPassword = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!email) throw new Error("ADMIN_EMAIL no está configurado en backend/.env");

  const password = `${randomBytes(18).toString("base64url")}aA1!`;
  const passwordHash = await bcrypt.hash(password, 12);
  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "ADMIN", active: true, mustChangePassword: true },
    });
  } else {
    const documentId = process.env.ADMIN_DOCUMENT;
    if (!documentId) throw new Error("ADMIN_DOCUMENT no está configurado en backend/.env");

    await prisma.user.create({
      data: {
        email,
        fullName: process.env.ADMIN_NAME ?? "Administrador SIGRAD",
        documentId,
        passwordHash,
        role: "ADMIN",
        active: true,
        mustChangePassword: true,
      },
    });
  }

  console.log(`Cuenta administradora: ${email}`);
  console.log(`Contraseña temporal: ${password}`);
  console.log("La cuenta solicitará cambiar esta contraseña al iniciar sesión.");
};

resetAdminPassword()
  .catch((error: unknown) => {
    console.error("No se pudo restablecer la contraseña del administrador.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());