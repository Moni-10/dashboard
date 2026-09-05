import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Product from "./product.js";
import Website from "./website.js";
import User from "./user.js";
import Content from "./content.js";
import websitesRoute from "./websites-route.js";
import categoriesRoute from "./categories-route.js";
import contentRoute from "./content-route.js";
import usersRoute from "./users-route.js";
import authRoute, { ensureInitialAdmin } from "./auth-route.js";
import {
  authenticate,
  loadUser,
  requirePermission,
  canAccessWebsite,
} from "./auth.js";
import { resolveTenant } from "./tenant.js";
dotenv.config();
const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",").filter(Boolean) || [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://mohindramachine.tech",
      "https://www.mohindramachine.tech",
      "https://frontend-pro.rajdhaniengineeringworks.in",
      "https://rajdhaniengineeringworks.in",
      "https://www.rajdhaniengineeringworks.in",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "25mb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/health", (_, res) =>
  res.json({
    success: true,
    message: "API healthy",
    data: { service: "Mohindra multi-website CMS" },
  }),
);
app.get("/api/weather", async (req, res) => {
  const latitude = Number(req.query.latitude) || 28.6139;
  const longitude = Number(req.query.longitude) || 77.209;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`http://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const payload = await response.json();
    if (!payload.current) throw new Error("Current weather missing");
    res.json({ success: true, data: payload.current });
  } catch (error) {
    res.status(503).json({ success: false, message: "Live weather service is temporarily unavailable" });
  }
});
app.use("/api/auth", authRoute);
app.use("/api/websites", authenticate, loadUser(User), websitesRoute);
app.use("/api/categories", authenticate, loadUser(User), categoriesRoute);
app.use("/api/content", authenticate, loadUser(User), contentRoute);
app.use("/api/users", authenticate, loadUser(User), usersRoute);
app.get("/api/public/products", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || "")
      .split(":")[0]
      .toLowerCase();
    const website = await Website.findOne({ domain, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found" });
    const data = await Product.find({
      websiteId: website._id,
      status: "published",
    })
      .select(
        "name slug shortDescription featuredImage hero categoryId subCategoryId productGroup featured specifications priceLabel updatedAt",
      )
      .sort({ sortOrder: 1, updatedAt: -1 })
      .lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
app.get("/api/public/categories", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || "")
      .split(":")[0]
      .toLowerCase();
    const website = await Website.findOne({ domain, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found" });
    const Category = (await import("./category.js")).default;
    const data = await Category.find({
      websiteId: website._id,
      status: "published",
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
app.get("/api/public/content", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || "")
        .split(":")[0]
        .toLowerCase(),
      type = String(req.query.type || "page");
    if (!["page", "blog"].includes(type))
      return res
        .status(422)
        .json({ success: false, message: "Invalid content type" });
    const website = await Website.findOne({ domain, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found" });
    const data = await Content.find({
      websiteId: website._id,
      type,
      status: "published",
    })
      .select(
        "title slug excerpt content featured publishAt file seo updatedAt",
      )
      .sort({ featured: -1, publishAt: -1, updatedAt: -1 })
      .lean();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
app.get("/api/public/content/:type/:slug", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || "")
        .split(":")[0]
        .toLowerCase(),
      type = String(req.params.type);
    if (!["page", "blog"].includes(type))
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    const website = await Website.findOne({ domain, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found" });
    const data = await Content.findOne({
      websiteId: website._id,
      type,
      slug: req.params.slug.toLowerCase(),
      status: "published",
    }).lean();
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
app.get("/api/public/products/:slug", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || "")
      .split(":")[0]
      .toLowerCase();
    const website = await Website.findOne({ domain, status: "active" });
    if (!website)
      return res
        .status(404)
        .json({ success: false, message: "Website not found" });
    const data = await Product.findOne({
      websiteId: website._id,
      slug: req.params.slug.toLowerCase(),
      status: "published",
    }).lean();
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
app.get(
  "/api/products",
  authenticate,
  loadUser(User),
  requirePermission("product:view"),
  resolveTenant,
  async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1),
        limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)),
        filter = {
          websiteId: req.websiteId,
          ...(req.query.status ? { status: req.query.status } : {}),
        };
      if (req.query.search)
        filter.$text = { $search: String(req.query.search) };
      const [data, total] = await Promise.all([
        Product.find(filter)
          .sort({ sortOrder: 1, updatedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Product.countDocuments(filter),
      ]);
      res.json({
        success: true,
        data,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/products",
  authenticate,
  loadUser(User),
  requirePermission("product:create"),
  resolveTenant,
  async (req, res, next) => {
    try {
      const requestedSlug = String(req.body.slug || req.body.name || "product")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "product";
      let uniqueSlug = requestedSlug;
      let suffix = 2;
      while (await Product.exists({ websiteId: req.websiteId, slug: uniqueSlug })) {
        uniqueSlug = `${requestedSlug}-${suffix++}`;
      }
      const data = await Product.create({
        ...req.body,
        slug: uniqueSlug,
        websiteId: req.websiteId,
      });
      res.status(201).json({ success: true, message: "Product created", data });
    } catch (e) {
      next(e);
    }
  },
);
app.put(
  "/api/products/:id",
  authenticate,
  loadUser(User),
  requirePermission("product:edit"),
  resolveTenant,
  async (req, res, next) => {
    try {
      const data = await Product.findOneAndUpdate(
        { _id: req.params.id, websiteId: req.websiteId },
        { $set: { ...req.body, websiteId: req.websiteId } },
        { new: true, runValidators: true },
      );
      if (!data)
        return res
          .status(404)
          .json({
            success: false,
            message: "Product not found for selected website",
          });
      res.json({ success: true, message: "Product updated", data });
    } catch (e) {
      next(e);
    }
  },
);
app.delete(
  "/api/products/:id",
  authenticate,
  loadUser(User),
  requirePermission("product:delete"),
  resolveTenant,
  async (req, res, next) => {
    try {
      const filter = { _id: req.params.id, websiteId: req.websiteId };
      if (req.query.permanent === "true") {
        const data = await Product.findOneAndDelete(filter);
        if (!data)
          return res
            .status(404)
            .json({
              success: false,
              message: "Product not found for selected website",
            });
        return res.json({
          success: true,
          message: "Product permanently deleted",
          data,
        });
      }
      const data = await Product.findOneAndUpdate(
        filter,
        { status: "archived" },
        { new: true },
      );
      if (!data)
        return res
          .status(404)
          .json({
            success: false,
            message: "Product not found for selected website",
          });
      res.json({ success: true, message: "Product archived", data });
    } catch (e) {
      next(e);
    }
  },
);
app.post(
  "/api/products/:id/duplicate",
  authenticate,
  loadUser(User),
  requirePermission("product:create"),
  async (req, res, next) => {
    try {
      const targetWebsiteId = req.body.targetWebsiteId;
      if (
        !mongoose.isValidObjectId(targetWebsiteId) ||
        !canAccessWebsite(req.user, targetWebsiteId)
      )
        return res
          .status(403)
          .json({ success: false, message: "Target website access denied" });
      const source = await Product.findById(req.params.id).lean();
      if (!source || !canAccessWebsite(req.user, source.websiteId))
        return res
          .status(404)
          .json({ success: false, message: "Source product not found" });
      delete source._id;
      delete source.createdAt;
      delete source.updatedAt;
      const baseSlug = String(req.body.slug || source.slug) + "-copy";
      let slug = baseSlug,
        n = 2;
      while (await Product.exists({ websiteId: targetWebsiteId, slug }))
        slug = `${baseSlug}-${n++}`;
      const data = await Product.create({
        ...source,
        websiteId: targetWebsiteId,
        slug,
        name: req.body.name || `${source.name} (Copy)`,
        status: "draft",
        seo: { ...source.seo, index: false, canonical: "" },
      });
      res
        .status(201)
        .json({ success: true, message: "Product duplicated as draft", data });
    } catch (e) {
      next(e);
    }
  },
);
app.get("/api/public/sitemap.xml", async (req, res, next) => {
  try {
    const domain = String(req.query.domain || req.hostname || "")
      .split(":")[0]
      .toLowerCase();
    const website = await Website.findOne({ domain, status: "active" }).lean();
    if (!website)
      return res.status(404).type("text/plain").send("Website not found");
    const [products, content] = await Promise.all([
      Product.find({
        websiteId: website._id,
        status: "published",
        "seo.index": { $ne: false },
      })
        .select("name slug updatedAt")
        .lean(),
      Content.find({
        websiteId: website._id,
        type: { $in: ["page", "feature", "blog"] },
        status: "published",
        "seo.index": { $ne: false },
      })
        .select("type slug updatedAt")
        .lean(),
    ]);
    const esc = (v) =>
      String(v).replace(
        /[<>&'\"]/g,
        (c) =>
          ({
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            "'": "&apos;",
            '"': "&quot;",
          })[c],
      );
    const entries = [
      ...products.map((p) => ({
        path: `${String(p.name || p.slug || "Product").trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join("") || "Product"}.php`,
        updatedAt: p.updatedAt,
      })),
      ...content.map((p) => ({
        path: `${p.type === "blog" ? "blog" : "pages"}/${p.slug}`,
        updatedAt: p.updatedAt,
      })),
    ];
    const urls = entries
      .map(
        (p) =>
          `<url><loc>${esc(`https://${website.domain}/${p.path}`)}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`,
      )
      .join("");
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(`https://${website.domain}/`)}</loc></url>${urls}</urlset>`,
      );
  } catch (e) {
    next(e);
  }
});
app.get("/api/public/robots.txt", async (req, res) => {
  const domain = String(req.query.domain || req.hostname || "")
    .split(":")[0]
    .toLowerCase();
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://${domain}/api/public/sitemap.xml?domain=${encodeURIComponent(domain)}\n`,
    );
});
app.use((e, req, res, next) =>
  res
    .status(e.code === 11000 ? 409 : e.name === "ValidationError" ? 422 : 500)
    .json({
      success: false,
      message:
        process.env.NODE_ENV === "production" ? "Request failed" : e.message,
    }),
);
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mmw-admin")
  .then(async () => {
    await ensureInitialAdmin();
    app.listen(process.env.PORT || 5000);
  });
