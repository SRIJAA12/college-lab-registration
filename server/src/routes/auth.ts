import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { protect } from "../middleware/authMiddleware"; // ✅ use middleware for protected routes

const router = Router();
router.get("/me", protect, async (req: any, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
});

// ✅ Register new user
router.post("/register", registerUser);

// ✅ Login user
router.post("/login", loginUser);

// ✅ Get current user profile (protected)
router.get("/me", protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
