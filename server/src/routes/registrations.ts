import { Router } from "express";
import { addRegistration, getRegistrations } from "../controllers/registrationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// ✅ Student submits registration
router.post("/", protect, addRegistration);

// ✅ Faculty gets all registrations (optional: protect faculty only)
router.get("/", protect, getRegistrations);

export default router;
