import mongoose from "mongoose";
const pair = new mongoose.Schema(
  { name: String, value: String },
  { _id: false },
);
const faq = new mongoose.Schema(
  { question: String, answer: String },
  { _id: false },
);
const media = new mongoose.Schema(
  { url: String, alt: String, title: String },
  { _id: false },
);
const contentSection = new mongoose.Schema(
  { heading: String, description: String, image: media },
  { _id: false },
);
const showcaseCard = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    type: { type: String, enum: ["image", "video"], default: "image" },
    image: media,
    youtubeUrl: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, index: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, index: true },
    productGroup: String,
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    shortDescription: String,
    description: String,
    priceLabel: String,
    hero: { heading: String, subheading: String, image: media },
    featuredImage: media,
    gallery: [media],
    showcaseCards: [showcaseCard],
    videoSection: {
      heading: String,
      youtubeUrl: String,
      youtubeUrls: [String],
      thumbnail: media,
    },
    brochure: { url: String, title: String },
    contentSections: [contentSection],
    whyChoose: [pair],
    features: [String],
    applications: [String],
    specifications: [pair],
    faqs: [faq],
    faqSection: { image: media },
    seo: {
      focusKeyword: String,
      title: String,
      description: String,
      keywords: [String],
      canonical: String,
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
      ogTitle: String,
      ogDescription: String,
      ogImage: media,
      schemaType: { type: String, default: "Product" },
      brand: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.index({ websiteId: 1, slug: 1 }, { unique: true });
schema.index({ websiteId: 1, status: 1, sortOrder: 1, createdAt: -1 });
schema.index({ name: "text", shortDescription: "text", slug: "text" });
export default mongoose.model("Product", schema);
