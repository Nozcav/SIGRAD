import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requirePasswordChanged } from "../../middleware/requirePasswordChanged";
import { list, markAsRead } from "./notifications.controller";

const router = Router();

router.use(requireAuth, requirePasswordChanged);

router.get("/", list);
router.patch("/:id/read", markAsRead);

export default router;
