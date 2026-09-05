import jwt from "jsonwebtoken";
const roles = {
  super_admin: ["*"],
  admin: [
    "website:view",
    "website:edit",
    "product:*",
    "category:*",
    "page:*",
    "blog:*",
    "inquiry:*",
    "media:*",
    "seo:*",
  ],
  editor: [
    "website:view",
    "product:view",
    "product:create",
    "product:edit",
    "category:view",
    "category:create",
    "category:edit",
    "page:*",
    "blog:*",
    "inquiry:view",
    "inquiry:edit",
    "media:*",
    "seo:*",
  ],
};
const secret = () =>
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "development-only-change-me");
export function signToken(user) {
  if (!secret()) throw new Error("JWT_SECRET is required");
  return jwt.sign({ sub: String(user._id), role: user.role }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    issuer: "mmw-cms",
  });
}
export function authenticate(req, res, next) {
  try {
    const value = req.get("authorization") || "";
    if (!value.startsWith("Bearer "))
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    req.auth = jwt.verify(value.slice(7), secret(), { issuer: "mmw-cms" });
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
}
export const loadUser = (User) => async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.auth.sub, status: "active" });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User account is unavailable" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
const allows = (grants, permission) =>
  grants.includes("*") ||
  grants.includes(permission) ||
  grants.includes(permission.split(":")[0] + ":*");
export function requirePermission(permission) {
  return (req, res, next) => {
    const grants = [
      ...(roles[req.user.role] || []),
      ...(req.user.permissions || []),
    ];
    if (!allows(grants, permission))
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    next();
  };
}
export function canAccessWebsite(user, websiteId) {
  return (
    user.role === "super_admin" ||
    (user.websiteIds || []).some((id) => String(id) === String(websiteId))
  );
}
