import mongoose from "mongoose";
import Website from "./website.js";
import { canAccessWebsite } from "./auth.js";
export async function resolveTenant(req, res, next) {
  try {
    const headerId = req.get("x-website-id");
    const hostname = (req.get("x-forwarded-host") || req.hostname || "")
      .split(":")[0]
      .toLowerCase();
    let website = null;
    if (headerId && mongoose.isValidObjectId(headerId))
      website = await Website.findOne({ _id: headerId, status: "active" });
    if (!website && hostname)
      website = await Website.findOne({ domain: hostname, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found for this domain" });
    if (req.user && !canAccessWebsite(req.user, website._id))
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not assigned to this website",
        });
    req.website = website;
    req.websiteId = website._id;
    next();
  } catch (error) {
    next(error);
  }
}
