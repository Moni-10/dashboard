import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Website",
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
      ref: "Category",
    },
    description: { type: String, default: "" },
    group: { type: String, default: "" },
    image: { url: String, alt: String, title: String },
    icon: { url: String, alt: String, title: String },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.index({ websiteId: 1, slug: 1 }, { unique: true });
export default mongoose.model("Category", schema);
