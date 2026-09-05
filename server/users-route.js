import { Router } from "express";
import User from "./user.js";
import { requirePermission } from "./auth.js";
const router = Router();
router.get("/", requirePermission("user:view"), async (_req, res, next) => {
  try {
    res.json({
      success: true,
      data: await User.find()
        .select(
          "name email role websiteIds permissions status lastLoginAt createdAt",
        )
        .sort({ createdAt: -1 })
        .lean(),
    });
  } catch (e) {
    next(e);
  }
});
router.post("/", requirePermission("user:create"), async (req, res, next) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 12)
      return res
        .status(422)
        .json({
          success: false,
          message: "Password must be at least 12 characters",
        });
    const data = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash: await User.hashPassword(password),
      role: req.body.role,
      websiteIds: req.body.websiteIds || [],
      permissions: req.body.permissions || [],
      status: req.body.status || "active",
    });
    res
      .status(201)
      .json({
        success: true,
        message: "User created",
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        },
      });
  } catch (e) {
    next(e);
  }
});
router.put("/:id", requirePermission("user:edit"), async (req, res, next) => {
  try {
    const update = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      websiteIds: req.body.websiteIds || [],
      permissions: req.body.permissions || [],
      status: req.body.status,
    };
    if (req.body.password) {
      if (String(req.body.password).length < 12)
        return res
          .status(422)
          .json({
            success: false,
            message: "Password must be at least 12 characters",
          });
      update.passwordHash = await User.hashPassword(req.body.password);
    }
    const data = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    ).select("name email role websiteIds status");
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated", data });
  } catch (e) {
    next(e);
  }
});
export default router;
