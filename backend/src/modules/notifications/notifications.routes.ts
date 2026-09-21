import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { list, markAsRead } from "./notifications.controller";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.patch("/:id/read", markAsRead);

export default router;
