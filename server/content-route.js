import { Router } from "express";
import Content from "./content.js";
import { resolveTenant } from "./tenant.js";
import { requirePermission } from "./auth.js";

const router = Router();
router.use(resolveTenant);
router.get("/", requirePermission("page:view"), async (req, res, next) => {
  try {
    const type = String(req.query.type || "page"),
      filter = { websiteId: req.websiteId, type };
    if (req.query.search)
      filter.$or = ["title", "excerpt", "content"].map((key) => ({
        [key]: new RegExp(
          String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i",
        ),
      }));
    const data = await Content.find(filter)
      .sort({ updatedAt: -1 })
      .limit(250)
      .lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.post("/", requirePermission("page:create"), async (req, res, next) => {
  try {
    const status = req.body.status || "draft",
      seo = {
        ...req.body.seo,
        index: status === "published" && req.body.seo?.index !== false,
      };
    const data = await Content.create({
      ...req.body,
      websiteId: req.websiteId,
      seo,
    });
    res.status(201).json({ success: true, message: "Record created", data });
  } catch (e) {
    next(e);
  }
});
router.put("/:id", requirePermission("page:edit"), async (req, res, next) => {
  try {
    const status = req.body.status || "draft",
      update = {
        ...req.body,
        websiteId: req.websiteId,
        seo: {
          ...req.body.seo,
          index: status === "published" && req.body.seo?.index !== false,
        },
      };
    const data = await Content.findOneAndUpdate(
      { _id: req.params.id, websiteId: req.websiteId },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    res.json({ success: true, message: "Record updated", data });
  } catch (e) {
    next(e);
  }
});
router.delete(
  "/:id",
  requirePermission("page:edit"),
  async (req, res, next) => {
    try {
      const data = await Content.findOneAndDelete({
        _id: req.params.id,
        websiteId: req.websiteId,
      });
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Record not found" });
      res.json({ success: true, message: "Record deleted" });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
