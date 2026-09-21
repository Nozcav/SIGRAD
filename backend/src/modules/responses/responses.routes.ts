import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { create as createComment } from "../comments/comments.controller";
import { createCommentSchema } from "../comments/comments.schemas";
import { changeStatus, detail, myResponses, submit } from "./responses.controller";
import { submitResponseSchema, updateResponseStatusSchema } from "./responses.schemas";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole(["STUDENT"]), validateBody(submitResponseSchema), submit);
router.get("/my-responses", requireRole(["STUDENT"]), myResponses);
router.get("/:id", detail);

router.post(
  "/:responseId/comments",
  requireRole(["TEACHER"]),
  validateBody(createCommentSchema),
  createComment
);
router.patch(
  "/:responseId/status",
  requireRole(["TEACHER"]),
  validateBody(updateResponseStatusSchema),
  changeStatus
);

export default router;
