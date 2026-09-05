import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    subdomain: { type: String, lowercase: true, index: true },
    slug: { type: String, required: true, unique: true },
    logo: String,
    favicon: String,
    phone: String,
    email: String,
    address: String,
    socialLinks: { type: Map, of: String },
    headerSettings: mongoose.Schema.Types.Mixed,
    footerSettings: mongoose.Schema.Types.Mixed,
    themeSettings: mongoose.Schema.Types.Mixed,
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);
export default mongoose.model("Website", schema);
