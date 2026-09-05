import { Router } from "express";
import rateLimit from "express-rate-limit";
import User from "./user.js";
import { authenticate, loadUser, signToken } from "./auth.js";
const router = Router(),
  loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many login attempts. Try again later.",
    },
  });
router.post("/login", loginLimit, async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase(),
      password = String(req.body.password || "");
    if (!email || password.length < 8)
      return res
        .status(422)
        .json({
          success: false,
          message: "Valid email and password are required",
        });
    const user = await User.findOne({ email, status: "active" }).select(
      "+passwordHash",
    );
    if (!user || !(await user.verifyPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    user.lastLoginAt = new Date();
    await user.save();
    res.json({
      success: true,
      data: {
        token: signToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          websiteIds: user.websiteIds,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});
router.get("/me", authenticate, loadUser(User), (req, res) =>
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      websiteIds: req.user.websiteIds,
      permissions: req.user.permissions,
    },
  }),
);
export async function ensureInitialAdmin() {
  if (await User.exists({})) return;
  const email = process.env.ADMIN_EMAIL,
    password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) return;
  await User.create({
    name: process.env.ADMIN_NAME || "Super Admin",
    email,
    passwordHash: await User.hashPassword(password),
    role: "super_admin",
  });
}
export default router;
