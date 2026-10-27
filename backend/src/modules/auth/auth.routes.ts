import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requirePasswordChanged } from "../../middleware/requirePasswordChanged";
import { validateBody } from "../../middleware/validate";
import { changePassword, login, logout, me, updateProfile } from "./auth.controller";
import { changePasswordSchema, loginSchema, updateProfileSchema } from "./auth.schemas";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch(
  "/profile",
  requireAuth,
  requirePasswordChanged,
  validateBody(updateProfileSchema),
  updateProfile
);
router.put(
  "/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  changePassword
);

export default router;
