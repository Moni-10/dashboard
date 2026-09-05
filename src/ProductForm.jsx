import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import { Editor } from "@tinymce/tinymce-react";
import tinymce from "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/help";
import "tinymce/plugins/image";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import "tinymce/skins/ui/oxide/skin.min.css";
import {
  ArrowLeft,
  Save,
  Eye,
  ImagePlus,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Heading2,
  AlignLeft,
  Settings2,
  Video,
  FileText,
  FolderTree,
  Boxes,
  Search,
  Check,
  Share2,
  Play,
  MonitorPlay,
  Factory,
} from "lucide-react";

const Field = ({ label, children, hint }) => (
  <label className="form-field">
    <span>
      {label}
      {label === "Product name" && <em>*</em>}
    </span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);
const MACHINE_CATEGORIES = [
  "Rotogravure Printing Machine",
  "MLS Rotogravure Printing Machine",
  "Shafted Rotogravure Printing Machine",
  "Shafted MLS Rotogravure Printing Machine",
  "Shaftless Rotogravure Printing Machine",
  "MLS Shaftless Rotogravure Printing Machine",
  "Pharmaceutical Foil Rotogravure Printing Machine",
];

function ProductCards({ cards, setCards }) {
  const addCard = () =>
    setCards([
      ...cards,
      {
        title: "",
        type: "image",
        image: "",
        imageAlt: "",
        imageTitle: "",
      },
    ]);
  const update = (i, key, value) =>
    setCards(cards.map((c, n) => (n === i ? { ...c, [key]: value } : c)));
  const imageFile = (i, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(i, "image", String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <section className="form-card" id="manufactured-products">
      <div className="form-card-title">
        <MonitorPlay />
        <div>
          <h3>Products Manufactured by This Machine</h3>
          <p>
            Upload an image and title for each manufactured product.
          </p>
        </div>
        <button type="button" className="section-add" onClick={addCard}>
          <Plus /> Add image
        </button>
      </div>
      <div className="web-card-builder">
        {cards.map((card, i) => {
          const preview = typeof card.image === "string" ? card.image : card.image?.url;
          return (
            <div className="web-card-edit" key={i}>
              <div className="web-card-preview">
                <div
                  className="card-media-preview"
                  style={
                    preview
                      ? {
                          backgroundImage: `url(${preview})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  {!preview && <ImagePlus />}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => imageFile(i, e.target.files?.[0])}
                  />
                </div>
                <strong>{card.title || "Product title"}</strong>
              </div>
              <div className="web-card-fields">
                <Field label="Title">
                  <input
                    value={card.title}
                    onChange={(e) => update(i, "title", e.target.value)}
                    placeholder="Printed Food Packaging Films"
                  />
                </Field>
                <button
                  type="button"
                  className="remove-card"
                  onClick={() => setCards(cards.filter((_, n) => n !== i))}
                >
                  <Trash2 /> Remove card
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ProductForm({
  onBack,
  onNotify = () => {},
  onPublished = () => {},
  website,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerImageAlt, setBannerImageAlt] = useState("");
  const [bannerImageTitle, setBannerImageTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [featuredImageTitle, setFeaturedImageTitle] = useState("");
  const [gallery, setGallery] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [secondVideoUrl, setSecondVideoUrl] = useState("");
  const [thirdVideoUrl, setThirdVideoUrl] = useState("");
  const [videoHeading, setVideoHeading] = useState("Machine demonstration");
  const [videoDescription, setVideoDescription] = useState("");
  const [brochure, setBrochure] = useState("");
  const [showcaseCards, setShowcaseCards] = useState([]);
  const [faqImage, setFaqImage] = useState("");
  const [faqImageAlt, setFaqImageAlt] = useState("");
  const [faqImageTitle, setFaqImageTitle] = useState("");
  const [applications, setApplications] = useState([{ title: "", description: "" }]);
  const [contentSections, setContentSections] = useState([{ heading: "", description: "", image: "" }, { heading: "", description: "", image: "" }]);
  const [whyChoose, setWhyChoose] = useState([{ title: "", description: "" }]);
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [searchIndexing, setSearchIndexing] = useState("index");
  const [ogImage, setOgImage] = useState("");
  const [ogImageAlt, setOgImageAlt] = useState("");
  const [ogImageTitle, setOgImageTitle] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [linkFollowing, setLinkFollowing] = useState("follow");
  const [schemaType, setSchemaType] = useState("Product");
  const [seoBrand, setSeoBrand] = useState("Mohindra Mechanical Works");
  const [categories, setCategories] = useState(() => {
    try {
      return [
        ...new Set([
          ...MACHINE_CATEGORIES,
          ...JSON.parse(localStorage.getItem("mmw-categories") || "[]"),
        ]),
      ];
    } catch {
      return MACHINE_CATEGORIES;
    }
  });
  const [groups, setGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mmw-product-groups") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(""),
    [selectedSubCategory, setSelectedSubCategory] = useState(""),
    [selectedGroup, setSelectedGroup] = useState(""),
    [featured, setFeatured] = useState(false),
    [sortOrder, setSortOrder] = useState(0),
    [publishingStatus, setPublishingStatus] = useState("draft");
  const websiteId = website?._id || website?.id;
  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(websiteId || "")) return;
    api("/api/categories", { headers: { "x-website-id": websiteId } })
      .then(({ data }) => { setCategories(data.map((item) => ({
        id: item._id,
        name: item.name,
        parentId: item.parentId?._id || item.parentId || "",
        group: item.group || "",
      }))); setGroups([...new Set([...JSON.parse(localStorage.getItem("mmw-product-groups") || "[]"), ...data.map((item) => item.group).filter(Boolean)])]); })
      .catch((error) => onNotify("Could not load categories", error.message));
  }, [websiteId]);
  useEffect(() => {
    const structureRaw = sessionStorage.getItem("mmw-product-structure");
    if (structureRaw) {
      sessionStorage.removeItem("mmw-product-structure");
      try { const structure = JSON.parse(structureRaw); const productName = structure.productName || ""; setName(productName); setSlug(structure.productSlug || makeSlug(productName)); setHeroHeading(productName); setSelectedCategory(structure.categoryId || ""); setSelectedSubCategory(structure.subCategoryId || ""); setSelectedGroup(structure.group || ""); } catch { /* ignore invalid prefill */ }
    }
    const raw = sessionStorage.getItem("mmw-edit-product");
    if (!raw) return;
    sessionStorage.removeItem("mmw-edit-product");
    try {
      const product = JSON.parse(raw);
      setEditingId(product._id || "");
      setName(product.name || ""); setSlug(product.slug || "");
      setShortDescription(product.shortDescription || ""); setDescription(product.description || "");
      setPrice(product.priceLabel || ""); setSelectedCategory(product.categoryId || "");
      setSelectedSubCategory(product.subCategoryId || ""); setSelectedGroup(product.productGroup || "");
      setHeroHeading(product.hero?.heading || ""); setHeroSubheading(product.hero?.subheading || ""); setBannerImage(product.hero?.image?.url || ""); setBannerImageAlt(product.hero?.image?.alt || ""); setBannerImageTitle(product.hero?.image?.title || "");
      setFeaturedImage(product.featuredImage?.url || ""); setFeaturedImageAlt(product.featuredImage?.alt || ""); setFeaturedImageTitle(product.featuredImage?.title || "");
      setGallery(product.gallery || []); setVideoUrl(product.videoSection?.youtubeUrls?.[0] || product.videoSection?.youtubeUrl || ""); setSecondVideoUrl(product.videoSection?.youtubeUrls?.[1] || ""); setThirdVideoUrl(product.videoSection?.youtubeUrls?.[2] || "");
      setBrochure(product.brochure?.url || ""); setSpecs(product.specifications?.length ? product.specifications : [{ name: "", value: "" }]);
      setContentSections(product.contentSections?.length ? product.contentSections.map((item) => ({ ...item, image: item.image?.url || item.image || "" })) : [{ heading: "", description: "", image: "" }, { heading: "", description: "", image: "" }]);
      setWhyChoose(product.whyChoose?.length ? product.whyChoose.map((item) => ({ title: item.name || "", description: item.value || "" })) : [{ title: "", description: "" }]);
      setFeatures((product.features || []).map((item) => { const [title, ...rest] = String(item).split(":"); return { title: title.trim(), description: rest.join(":").trim() }; })); setFaqs(product.faqs?.length ? product.faqs : [{ question: "", answer: "" }]);
      setApplications((product.applications || []).map((item) => { const [title, ...rest] = String(item).split(":"); return { title: title.trim(), description: rest.join(":").trim() }; }).filter((item) => item.title).concat((product.applications || []).length ? [] : [{ title: "", description: "" }])); setShowcaseCards(product.showcaseCards || []); setFaqImage(product.faqSection?.image?.url || ""); setFaqImageAlt(product.faqSection?.image?.alt || ""); setFaqImageTitle(product.faqSection?.image?.title || "");
      setSeoTitle(product.seo?.title || ""); setSeoDescription(product.seo?.description || ""); setSeoKeywords((product.seo?.keywords || []).join(", ")); setFocusKeyword(product.seo?.focusKeyword || ""); setCanonicalUrl(product.seo?.canonical || ""); setSearchIndexing(product.seo?.index === false ? "noindex" : "index"); setLinkFollowing(product.seo?.follow === false ? "nofollow" : "follow"); setOgTitle(product.seo?.ogTitle || ""); setOgDescription(product.seo?.ogDescription || ""); setOgImage(product.seo?.ogImage?.url || ""); setOgImageAlt(product.seo?.ogImage?.alt || ""); setOgImageTitle(product.seo?.ogImage?.title || ""); setSchemaType(product.seo?.schemaType || "Product"); setSeoBrand(product.seo?.brand || "Mohindra Mechanical Works");
      setPublishingStatus(product.status || "draft"); setFeatured(Boolean(product.featured)); setSortOrder(product.sortOrder || 0);
      onNotify("Product loaded for editing", product.name, "info");
    } catch { onNotify("Could not open product", "Saved product data is invalid.", "danger"); }
  }, []);
  const addOption = async (type) => {
    const isSubCategory = type === "sub-category";
    if (isSubCategory && !selectedCategory) {
      onNotify("Select main category", "Please select a main category before adding a sub-category.", "danger");
      return;
    }
    const label = window.prompt(`Enter new ${isSubCategory ? "sub-category" : "main category"} name:`)?.trim();
    if (!label) return;
    try {
      const { data } = await api("/api/categories", {
        method: "POST",
        headers: { "x-website-id": websiteId },
        body: JSON.stringify({
          name: label,
          slug: makeSlug(label),
          parentId: isSubCategory ? selectedCategory : null,
          status: "published",
        }),
      });
      const record = { ...data, id: data._id, parentId: data.parentId || "" };
      setCategories((current) => [...current, record]);
      if (isSubCategory) setSelectedSubCategory(record.id);
      else {
        setSelectedCategory(record.id);
        setSelectedSubCategory("");
      }
      onNotify(isSubCategory ? "Sub-category added" : "Main category added", `${label} saved and selected.`);
    } catch (error) {
      onNotify(`Could not add ${isSubCategory ? "sub-category" : "main category"}`, error.message, "danger");
    }
  };
  const previewProduct = () => {
    const media = (url, alt) => url ? {url, alt} : undefined;
    localStorage.setItem('mmw-product-preview', JSON.stringify({
      name, description, shortDescription, priceLabel: price, website,
      categoryName: categories.find(x=>x.id===selectedCategory)?.name,
      subCategoryName: categories.find(x=>x.id===selectedSubCategory)?.name,
      productGroup: selectedGroup,
      hero: {heading:heroHeading, subheading:heroSubheading, image:media(bannerImage,bannerImageAlt)},
      featuredImage:media(featuredImage,featuredImageAlt), gallery:gallery.map(x=>typeof x==='string'?{url:x}:x),
      videoSection:{youtubeUrls:[videoUrl,secondVideoUrl].filter(Boolean)},
      features:features.filter(x=>x.title).map(x=>[x.title,x.description].filter(Boolean).join(': ')),
      specifications:specs.filter(x=>x.name&&x.value),
      showcaseCards:showcaseCards.map(x=>({...x,image:typeof x.image==='string'?{url:x.image}:x.image})),
      faqs, faqSection:{image:media(faqImage,faqImageAlt)}
    }));
    window.open('/?preview=product','_blank','noopener,noreferrer');
  };
  const makeSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const catalogueFile = (value) =>
    `${String(value || "Product").trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join("") || "Product"}.php`;
  const readImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFeaturedImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  const readSingleImage = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  const readFiles = (files, done) =>
    Promise.all(
      [...files].map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.readAsDataURL(file);
          }),
      ),
    ).then(done);
  const [specs, setSpecs] = useState([
    { name: "Printing Width", value: "" },
    { name: "Printing Speed", value: "" },
  ]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [features, setFeatures] = useState([{ title: "", description: "" }]);
  const [steps, setSteps] = useState([{ title: "", description: "" }]);
  const [testimonials, setTestimonials] = useState([
    { name: "", role: "", quote: "" },
  ]);
  const [tab, setTab] = useState(() => {
    const requested = sessionStorage.getItem("mmw-product-tab");
    sessionStorage.removeItem("mmw-product-tab");
    return ["content", "media", "seo"].includes(requested)
      ? requested
      : "content";
  });
  useEffect(() => {
    const section = sessionStorage.getItem("mmw-product-section");
    sessionStorage.removeItem("mmw-product-section");
    if (!section) return;
    const timer = window.setTimeout(
      () => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      120,
    );
    return () => window.clearTimeout(timer);
  }, [tab]);
  useEffect(() => {
    const openSection = (event) => {
      const nextTab = event.detail?.tab || "content";
      const section = event.detail?.section;
      setTab(nextTab);
      window.setTimeout(
        () => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    };
    window.addEventListener("mmw-open-product-section", openSection);
    return () => window.removeEventListener("mmw-open-product-section", openSection);
  }, []);
  const addSpec = () => setSpecs([...specs, { name: "", value: "" }]);
  const updateSpec = (i, key, value) =>
    setSpecs(specs.map((s, n) => (n === i ? { ...s, [key]: value } : s)));
  const removeSpec = (i) => setSpecs(specs.filter((_, n) => n !== i));
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const updateFaq = (i, key, value) =>
    setFaqs(faqs.map((f, n) => (n === i ? { ...f, [key]: value } : f)));
  const updateList = (setter, list, index, key, value) =>
    setter(
      list.map((item, n) => (n === index ? { ...item, [key]: value } : item)),
    );
  const saveProduct = async (status = "published") => {
    if (!name.trim()) {
      onNotify(
        "Product name required",
        "Please enter a product name before publishing.",
      );
      return;
    }
    setPublishing(true);
    try {
      if (!/^[a-f\d]{24}$/i.test(websiteId || ""))
        throw new Error("Select a saved website before publishing");
      const finalSlug = slug || makeSlug(name);
      const finalHeroHeading = heroHeading.trim() || name.trim();
      const finalSeoTitle = seoTitle || `${name} | ${website.name}`.slice(0, 60);
      const finalSeoDescription = seoDescription || shortDescription.slice(0, 160);
      const finalCanonical = canonicalUrl || `https://${website.domain}/${catalogueFile(name)}`;
      const result = await api(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "x-website-id": websiteId },
        body: JSON.stringify({
          name,
          slug: finalSlug,
          categoryId: /^[a-f\d]{24}$/i.test(selectedCategory) ? selectedCategory : undefined,
          subCategoryId: /^[a-f\d]{24}$/i.test(selectedSubCategory) ? selectedSubCategory : undefined,
          productGroup: selectedGroup,
          shortDescription,
          description,
          priceLabel: price,
          hero: { heading: finalHeroHeading, subheading: heroSubheading, image: bannerImage ? { url: bannerImage, alt: bannerImageAlt || `${name} banner`, title: bannerImageTitle || name } : undefined },
          featuredImage: featuredImage ? { url: featuredImage, alt: featuredImageAlt || name, title: featuredImageTitle || name } : undefined,
          gallery: gallery.slice(0, 3).filter(Boolean).map((item, index) => typeof item === "string" ? { url: item, alt: `${name} image ${index + 2}`, title: `${name} image ${index + 2}` } : { ...item, alt: item.alt || `${name} image ${index + 2}`, title: item.title || `${name} image ${index + 2}` }),
          videoSection: { heading: videoHeading, youtubeUrl: videoUrl, youtubeUrls: [videoUrl, secondVideoUrl, thirdVideoUrl].filter(Boolean) },
          brochure: brochure ? { url: brochure, title: `${name} brochure` } : undefined,
          contentSections: contentSections
            .filter((item) => item.heading?.trim() || item.description?.trim() || item.image)
            .map((item) => ({
              heading: item.heading?.trim() || name,
              description: item.description || "",
              image: item.image
                ? { url: typeof item.image === "string" ? item.image : item.image.url, alt: `${item.heading || name} image`, title: item.heading || name }
                : undefined,
            })),
          whyChoose: whyChoose
            .filter((item) => item.title?.trim() || item.description?.trim())
            .map((item) => ({ name: item.title, value: item.description })),
          showcaseCards: showcaseCards.map((card, order) => ({ ...card, order, image: typeof card.image === "string" ? { url: card.image, alt: card.imageAlt || card.title || name, title: card.imageTitle || card.title || name } : { ...card.image, alt: card.imageAlt || card.image?.alt || card.title || name, title: card.imageTitle || card.image?.title || card.title || name } })),
          specifications: specs.filter((item) => item.name?.trim() && item.value?.trim()),
          features: features.map((item) => typeof item === "string" ? item : [item.title, item.description].filter(Boolean).join(": ")).filter(Boolean),
          applications: applications.map((item) => [item.title, item.description].filter(Boolean).join(": ")).filter(Boolean),
          faqs,
          faqSection: { image: faqImage ? { url: faqImage, alt: faqImageAlt || `${name} frequently asked questions`, title: faqImageTitle || `${name} FAQ` } : undefined },
          seo: { title: finalSeoTitle, description: finalSeoDescription, keywords: seoKeywords.split(",").map((x) => x.trim()).filter(Boolean), focusKeyword, canonical: finalCanonical, index: status === "published" && searchIndexing === "index", follow: linkFollowing === "follow", ogTitle: ogTitle || finalSeoTitle, ogDescription: ogDescription || finalSeoDescription, ogImage: ogImage ? { url: ogImage, alt: ogImageAlt || `${name} social sharing image`, title: ogImageTitle || name } : undefined, schemaType, brand: seoBrand },
          status,
          featured,
          sortOrder,
        }),
      });
      onNotify(
        status === "published" ? "Product published" : "Draft saved",
        status === "published" ? `${name} is now visible on ${website.name}.` : `${name} was saved securely in the database.`,
      );
      if (status === "published") onPublished(name, result.data);
    } catch (error) {
      onNotify(
        "Could not publish",
        error.message,
      );
    } finally {
      setPublishing(false);
    }
  };
  return (
    <div className="product-form-page animate-in">
      <div className="form-page-head">
        <div>
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft /> Products
          </button>
          <h1>Add new product</h1>
          <p>Edit the sections displayed on this product detail page.</p>
        </div>
        <div className="form-head-actions">
          <button className="btn secondary" onClick={previewProduct}>
            <Eye /> Preview frontend
          </button>
          <button
            className="btn secondary"
            onClick={() => {
                saveProduct("draft");
            }}
          >
            <Save /> Save draft
          </button>
          <button
            className="btn primary"
            disabled={publishing}
            onClick={() => saveProduct("published")}
          >
            <Check /> {publishing ? "Saving..." : "Publish product"}
          </button>
        </div>
      </div>
      <div className="form-tabs">
        {[
          ["page-banner", "1. Page Banner"],
          ["basic-information", "2. Product Details"],
          ["key-features", "3. Key Features"],
          ["technical-specifications", "4. Technical Specifications"],
          ["manufactured-products", "5. Manufactured Products"],
          ["product-faq", "6. Frequently Asked Questions"],
        ].map(([id, label]) => (
          <button
            type="button"
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="optional-fields-note">
        <Check />
        <span>
          <b>Only Product name is compulsory.</b> Leave any other field blank
          and that content or section will not be shown on the frontend.
        </span>
      </div>
      <div className="tab-single product-detail-editor">
<section className="form-card" id="page-banner">
              <div className="form-card-title">
                <ImagePlus />
                <div>
                  <h3>Page banner / hero section</h3>
                  <p>The first section visitors see on the product page</p>
                </div>
              </div>
              <Field label="Main heading">
                <input
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                  placeholder={name || "High Performance Servo Rotogravure Printing Machine"}
                  required
                />
              </Field>
              <Field label="Subheading (above main heading)">
                <textarea
                  rows="2"
                  value={heroSubheading}
                  onChange={(e) => setHeroSubheading(e.target.value)}
                  placeholder="Add a concise value proposition for this product..."
                />
              </Field>
              <div className="upload-box">
                <ImagePlus />
                <b>
                  {bannerImage
                    ? "Banner image selected"
                    : "Upload banner image"}
                </b>
                <span>Recommended 1920 × 720 px · JPG, PNG or WebP</span>
                <button type="button" className="btn secondary">
                  <Upload /> Choose image
                </button>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => readSingleImage(e.target.files?.[0], setBannerImage)}
                />
              </div>
              <div className="form-grid two">
                <Field label="Banner image alt text" required><input value={bannerImageAlt} onChange={(e) => setBannerImageAlt(e.target.value)} placeholder={`${name || "Product"} banner image`} /></Field>
                <Field label="Banner image title"><input value={bannerImageTitle} onChange={(e) => setBannerImageTitle(e.target.value)} placeholder="Banner title shown on hover" /></Field>
              </div>
            </section>
<section className="form-card" id="basic-information">
              <div className="form-card-title">
                <Heading2 />
                <div>
                  <h3>Product detail page</h3>
                  <p>These details belong to the product selected in Product Structure.</p>
                </div>
              </div>
              <div className="form-grid two">
                <Field label="Product name" required>
                  <input
                    value={name}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      setHeroHeading((current) => !current.trim() || current === name ? nextName : current);
                      setName(nextName);
                      setSlug(makeSlug(nextName));
                    }}
                    placeholder="e.g. Servo Rotogravure Printing Machine"
                  />
                </Field>
                <Field
                  label="URL slug"
                  required
                  hint="Generated automatically; edit only when required."
                >
                  <div className="input-prefix">
                    <span>/</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(makeSlug(e.target.value))}
                      placeholder="servo-rotogravure-printing-machine"
                    />
                  </div>
                </Field>
              </div>
              <div className="form-grid two">
<Field label="Category"><select value={selectedCategory} onChange={(e)=>{setSelectedCategory(e.target.value);setSelectedSubCategory('');}}><option value="">Select category</option>{categories.filter(x=>!x.parentId).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
<Field label="Sub-category"><select value={selectedSubCategory} onChange={(e)=>setSelectedSubCategory(e.target.value)}><option value="">Select sub-category</option>{categories.filter(x=>x.parentId===selectedCategory).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
<Field label="Group"><input value={selectedGroup} onChange={(e)=>setSelectedGroup(e.target.value)}/></Field>
</div>
<Field label="Product introduction">
                <textarea
                  rows="3"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Write a short introduction for this product detail page..."
                />
              </Field>
            </section>
<section className="form-card" id="machine-images">
            <div className="form-card-title">
              <ImagePlus />
              <div>
                <h3>Machine images</h3>
                <p>Upload the main machine image and up to 3 images of additional views of this machine.</p>
              </div>
            </div>
            <div className="media-grid">
              <div className="upload-box">
                <ImagePlus />
                <b>
                  {featuredImage ? "Featured image selected" : "Featured image"}
                </b>
                <span>Square or 4:3 WebP recommended</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => readImage(e.target.files?.[0])}
                />
              </div>
              <div className="upload-box">
                <ImagesIcon />
                <b>
                  {gallery.length
                    ? `${Math.min(gallery.length, 3)} of 3 gallery images selected`
                    : "Machine image gallery"}
                </b>
                <span>Select up to 3 images of additional views of this machine</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => readFiles([...e.target.files].slice(0, 3), (urls) => setGallery(urls.map((url) => ({ url, alt: "", title: "" }))))}
                />
              </div>
            </div>
            <div className="form-grid two">
              <Field label="Featured machine image alt text" required><input value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} placeholder="Describe the machine shown in the image" /></Field>
              <Field label="Featured machine image title"><input value={featuredImageTitle} onChange={(e) => setFeaturedImageTitle(e.target.value)} placeholder="Machine image title shown on hover" /></Field>
            </div>
            {gallery.length > 0 && <div className="gallery-meta-list">{gallery.slice(0,3).map((img, i) => <div className="gallery-meta-row" key={img.url || i}><label className="gallery-replace"><img src={img.url || img} alt={img.alt || "Machine image preview"} /><span>Replace machine image {i + 1}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e)=>readSingleImage(e.target.files?.[0],(url)=>setGallery(gallery.map((x,n)=>n===i?{...(typeof x==="object"?x:{}),url}:x)))}/></label><input value={img.alt || ""} onChange={(e) => setGallery(gallery.map((x, n) => n === i ? { ...x, alt: e.target.value } : x))} placeholder={`Machine image ${i + 1} alt text`} /><input value={img.title || ""} onChange={(e) => setGallery(gallery.map((x, n) => n === i ? { ...x, title: e.target.value } : x))} placeholder="Machine image title" /><button type="button" className="remove-row" onClick={()=>setGallery(gallery.filter((_,n)=>n!==i))}>Remove</button></div>)}</div>}
          </section>
<section className="form-card" id="description-price">
              <div className="form-card-title">
                <AlignLeft />
                <div>
                  <h3>Product description</h3>
                  <p>
                    Use the Image button to upload JPG, PNG, GIF or WebP from
                    your computer
                  </p>
                </div>
              </div>
              <Field label="Price / price label" hint="Example: fixed price, starting price, or Price on request.">
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price on request" />
              </Field>
              <Editor
                tinymce={tinymce}
                licenseKey="gpl"
                value={description}
                onEditorChange={setDescription}
                init={{
                  license_key: "gpl",
                  skin: false,
                  content_css: false,
                  height: 430,
                  menubar: "file edit view insert format tools table help",
                  plugins:
                    "advlist autolink charmap code codesample emoticons fullscreen help image insertdatetime link lists media nonbreaking pagebreak preview quickbars searchreplace table visualblocks visualchars wordcount",
                  toolbar:
                    "undo redo | image media link | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table blockquote codesample | removeformat code fullscreen preview",
                  toolbar_mode: "wrap",
                  branding: false,
                  promotion: false,
                  placeholder:
                    "Write a detailed product description and upload images...",
                  automatic_uploads: true,
                  image_advtab: true,
                  image_caption: true,
                  image_title: true,
                  object_resizing: "img",
                  images_file_types: "jpg,jpeg,png,gif,webp",
                  images_upload_handler: (blobInfo) =>
                    Promise.resolve(
                      `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`,
                    ),
                  file_picker_types: "image media file",
                  file_picker_callback: (callback, _value, meta) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept =
                      meta.filetype === "image"
                        ? "image/jpeg,image/png,image/gif,image/webp"
                        : meta.filetype === "media"
                          ? "video/*,audio/*"
                          : "*/*";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () =>
                        callback(String(reader.result), {
                          title: file.name,
                          alt: file.name,
                        });
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  },
                  content_style:
                    "body{font-family:Arial,sans-serif;font-size:14px;line-height:1.65;padding:12px} img{max-width:100%;height:auto} figure.image{margin:1em auto;text-align:center} figure.image figcaption{color:#667;font-size:12px}",
                  quickbars_selection_toolbar:
                    "bold italic | quicklink h2 h3 blockquote",
                  quickbars_insert_toolbar: "quickimage quicktable",
                }}
              />
            </section>
<section className="form-card" id="product-video-brochure"><div className="form-card-title"><Video/><div><h3>Machine videos</h3><p>Two video previews appear below the main image. Click either to play in the image panel.</p></div></div><div className="form-grid two"><Field label="Video 1 (YouTube URL)"><input type="url" value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)}/></Field><Field label="Video 2 (YouTube URL)"><input type="url" value={secondVideoUrl} onChange={(e)=>setSecondVideoUrl(e.target.value)}/></Field></div></section>
<section className="form-card" id="key-features">
              <div className="form-card-title">
                <Check />
                <div>
                  <h3>Key features</h3>
                  <p>Feature cards shown below the product overview</p>
                </div>
                <button
                  type="button"
                  className="section-add"
                  onClick={() =>
                    setFeatures([...features, { title: "", description: "" }])
                  }
                >
                  <Plus /> Add feature
                </button>
              </div>
              {features.map((item, i) => (
                <div className="faq-edit" key={i}>
                  <div>
                    <b>Feature {i + 1}</b>
                    <button
                      type="button"
                      onClick={() =>
                        setFeatures(features.filter((_, n) => n !== i))
                      }
                    >
                      <Trash2 />
                    </button>
                  </div>
                  <input
                    value={item.title}
                    onChange={(e) =>
                      updateList(
                        setFeatures,
                        features,
                        i,
                        "title",
                        e.target.value,
                      )
                    }
                    placeholder="Feature heading"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) =>
                      updateList(
                        setFeatures,
                        features,
                        i,
                        "description",
                        e.target.value,
                      )
                    }
                    rows="2"
                    placeholder="Feature description"
                  />
                </div>
              ))}
            </section>
<section className="form-card" id="technical-specifications">
              <div className="form-card-title">
                <Settings2 />
                <div>
                  <h3>Technical specifications</h3>
                  <p>Add unlimited specification rows</p>
                </div>
                <button className="section-add" onClick={addSpec}>
                  <Plus /> Add row
                </button>
              </div>
              <div className="technical-table-wrap"><table className="technical-table technical-table-editor" aria-label="Edit technical specifications"><thead><tr><th scope="col">Specification</th><th scope="col">Value / Unit</th><th scope="col">Action</th></tr></thead><tbody>{specs.map((s,i)=><tr key={i}><td><input aria-label={`Specification ${i+1}`} value={s.name} onChange={e=>updateSpec(i,'name',e.target.value)} placeholder="Specification name"/></td><td><input aria-label={`Value ${i+1}`} value={s.value} onChange={e=>updateSpec(i,'value',e.target.value)} placeholder="Value / unit"/></td><td><button type="button" aria-label={`Remove specification ${i+1}`} onClick={()=>removeSpec(i)}><Trash2/></button></td></tr>)}</tbody></table></div>
</section>
<ProductCards cards={showcaseCards} setCards={setShowcaseCards} />
<section className="form-card" id="product-faq"><div className="form-card-title"><FileText/><div><h3>Frequently asked questions</h3><p>Product-specific FAQ image and questions will be displayed in a section on the frontend.</p></div><button type="button" className="section-add" onClick={addFaq}><Plus/> Add FAQ</button></div><div className="faq-editor-columns"><div>{faqs.map((faq,index)=><div className="faq-edit" key={index}><div><b>FAQ {index+1}</b><button type="button" onClick={()=>setFaqs(faqs.filter((_,itemIndex)=>itemIndex!==index))}><Trash2/></button></div><input value={faq.question} onChange={(event)=>updateFaq(index,"question",event.target.value)} placeholder="Question"/><textarea rows="3" value={faq.answer} onChange={(event)=>updateFaq(index,"answer",event.target.value)} placeholder="Answer"/></div>)}</div><div><label className="upload-box faq-image-upload">{faqImage?<img src={faqImage} alt={faqImageAlt || `${name || "Product"} FAQ section`} title={faqImageTitle || `${name || "Product"} FAQ section`}/>:<ImagePlus/>}<b>{faqImage?"Replace FAQ section image":"Upload FAQ section image"}</b><span>Will be displayed alongside the FAQ list on the frontend</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event)=>readSingleImage(event.target.files?.[0],setFaqImage)}/></label><div className="form-grid two"><Field label="FAQ image alt text" required><input value={faqImageAlt} onChange={(e)=>setFaqImageAlt(e.target.value)} placeholder={`${name || "Product"} FAQ image`}/></Field><Field label="FAQ image title"><input value={faqImageTitle} onChange={(e)=>setFaqImageTitle(e.target.value)} placeholder="FAQ image hover title"/></Field></div></div></div></section>
      </div>
    </div>
  );
}
function GlobeIcon() {
  return <FolderTree />;
}
function ImagesIcon() {
  return <Boxes />;
}
