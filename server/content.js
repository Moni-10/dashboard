import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Website",
    },
    type: {
      type: String,
      required: true,
      enum: ["page", "feature", "blog", "inquiry", "media"],
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    excerpt: String,
    content: String,
    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "scheduled",
        "new",
        "read",
        "contacted",
        "converted",
        "closed",
        "active",
      ],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    publishAt: Date,
    file: { name: String, url: String, mimeType: String, size: Number },
    contact: {
      name: String,
      email: String,
      phone: String,
      company: String,
      product: String,
      message: String,
    },
    sections: [{ heading: String, body: String, image: String, order: Number }],
    seo: {
      focusKeyword: String,
      title: String,
      description: String,
      canonical: String,
      index: { type: Boolean, default: false },
      follow: { type: Boolean, default: true },
      keywords: [String],
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
      schemaType: { type: String, default: "CollectionPage" },
    },
  },
  { timestamps: true },
);
schema.index(
  { websiteId: 1, type: 1, slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } },
);
export default mongoose.model("Content", schema);
