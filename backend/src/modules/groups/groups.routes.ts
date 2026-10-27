import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { create, list, remove, saveGrades, saveRubric, update } from "./groups.controller";
import { createGroupSchema, saveAssessmentSchema, saveGradesSchema, updateGroupSchema } from "./groups.schemas";

const router = Router();
router.use(requireAuth, requireRole(["TEACHER"]));
router.get("/forms/:formId", list);
router.post("/forms/:formId", validateBody(createGroupSchema), create);
router.put("/:groupId/assessment", validateBody(saveAssessmentSchema), saveRubric);
router.put("/:groupId/grades", validateBody(saveGradesSchema), saveGrades);
router.patch("/:groupId", validateBody(updateGroupSchema), update);
router.delete("/:groupId", remove);

export default router;