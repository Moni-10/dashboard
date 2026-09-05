import { Router } from "express";
import Category from "./category.js";
import { resolveTenant } from "./tenant.js";
import { requirePermission } from "./auth.js";

const router = Router();
router.use(resolveTenant);
router.get("/", requirePermission("category:view"), async (req, res, next) => {
  try {
    const data = await Category.find({ websiteId: req.websiteId }).sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ success: true, data });
  } catch (error) { next(error); }
});
router.post("/", requirePermission("category:create"), async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const parentId = req.body.parentId || null;
    const duplicate = await Category.findOne({
      websiteId: req.websiteId,
      parentId,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) return res.status(409).json({ success: false, message: "This category already exists under the selected parent" });
    if (parentId) {
      const parent = await Category.findOne({ _id: parentId, websiteId: req.websiteId, parentId: null });
      if (!parent) return res.status(422).json({ success: false, message: "Select a valid main category" });
    }
    const data = await Category.create({ ...req.body, name, parentId, websiteId: req.websiteId });
    res.status(201).json({ success: true, message: "Category created", data });
  } catch (error) { next(error); }
});
router.put("/:id", requirePermission("category:edit"), async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const parentId = req.body.parentId || null;
    if (String(parentId || "") === String(req.params.id)) return res.status(422).json({ success: false, message: "A category cannot be its own parent" });
    const duplicate = await Category.findOne({
      _id: { $ne: req.params.id },
      websiteId: req.websiteId,
      parentId,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (duplicate) return res.status(409).json({ success: false, message: "This category already exists under the selected parent" });
    if (parentId) {
      const parent = await Category.findOne({ _id: parentId, websiteId: req.websiteId, parentId: null });
      if (!parent) return res.status(422).json({ success: false, message: "Select a valid main category" });
    }
    const data = await Category.findOneAndUpdate(
      { _id: req.params.id, websiteId: req.websiteId },
      { $set: { ...req.body, name, parentId, websiteId: req.websiteId } },
      { new: true, runValidators: true },
    );
    if (!data) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category updated", data });
  } catch (error) { next(error); }
});
router.delete("/:id", requirePermission("category:delete"), async (req, res, next) => {
  try {
    const child = await Category.exists({ websiteId: req.websiteId, parentId: req.params.id });
    if (child) return res.status(409).json({ success: false, message: "Delete sub categories first" });
    const data = await Category.findOneAndDelete({ _id: req.params.id, websiteId: req.websiteId });
    if (!data) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) { next(error); }
});
export default router;
