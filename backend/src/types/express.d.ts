import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        email: string;
        documentId: string;
        role: Role;
        active: boolean;
        mustChangePassword: boolean;
      };
    }
  }
}

export {};
