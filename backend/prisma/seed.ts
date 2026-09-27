import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const documentId = process.env.ADMIN_DOCUMENT;
  const fullName = process.env.ADMIN_NAME ?? "Administrador SIGRAD";

  if (!email || !password || !documentId) {
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_DOCUMENT son requeridos en el .env para ejecutar el seed"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase();

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { role: "ADMIN", active: true },
    create: {
      fullName,
      email: normalizedEmail,
      documentId,
      passwordHash,
      role: "ADMIN",
      mustChangePassword: true,
    },
  });

  console.log(`Usuario administrador listo: ${normalizedEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
