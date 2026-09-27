import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { changeRole, changeStatus, create, list } from "./admin.controller";
import { createUserSchema, updateRoleSchema, updateStatusSchema } from "./admin.schemas";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/users", list);
router.post("/users", validateBody(createUserSchema), create);
router.patch("/users/:id/role", validateBody(updateRoleSchema), changeRole);
router.patch("/users/:id/status", validateBody(updateStatusSchema), changeStatus);

export default router;
