import { Router } from "express";
import Website from "./website.js";
import { canAccessWebsite, requirePermission } from "./auth.js";
const router = Router();
router.get("/", requirePermission("website:view"), async (req, res, next) => {
  try {
    const filter =
      req.user.role === "super_admin"
        ? {}
        : { _id: { $in: req.user.websiteIds } };
    res.json({
      success: true,
      data: await Website.find(filter).sort({ createdAt: -1 }).lean(),
    });
  } catch (e) {
    next(e);
  }
});
router.post(
  "/",
  requirePermission("website:create"),
  async (req, res, next) => {
    try {
      res
        .status(201)
        .json({
          success: true,
          message: "Website created",
          data: await Website.create(req.body),
        });
    } catch (e) {
      next(e);
    }
  },
);
router.put(
  "/:id",
  requirePermission("website:edit"),
  async (req, res, next) => {
    try {
      if (!canAccessWebsite(req.user, req.params.id))
        return res
          .status(403)
          .json({ success: false, message: "Website access denied" });
      const data = await Website.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true },
      );
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Website not found" });
      res.json({ success: true, message: "Website updated", data });
    } catch (e) {
      next(e);
    }
  },
);
router.delete(
  "/:id",
  requirePermission("website:delete"),
  async (req, res, next) => {
    try {
      if (req.user.role !== "super_admin")
        return res
          .status(403)
          .json({
            success: false,
            message: "Only Super Admin can delete websites",
          });
      const data = await Website.findByIdAndUpdate(
        req.params.id,
        { status: "inactive" },
        { new: true },
      );
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Website not found" });
      res.json({ success: true, message: "Website deactivated", data });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
