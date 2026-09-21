import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { responsesForForm } from "../responses/responses.controller";
import {
  changeStatus,
  create,
  getByCode,
  getById,
  list,
  remove,
  update,
} from "./forms.controller";
import { createFormSchema, updateFormSchema, updateStatusSchema } from "./forms.schemas";

const router = Router();

// Acceso de estudiantes por codigo (RF-09) - registrado antes del middleware de rol docente
router.get("/code/:code", requireAuth, requireRole(["STUDENT"]), getByCode);

// A partir de aqui, todas las rutas son exclusivas del docente propietario
router.use(requireAuth, requireRole(["TEACHER"]));

router.post("/", validateBody(createFormSchema), create);
router.get("/", list);
router.get("/:id", getById);
router.patch("/:id", validateBody(updateFormSchema), update);
router.delete("/:id", remove);
router.patch("/:id/status", validateBody(updateStatusSchema), changeStatus);
router.get("/:formId/responses", responsesForForm);

export default router;
