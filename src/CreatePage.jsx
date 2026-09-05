import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  Globe2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { catalogGroups } from "./catalogData.js";
export default function CreatePage({ onBack, onSaved, notify }) {
  const [data, setData] = useState({
      kind: sessionStorage.getItem("mmw-create-kind") || "category",
      name: "",
      slug: "",
      parent: "",
      eyebrow: "OUR MACHINES",
      description: "",
      image: "/catalog-hero.png",
      breadcrumbTitle: "",
      seoTitle: "",
      metaDescription: "",
      canonical: "",
      indexing: "index",
      enquiryLabel: "Enquiry",
      enquiryEmail: "info@mohindramechanical.com",
    }),
    set = (k, v) => setData({ ...data, [k]: v });
  function image(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set("image", String(r.result));
    r.readAsDataURL(f);
  }
  function save() {
    if (!data.name.trim())
      return notify?.(
        "Page name required",
        "Enter a page heading before saving.",
      );
    const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      item = {
        ...data,
        slug,
        key: `custom:${data.kind}:${slug}`,
        type:
          data.kind === "category"
            ? "Category page"
            : data.kind === "product"
              ? "Product detail page"
              : "Custom website page",
      };
    let pages = [];
    try {
      pages = JSON.parse(localStorage.getItem("mmw-custom-pages") || "[]");
    } catch {}
    pages = [item, ...pages.filter((x) => x.key !== item.key)];
    localStorage.setItem("mmw-custom-pages", JSON.stringify(pages));
    const edits = JSON.parse(localStorage.getItem("mmw-catalog-edits") || "{}");
    edits[item.key] = { heading: item.name, ...item };
    localStorage.setItem("mmw-catalog-edits", JSON.stringify(edits));
    notify?.("Page created", `${item.name} added to page management.`);
    onSaved?.();
  }
  return (
    <div className="create-page-screen animate-in">
      <div className="form-page-head">
        <div>
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft /> Page Management
          </button>
          <h1>Create new page</h1>
          <p>Create a category, product-detail or custom website page.</p>
        </div>
        <button className="btn primary" onClick={save}>
          <Save /> Create page
        </button>
      </div>
      <div className="create-page-layout">
        <main>
          <section className="form-card">
            <div className="form-card-title">
              <Plus />
              <div>
                <h3>Page structure</h3>
                <p>Choose where this page will appear</p>
              </div>
            </div>
            <div className="form-grid two">
              <label className="form-field">
                <span>Page type *</span>
                <select
                  value={data.kind}
                  onChange={(e) => set("kind", e.target.value)}
                >
                  <option value="category">Main category page</option>
                  <option value="product">Sub-product detail page</option>
                  <option value="custom">Other website page</option>
                </select>
              </label>
              {data.kind === "product" && (
                <label className="form-field">
                  <span>Parent category *</span>
                  <select
                    value={data.parent}
                    onChange={(e) => set("parent", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {catalogGroups.map((g) => (
                      <option key={g.title}>{g.title}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="form-field">
                <span>Page heading *</span>
                <input
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="New machine or page name"
                />
              </label>
              <label className="form-field">
                <span>URL slug</span>
                <input
                  value={data.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-generated-from-name"
                />
              </label>
              <label className="form-field">
                <span>Breadcrumb name</span>
                <input
                  value={data.breadcrumbTitle}
                  onChange={(e) => set("breadcrumbTitle", e.target.value)}
                  placeholder="Short navigation title"
                />
              </label>
              <label className="form-field">
                <span>Small heading</span>
                <input
                  value={data.eyebrow}
                  onChange={(e) => set("eyebrow", e.target.value)}
                />
              </label>
            </div>
            <label className="form-field">
              <span>Page content / description</span>
              <textarea
                rows="6"
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Write page content..."
              />
            </label>
            <label className="builder-upload create-upload">
              <Upload />
              <b>Upload page banner/image</b>
              <small>JPG, PNG or WebP</small>
              <input type="file" accept="image/*" onChange={image} />
            </label>
          </section>
          <section className="form-card">
            <div className="form-card-title">
              <Search />
              <div>
                <h3>SEO & indexing</h3>
                <p>Configure search appearance before publishing</p>
              </div>
            </div>
            <label className="form-field">
              <span>SEO title</span>
              <input
                value={data.seoTitle}
                maxLength="60"
                onChange={(e) => set("seoTitle", e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Meta description</span>
              <textarea
                rows="4"
                value={data.metaDescription}
                maxLength="160"
                onChange={(e) => set("metaDescription", e.target.value)}
              />
            </label>
            <div className="form-grid two">
              <label className="form-field">
                <span>Canonical URL</span>
                <input
                  value={data.canonical}
                  onChange={(e) => set("canonical", e.target.value)}
                />
              </label>
              <label className="form-field">
                <span>Indexing</span>
                <select
                  value={data.indexing}
                  onChange={(e) => set("indexing", e.target.value)}
                >
                  <option value="index">Index</option>
                  <option value="noindex">NoIndex</option>
                </select>
              </label>
            </div>
          </section>
        </main>
        <aside>
          <section className="form-card sticky-card">
            <div className="form-card-title">
              <Globe2 />
              <div>
                <h3>Publishing</h3>
                <p>Selected website</p>
              </div>
            </div>
            <p className="create-site">
              <b>Mohindra Mechanical Works</b>
              <span>Current active website</span>
            </p>
            <label className="form-field">
              <span>Enquiry button</span>
              <input
                value={data.enquiryLabel}
                onChange={(e) => set("enquiryLabel", e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Enquiry email</span>
              <input
                value={data.enquiryEmail}
                onChange={(e) => set("enquiryEmail", e.target.value)}
              />
            </label>
            <div className="publish-note">
              <CheckCircle2 />
              Page will be available in Page Management after saving.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
