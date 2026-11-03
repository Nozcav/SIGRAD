import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody, validateParams } from "../../middleware/validate";
import { changeRole, changeStatus, create, list, resetPassword } from "./admin.controller";
import {
  createUserSchema,
  updateRoleSchema,
  updateStatusSchema,
  userIdParamsSchema,
} from "./admin.schemas";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/users", list);
router.post("/users", validateBody(createUserSchema), create);
router.patch("/users/:id/role", validateBody(updateRoleSchema), changeRole);
router.patch("/users/:id/status", validateBody(updateStatusSchema), changeStatus);
router.post("/users/:id/reset-password", validateParams(userIdParamsSchema), resetPassword);

export default router;
