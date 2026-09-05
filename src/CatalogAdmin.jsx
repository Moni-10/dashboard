import React, { useMemo, useState } from "react";
import {
  Save,
  Eye,
  Upload,
  Search,
  Layers3,
  Package,
  LayoutTemplate,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Globe2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { catalogGroups } from "./catalogData.js";
import { api } from "./api.js";
const base = {
  eyebrow: "OUR MACHINES",
  heading: "Industrial printing machines",
  description: "Explore precision-built printing and converting solutions.",
  image: "/catalog-hero.png",
  bannerImageAlt: "Industrial printing machines",
  bannerImageTitle: "Industrial printing machines",
  breadcrumbTitle: "Our Machines",
  enquiryLabel: "Enquiry",
  enquiryEmail: "info@mohindramechanical.com",
  seoTitle: "Industrial Printing Machines | Mohindra Mechanical Works",
  metaDescription:
    "Explore industrial printing machines manufactured by Mohindra Mechanical Works.",
  canonical: "",
  indexing: "index",
  ogImage: "",
  focusKeyword: "industrial printing machines",
  seoKeywords: "industrial printing machines, printing machine manufacturer",
  follow: true,
  ogTitle: "Industrial Printing Machines | Mohindra Mechanical Works",
  ogDescription: "Explore industrial printing and converting machines manufactured by Mohindra Mechanical Works.",
  schemaType: "CollectionPage",
  mainCards: [],
};
const getEdits = (websiteId = "default") => {
  try {
    return JSON.parse(localStorage.getItem(`mmw-catalog-edits:${websiteId}`) || "{}");
  } catch {
    return {};
  }
};
const saveEditsLocally = (websiteId, edits) => {
  const storageKey = `mmw-catalog-edits:${websiteId}`;
  // Uploaded data-URL images are stored by the API. Duplicating them in the
  // browser's small localStorage quota can prevent publishing entirely.
  const draft = JSON.stringify(edits, (_key, value) =>
    typeof value === "string" && value.startsWith("data:image/") ? "" : value,
  );
  try {
    localStorage.setItem(storageKey, draft);
  } catch {
    localStorage.removeItem(storageKey);
    try { localStorage.setItem(storageKey, draft); } catch { /* local drafts are optional */ }
  }
};
const all = [
  {
    key: "main",
    type: "Main page",
    name: "All Machines / Main Catalogue",
    icon: LayoutTemplate,
  },
  ...catalogGroups.map((g) => ({
    key: `category:${g.title}`,
    type: "Category page",
    name: g.title,
    icon: Layers3,
  })),
  ...catalogGroups.flatMap((g) =>
    g.products.map((p) => ({
      key: `product:${p.slug}`,
      type: "Product detail page",
      name: p.name,
      category: g.title,
      icon: Package,
      product: p,
    })),
  ),
];
const customPages = () => {
  try {
    return JSON.parse(localStorage.getItem("mmw-custom-pages") || "[]").map(
      (x) => ({
        ...x,
        icon:
          x.kind === "category"
            ? Layers3
            : x.kind === "product"
              ? Package
              : LayoutTemplate,
      }),
    );
  } catch {
    return [];
  }
};
const pageOptions = (mode) => {
  const pages = [...all, ...customPages()];
  return mode === "main"
    ? pages.filter((x) => x.key === "main")
    : mode === "category"
      ? pages.filter((x) => x.type === "Category page")
      : mode === "product"
        ? pages.filter((x) => x.type === "Product detail page")
        : pages;
};
function defaults(item) {
  if (item.key === "main") return base;
  if (item.key.startsWith("category:"))
    return {
      ...base,
      eyebrow: "PRODUCT CATEGORY",
      heading: item.name,
      breadcrumbTitle: item.name,
      description: `Explore our complete ${item.name.toLowerCase()} product range.`,
      introHeading: `Know Our ${item.name}`,
      priceLabel: "",
      secondaryCategory: "",
      introDescription: `Discover dependable ${item.name.toLowerCase()} engineered for consistent quality, productivity and long operational life.`,
      introBody: "Machine construction, mechanical assembly and system integration are completed with careful quality control. Every model can be configured for material, width, speed and production requirements.",
      introImage: item.product?.image || "",
      introImageAlt: `Industrial ${item.name}`,
      introImageTitle: item.name,
      introGallery: Array.from({ length: 4 }, (_, index) => ({ image: index === 0 ? (item.product?.image || "") : "", alt: `${item.name} image ${index + 1}`, title: `${item.name} ${index + 1}` })),
      overviewVideos: ["", ""],
      industriesHeading: "Industries We Served",
      industriesDescription: "Our machinery solutions are trusted by manufacturers across multiple industrial sectors.",
      industryCards: [
        { title: "Food Packaging Industry", description: "Reliable processing solutions for hygienic food-grade packaging materials.", image: "", imageAlt: "Food packaging industry", imageTitle: "Food Packaging Industry" },
        { title: "Label Manufacturing", description: "Precise production for high-quality labels used in retail and logistics.", image: "", imageAlt: "Label manufacturing application", imageTitle: "Label Manufacturing" },
        { title: "Printing & Graphics Sector", description: "Consistent output, rich print quality and dependable production performance.", image: "", imageAlt: "Printing and graphics sector", imageTitle: "Printing & Graphics Sector" },
        { title: "Flexible Packaging Industry", description: "High-speed machinery for strong, modern multilayer packaging structures.", image: "", imageAlt: "Flexible packaging industry", imageTitle: "Flexible Packaging Industry" },
      ],
      rangeHeading: `Our ${item.name} Range`,
      rangeDescription: "Choose the right model for your material and production requirements.",
      whyChooseEyebrow: "WHY CHOOSE US",
      whyChooseHeading: `Why Choose Our ${item.name}`,
      whyChooseDescription: "Dependable machinery, engineered support and solutions configured for your production requirements.",
      whyChooseImage: "",
      whyChooseImageAlt: `Why choose ${item.name}`,
      whyChooseImageTitle: `Why Choose Our ${item.name}`,
      whyChooseCards: [
        { title: "Precision Engineering", description: "Robust construction and accurate performance for consistent production." },
        { title: "Custom Configuration", description: "Machine specifications configured around your material and output needs." },
        { title: "Reliable Support", description: "Responsive technical guidance from installation through production." },
      ],
      seoTitle: `${item.name} | Mohindra Mechanical Works`,
    };
  return {
    ...base,
    eyebrow: "INDUSTRIAL PRINTING MACHINE",
    heading: item.name,
    breadcrumbTitle: item.name,
    description: item.product?.description || "Product description",
    image: item.product?.image || base.image,
    seoTitle: `${item.name} | Mohindra Mechanical Works`,
  };
}
export default function CatalogAdmin({
  onPreview,
  onCreate,
  notify,
  mode = "all",
  website,
}) {
  const websiteId = website?._id || website?.id || "default";
  const fallbackList = pageOptions(mode),
    initial = fallbackList[0],
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(initial),
    [remotePages, setRemotePages] = useState(null),
    [edits, setEdits] = useState(() => getEdits(websiteId)),
    [saved, setSaved] = useState(false),
    [saving, setSaving] = useState(false),
    [remoteProducts, setRemoteProducts] = useState([]),
    [remoteCategoryIds, setRemoteCategoryIds] = useState([]),
    [activeMainCardId, setActiveMainCardId] = useState(""),
    [tab, setTab] = useState("content"),
    [data, setData] = useState({
      ...defaults(initial),
      ...(getEdits(websiteId)[initial.key] || {}),
    });
  const list = remotePages === null ? fallbackList : remotePages;
  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(websiteId || "")) return;
    const headers = { "x-website-id": websiteId };
    Promise.all([api("/api/categories", { headers }), api("/api/products?limit=100", { headers }), api("/api/content?type=page", { headers })]).then(([categoryResult, productResult, contentResult]) => {
      const categories = categoryResult.data || [];
      const products = productResult.data || [];
      setRemoteProducts(products);
      const savedPages = contentResult.data || [];
      const savedPageData = (slug) => {
        const record = savedPages.find((item) => item.slug === slug);
        if (!record) return {};
        try { return { ...JSON.parse(record.content || "{}"), seoTitle: record.seo?.title || undefined, metaDescription: record.seo?.description || undefined, canonical: record.seo?.canonical || undefined, indexing: record.seo?.index === false ? "noindex" : "index", follow: record.seo?.follow !== false, focusKeyword: record.seo?.focusKeyword || undefined, seoKeywords: (record.seo?.keywords || []).join(", ") || undefined, ogTitle: record.seo?.ogTitle || undefined, ogDescription: record.seo?.ogDescription || undefined, ogImage: record.seo?.ogImage || undefined, schemaType: record.seo?.schemaType || undefined }; }
        catch { return {}; }
      };
      if (mode === "main") {
        const mainCategories = categories.filter((category) => !category.parentId);
        setRemoteCategoryIds(mainCategories.map((category) => category._id));
        setActiveMainCardId((current) => current || mainCategories[0]?._id || "");
        setData((current) => ({ ...current, mainCards: mainCategories.map((category) => ({ _id: category._id, title: category.name, group: category.group || "", slug: category.slug, description: category.description || "", image: category.image?.url || "", imageAlt: category.image?.alt || "", imageTitle: category.image?.title || "", icon: category.icon?.url || "", iconAlt: category.icon?.alt || "", iconTitle: category.icon?.title || "", active: category.status === "published" })) }));
        return;
      }
      const pages = mode === "category"
        ? categories.filter((category) => !category.parentId).map((category) => {
            const relatedIds = new Set([String(category._id), ...categories.filter((child) => String(child.parentId || "") === String(category._id)).map((child) => String(child._id))]);
            return { key: `category:${category.name}`, type: "Sub-product page", name: category.name, icon: Layers3, category, savedData: { mainCategoryName: category.name, productGroup: category.group || "", ...savedPageData(`category-${category.slug}`), rangeCards: products.filter((product) => relatedIds.has(String(product.categoryId || ""))).map((product) => ({ _id: product._id, title: product.name, slug: product.slug, group: product.productGroup || "", description: product.shortDescription || "", image: product.featuredImage?.url || "", imageAlt: product.featuredImage?.alt || "", imageTitle: product.featuredImage?.title || "", active: product.status === "published" })) } };
          })
        : products.map((product) => ({ key: `product:${product.slug}`, type: "Product detail page", name: product.name, category: product.categoryName || product.productGroup || "Product", icon: Package, product: { ...product, image: product.featuredImage?.url || product.hero?.image?.url || "" } }));
      setRemotePages(pages);
      if (!pages.length) return;
      setSelected(pages[0]);
      setData({ ...defaults(pages[0]), ...(pages[0].savedData || {}), ...(getEdits(websiteId)[pages[0].key] || {}) });
    }).catch(() => {});
  }, [mode, websiteId]);
  const shown = useMemo(
    () =>
      list.filter((x) => x.name.toLowerCase().includes(query.toLowerCase())),
    [query, list],
  );
  const title =
    mode === "main"
      ? "Main Products Page"
      : mode === "category"
        ? "Sub-product Pages"
        : mode === "product"
          ? "Product Details Pages"
          : "All Page Builder";
  function select(item) {
    setSelected(item);
    setData({ ...defaults(item), ...(item.savedData || {}), ...(edits[item.key] || {}) });
    setSaved(false);
    setTab("content");
  }
  function editPage(item) {
    select(item);
    window.setTimeout(() => document.querySelector(".builder-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  async function deletePage(event, item) {
    event.stopPropagation();
    if (!window.confirm(`Delete “${item.name}”? This page and its saved category/product record will be permanently removed.`)) return;
    const headers = { "x-website-id": websiteId };
    try {
      if (item.category?._id) await api(`/api/categories/${item.category._id}`, { method: "DELETE", headers });
      else if (item.product?._id) await api(`/api/products/${item.product._id}?permanent=true`, { method: "DELETE", headers });
      else throw new Error("This is not a saved database page");
      const nextPages = (remotePages || []).filter((page) => page.key !== item.key);
      setRemotePages(nextPages);
      if (selected.key === item.key && nextPages.length) select(nextPages[0]);
      notify?.("Page deleted", `${item.name} permanently removed.`);
    } catch (error) {
      notify?.("Could not delete page", error.message);
    }
  }
  function set(k, v) {
    setData({ ...data, [k]: v });
    setSaved(false);
  }
  function upload(e, key = "image") {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set(key, String(reader.result));
    reader.readAsDataURL(file);
  }
  function updateMainCard(index, key, value) {
    const cards = [...(data.mainCards || [])];
    cards[index] = { ...cards[index], [key]: value };
    set("mainCards", cards);
  }
  function uploadCardImage(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateMainCard(index, "image", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  function uploadCardIcon(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateMainCard(index, "icon", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  function addMainCard() {
    set("mainCards", [...(data.mainCards || []), { title: "Main product category", group: "", description: "Add a short description for this machinery category.", slug: "", image: "", imageAlt: "", imageTitle: "", icon: "", iconAlt: "", iconTitle: "", active: true }]);
  }
  function updateIndustry(index, key, value) {
    const cards = [...(data.industryCards || [])];
    cards[index] = { ...cards[index], [key]: value };
    set("industryCards", cards);
  }
  function uploadIndustryImage(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateIndustry(index, "image", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  function addIndustry() {
    set("industryCards", [...(data.industryCards || []), { title: "Industry name", image: "", imageAlt: "", imageTitle: "" }]);
  }
  function updateIntroGallery(index, key, value) {
    const gallery = [...(data.introGallery || Array.from({ length: 4 }, () => ({ image: "", alt: "", title: "" })))];
    gallery[index] = { ...gallery[index], [key]: value };
    set("introGallery", gallery);
  }
  function uploadIntroGallery(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateIntroGallery(index, "image", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  function updateOverviewVideo(index, value) {
    const videos = [...(data.overviewVideos || ["", ""] )];
    videos[index] = value;
    set("overviewVideos", videos);
  }
  function updateRangeCard(index, key, value) {
    const cards = [...(data.rangeCards || [])];
    cards[index] = { ...cards[index], [key]: value };
    set("rangeCards", cards);
  }
  function uploadRangeImage(event, index) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateRangeCard(index, "image", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  function addRangeCard() {
    const cards = data.rangeCards || [];
    const usedSlugs = new Set(cards.map((card) => card.slug).filter(Boolean));
    let number = cards.length + 1;
    let slug = `new-product-${number}`;
    while (usedSlugs.has(slug)) slug = `new-product-${++number}`;
    set("rangeCards", [...cards, { title: `New product ${number}`, slug, group: "", description: "", image: "", imageAlt: "", imageTitle: "", active: true }]);
  }
  function updateWhyCard(index, key, value) {
    const cards = [...(data.whyChooseCards || [])];
    cards[index] = { ...cards[index], [key]: value };
    set("whyChooseCards", cards);
  }
  function addWhyCard() {
    set("whyChooseCards", [...(data.whyChooseCards || []), { title: "Why choose point", description: "Add a short benefit description." }]);
  }
  function uploadWhyImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("whyChooseImage", String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  async function save() {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      if (!/^[a-f\d]{24}$/i.test(websiteId || "")) throw new Error("Please select a website before publishing.");
      const next = { ...edits, [selected.key]: data };
      setEdits(next);
      saveEditsLocally(websiteId, next);
      const slugify = (value = "") => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const sourceSlug = mode === "category" ? selected.category?.slug : selected.product?.slug;
      const pageSlug = mode === "main" ? "main-catalogue" : mode === "category" ? `category-${sourceSlug || slugify(selected.name)}` : `product-${sourceSlug || slugify(selected.name)}`;
      const headers = { "x-website-id": websiteId };
      if (mode === "main") {
        const retainedIds = new Set((data.mainCards || []).map((card) => card._id).filter(Boolean));
        for (const removedId of remoteCategoryIds.filter((id) => !retainedIds.has(id))) await api(`/api/categories/${removedId}`, { method: "DELETE", headers });
        const savedIds = [];
        for (const card of data.mainCards || []) {
          const categoryPayload = { name: card.title, slug: card.slug || slugify(card.title), group: card.group || "", description: card.description || "", parentId: null, image: { url: card.image || "", alt: card.imageAlt || card.title, title: card.imageTitle || card.title }, icon: { url: card.icon || "", alt: card.iconAlt || `${card.title} icon`, title: card.iconTitle || card.title }, status: card.active === false ? "draft" : "published", sortOrder: savedIds.length };
          const result = await api(`/api/categories${card._id ? `/${card._id}` : ""}`, { method: card._id ? "PUT" : "POST", headers, body: JSON.stringify(categoryPayload) });
          savedIds.push(result.data._id);
        }
        setRemoteCategoryIds(savedIds);
      }
      if (mode === "category" && selected.category?._id) {
        const categoryName = String(data.mainCategoryName || selected.name).trim();
        await api(`/api/categories/${selected.category._id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: categoryName,
            slug: selected.category.slug,
            group: String(data.productGroup || "").trim(),
            description: selected.category.description || "",
            image: selected.category.image,
            icon: selected.category.icon,
            status: selected.category.status || "published",
            sortOrder: selected.category.sortOrder || 0,
            parentId: selected.category.parentId || null,
          }),
        });
        const rangeCards = [];
        const editedIds = new Set((data.rangeCards || []).map((card) => String(card._id || "")).filter(Boolean));
        const usedSlugs = new Set(remoteProducts.filter((product) => !editedIds.has(String(product._id || ""))).map((product) => product.slug).filter(Boolean));
        for (const card of data.rangeCards || []) {
          const baseSlug = card.slug || slugify(card.title) || `product-${rangeCards.length + 1}`;
          let uniqueSlug = baseSlug;
          let suffix = 2;
          while (usedSlugs.has(uniqueSlug)) uniqueSlug = `${baseSlug}-${suffix++}`;
          usedSlugs.add(uniqueSlug);
          const productPayload = { name: card.title, slug: uniqueSlug, categoryId: selected.category._id, productGroup: card.group || selected.category.group || selected.name, shortDescription: card.description || "", featuredImage: { url: card.image || "", alt: card.imageAlt || card.title, title: card.imageTitle || card.title }, status: card.active === false ? "draft" : "published", sortOrder: rangeCards.length };
          const result = await api(`/api/products${card._id ? `/${card._id}` : ""}`, { method: card._id ? "PUT" : "POST", headers, body: JSON.stringify(productPayload) });
          rangeCards.push({ ...card, _id: result.data._id, slug: result.data.slug });
        }
        setRemoteProducts((current) => {
          const savedById = new Map(rangeCards.filter((card) => card._id).map((card) => [String(card._id), card]));
          return current.map((product) => savedById.has(String(product._id)) ? { ...product, slug: savedById.get(String(product._id)).slug } : product);
        });
        const updatedData = { ...data, rangeCards };
        const updatedEdits = { ...next, [selected.key]: updatedData };
        setData(updatedData);
        setEdits(updatedEdits);
        saveEditsLocally(websiteId, updatedEdits);
      }
      const pageContent = mode === "main" ? { ...data, mainCards: [] } : mode === "category" ? { ...data, rangeCards: [] } : data;
      const payload = { type: "page", title: data.heading || selected.name, slug: pageSlug, excerpt: data.description || "", content: JSON.stringify(pageContent), status: "published", file: data.image ? { name: `${pageSlug}-banner`, url: data.image, mimeType: "image/webp", size: 0 } : null, seo: { focusKeyword: data.focusKeyword || "", title: data.seoTitle || data.heading, description: data.metaDescription || data.description, keywords: String(data.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean), canonical: data.canonical || "", index: data.indexing !== "noindex", follow: data.follow !== false, ogTitle: data.ogTitle || data.seoTitle || data.heading, ogDescription: data.ogDescription || data.metaDescription || data.description, ogImage: data.ogImage || "", schemaType: data.schemaType || "CollectionPage" } };
      const existing = await api("/api/content?type=page", { headers });
      const record = (existing.data || []).find((item) => item.slug === pageSlug);
      await api(`/api/content${record ? `/${record._id}` : ""}`, { method: record ? "PUT" : "POST", headers, body: JSON.stringify(payload) });
      setSaved(true);
      notify?.("Page published", `${selected.name} banner and content saved for the public website.`);
    } catch (error) {
      notify?.("Page save failed", error.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="catalog-admin animate-in">
      <div className="pages-manager-head">
        <div>
          <span>DYNAMIC PAGE MANAGEMENT</span>
          <h1>{title}</h1>
          <p>
            {mode === "main"
              ? "Edit the first products page that displays every main-product card."
              : mode === "category"
                ? "Edit the page opened after clicking a main product; it contains page sections and its product range."
                : mode === "product"
                  ? "Edit the final detail page opened after clicking a product-range card."
                  : "Manage every catalogue page from one place."}
          </p>
        </div>
        <div className="form-head-actions">
          <button
            className="btn secondary"
            onClick={() =>
              mode === "main"
                ? addMainCard()
                : onCreate?.(mode === "product" ? "product" : "category")
            }
          >
            <Plus /> {mode === "main" ? "Add Main Card" : mode === "product" ? "Add Sub-product" : "Add Category"}
          </button>
          <button className="btn secondary" onClick={onPreview}>
            <Eye /> Preview
          </button>
          <button type="button" className="btn primary" onClick={save} disabled={saving}>
            <Save /> {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>
      <div className="page-flow">
        <span className={mode === "main" ? "active" : ""}>1. Main Products</span>
        <b>→</b>
        <span className={mode === "category" ? "active" : ""}>
          2. Sub-product Range
        </span>
        <b>→</b>
        <span className={mode === "product" ? "active" : ""}>
          3. Product Details
        </span>
      </div>
      <div className="builder-layout">
        <aside className="builder-pages">
          <label>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
            />
          </label>
          <div className="builder-page-list">
            {shown.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={selected.key === item.key ? "active" : ""}
                  onClick={() => editPage(item)}
                  key={item.key}
                >
                  <Icon />
                  <span>
                    <b>{item.name}</b>
                    <small>
                      {item.type}
                      {item.category ? ` · ${item.category}` : ""}
                    </small>
                  </span>
                  <em className="page-edit-label" onClick={(event) => { event.stopPropagation(); editPage(item); }}>
                    <Pencil /> Edit
                  </em>
                  {(item.category?._id || item.product?._id) && <em className="page-delete-label" onClick={(event) => deletePage(event, item)} title={`Delete ${item.name}`}><Trash2 /></em>}
                  {edits[item.key] && <CheckCircle2 />}
                </button>
              );
            })}
            {!shown.length && <p className="empty-state">No saved pages found. Create a category or product first.</p>}
          </div>
        </aside>
        <main className="builder-editor">
          <div className="builder-selected">
            <span>{selected.type} · EDIT MODE</span>
            <h2>{selected.name}</h2>
            {saved && (
              <em>
                <CheckCircle2 /> Saved and ready
              </em>
            )}
          </div>
          <div className="builder-tabs">
            <button
              className={tab === "content" ? "active" : ""}
              onClick={() => setTab("content")}
            >
              Content & Banner
            </button>
            <button
              className={tab === "seo" ? "active" : ""}
              onClick={() => setTab("seo")}
            >
              SEO & Indexing
            </button>
          </div>
          {tab === "content" ? (
            <>
              <section
                className="builder-live-banner"
                style={{
                  backgroundImage: `linear-gradient(90deg,rgba(8,16,27,.95),rgba(8,16,27,.45)),url("${data.image}")`,
                }}
              >
                <small>{data.eyebrow}</small>
                <h3>{data.heading}</h3>
                <p>{data.description}</p>
                <label className="banner-direct-upload">
                  <Upload />
                  <span>{data.image ? "Replace banner image" : "Add banner image"}</span>
                  <input type="file" accept="image/*" onChange={upload} />
                </label>
              </section>
              <div className="builder-form">
                <label>
                  <span>Small heading</span>
                  <input
                    value={data.eyebrow || ""}
                    onChange={(e) => set("eyebrow", e.target.value)}
                  />
                </label>
                <label>
                  <span>Page heading / product name</span>
                  <input
                    value={data.heading || ""}
                    onChange={(e) => setData({ ...data, heading: e.target.value, breadcrumbTitle: e.target.value, bannerImageTitle: e.target.value })}
                  />
                </label>
                <label className="full">
                  <span>Description / page content</span>
                  <textarea
                    rows="6"
                    value={data.description || ""}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </label>
                <div className="banner-meta-fields">
                  <label>
                    <span>Banner image alt text</span>
                    <input value={data.bannerImageAlt || ""} onChange={(e) => set("bannerImageAlt", e.target.value)} placeholder="Describe the banner image" />
                  </label>
                  <label>
                    <span>Banner image title</span>
                    <input value={data.bannerImageTitle || ""} onChange={(e) => set("bannerImageTitle", e.target.value)} placeholder="Banner image title shown on hover" />
                  </label>
                </div>
              </div>
              {mode === "main" && <section className="main-card-builder">
                <div className="main-card-builder-head"><div><span>MAIN PRODUCT CARDS</span><h3>Select main category card</h3><p>Select a Main Category created in Product Structure to edit its card content.</p></div><label className="main-card-selector"><span>Main category</span><select value={activeMainCardId} onChange={(event)=>setActiveMainCardId(event.target.value)}><option value="">Select main category</option>{(data.mainCards||[]).map(card=><option key={card._id||card.slug} value={card._id||card.slug}>{card.title}</option>)}</select></label></div>
                <div className="main-card-editor-grid">{(data.mainCards || []).map((card,index)=>({card,index})).filter(({card})=>!activeMainCardId||(card._id||card.slug)===activeMainCardId).map(({card,index})=><article className="main-card-editor" key={card._id || index}>
                  <div className="main-card-media-editor"><label className="main-card-image-upload">{card.image?<img src={card.image} alt={card.imageAlt || card.title}/>:<><Upload/><b>Upload card image</b></>}<input type="file" accept="image/*" onChange={(event)=>uploadCardImage(event,index)}/><i>{String(index+1).padStart(2,"0")}</i></label><label className="main-card-icon-upload">{card.icon?<img src={card.icon} alt={card.iconAlt || `${card.title} icon`}/>:<Layers3/>}<span>{card.icon?"Replace icon":"Upload orange icon"}</span><input type="file" accept="image/*" onChange={(event)=>uploadCardIcon(event,index)}/></label></div>
                  <div className="main-card-editor-fields"><label><span>Card title</span><input value={card.title || ""} onChange={(event)=>updateMainCard(index,"title",event.target.value)}/></label><label><span>Machine group</span><input value={card.group || ""} onChange={(event)=>updateMainCard(index,"group",event.target.value)} placeholder="Enter machine group"/></label><label><span>Category URL slug</span><input value={card.slug || ""} onChange={(event)=>updateMainCard(index,"slug",event.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))}/></label><label><span>Image alt text</span><input value={card.imageAlt || ""} onChange={(event)=>updateMainCard(index,"imageAlt",event.target.value)}/></label><label><span>Image title</span><input value={card.imageTitle || ""} onChange={(event)=>updateMainCard(index,"imageTitle",event.target.value)}/></label><label><span>Icon alt/title</span><input value={card.iconTitle || ""} onChange={(event)=>updateMainCard(index,"iconTitle",event.target.value)}/></label><label className="full"><span>Short description</span><textarea rows="3" value={card.description || ""} onChange={(event)=>updateMainCard(index,"description",event.target.value)}/></label><div className="main-card-editor-actions"><label><input type="checkbox" checked={card.active !== false} onChange={(event)=>updateMainCard(index,"active",event.target.checked)}/> Show on frontend</label><button type="button" onClick={()=>set("mainCards",data.mainCards.filter((_,cardIndex)=>cardIndex!==index))}><Trash2/> Remove</button></div></div>
                </article>)}</div>
              </section>}
              {mode === "category" && <section className="category-page-builder">
                <div className="main-card-builder-head"><div><span>SUB-PRODUCT OVERVIEW</span><h3>Image and description</h3><p>Reference layout: description on the left and a large image on the right.</p></div></div>
                <div className="builder-form category-extra-fields"><label><span>Heading</span><input value={data.introHeading || ""} onChange={(event)=>set("introHeading",event.target.value)}/></label><label><span>Category</span><input value={data.mainCategoryName || selected.name} onChange={(event)=>set("mainCategoryName",event.target.value)} placeholder="Enter category name"/></label><label><span>Group</span><input value={data.productGroup || ""} onChange={(event)=>set("productGroup",event.target.value)} placeholder="e.g. Printing, Lamination or Packaging"/></label><label className="full"><span>Description</span><textarea rows="6" value={data.introDescription || ""} onChange={(event)=>set("introDescription",event.target.value)}/></label></div>
<div className="overview-gallery-editor">{[0].map(index=>{const item=(data.introGallery||[])[index]||{};return <article key={index}><label className="industry-image-upload">{(item.image||data.introImage)?<img src={item.image||data.introImage} alt={item.alt||selected.name}/>:<><Upload/><span>Upload overview image</span></>}<input type="file" accept="image/*" onChange={event=>uploadIntroGallery(event,index)}/></label><input placeholder="Image alt text" value={item.alt||''} onChange={event=>updateIntroGallery(index,'alt',event.target.value)}/></article>;})}</div>
<div className="industry-builder-head"><div><span>TECHNICAL SPECIFICATIONS</span><h3>Technical specifications</h3></div><button type="button" className="btn secondary" onClick={()=>set('specifications',[...(data.specifications||[]),{name:'',value:''}])}><Plus/> Add specification</button></div>
<div className="technical-table-wrap"><table className="technical-table technical-table-editor" aria-label="Edit technical specifications"><thead><tr><th scope="col">Specification</th><th scope="col">Value / Unit</th><th scope="col">Action</th></tr></thead><tbody>{(data.specifications||[]).map((spec,index)=><tr key={index}><td><input aria-label="Specification name" placeholder="Specification name" value={spec.name||''} onChange={e=>set('specifications',data.specifications.map((x,i)=>i===index?{...x,name:e.target.value}:x))}/></td><td><input aria-label="Specification value" placeholder="Value / unit" value={spec.value||''} onChange={e=>set('specifications',data.specifications.map((x,i)=>i===index?{...x,value:e.target.value}:x))}/></td><td><button type="button" aria-label="Remove specification" onClick={()=>set('specifications',data.specifications.filter((_,i)=>i!==index))}><Trash2/></button></td></tr>)}</tbody></table></div>
                <div className="industry-builder-head"><div><span>INDUSTRIES WE SERVED</span><h3>Industry cards</h3></div><button type="button" className="btn secondary" onClick={addIndustry}><Plus/> Add industry</button></div>
                <div className="builder-form industries-heading-fields"><label><span>Section heading</span><input value={data.industriesHeading || ""} onChange={(event)=>set("industriesHeading",event.target.value)}/></label><label><span>Short description</span><input value={data.industriesDescription || ""} onChange={(event)=>set("industriesDescription",event.target.value)}/></label></div>
                <div className="industry-editor-grid">{(data.industryCards || []).map((industry,index)=><article key={index}><label className="industry-image-upload">{industry.image?<img src={industry.image} alt={industry.imageAlt || industry.title || "Industry"} title={industry.imageTitle || industry.title || "Industry"}/>:<><Upload/><span>Add image</span></>}<input type="file" accept="image/*" onChange={(event)=>uploadIndustryImage(event,index)}/></label><label><span>Industry title</span><input value={industry.title || ""} onChange={(event)=>updateIndustry(index,"title",event.target.value)}/></label><label><span>Industry description</span><textarea rows="4" value={industry.description || ""} onChange={event=>updateIndustry(index,"description",event.target.value)}/></label><label><span>Image alt text</span><input value={industry.imageAlt || ""} onChange={(event)=>updateIndustry(index,"imageAlt",event.target.value)} placeholder="Describe the image"/></label><label><span>Image title</span><input value={industry.imageTitle || ""} onChange={(event)=>updateIndustry(index,"imageTitle",event.target.value)} placeholder="Image hover title"/></label><button type="button" className="industry-remove" onClick={()=>set("industryCards",data.industryCards.filter((_,itemIndex)=>itemIndex!==index))}><Trash2/> Remove</button></article>)}</div>
                <div className="industry-builder-head"><div><span>PRODUCT RANGE</span><h3>Sub-product cards</h3><p>These cards will appear on the frontend page below the Industries We Serve section.</p></div><button type="button" className="btn secondary" onClick={addRangeCard}><Plus/> Add product card</button></div>
                <div className="builder-form range-heading-fields"><label><span>Section heading</span><input value={data.rangeHeading || ""} onChange={(event)=>set("rangeHeading",event.target.value)}/></label><label><span>Short description</span><input value={data.rangeDescription || ""} onChange={(event)=>set("rangeDescription",event.target.value)}/></label></div>
                <div className="range-card-editor-grid">{(data.rangeCards || []).map((card,index)=><article className="range-folder-card" key={card._id || index}><label className="range-folder-media"><span>PRODUCT</span>{card.image?<img src={card.image} alt={card.imageAlt || card.title} title={card.imageTitle || card.title}/>:<div><Upload/><b>Add product image</b></div>}<input type="file" accept="image/*" onChange={(event)=>uploadRangeImage(event,index)}/></label><div className="range-folder-copy"><h4>{card.title || "New product"}</h4><p>{card.description || "Add a short product description."}</p><div className="range-folder-actions"><button type="button">View Details</button><button type="button">Enquiry</button></div></div><details className="range-card-fields"><summary><Pencil/> Edit card content</summary><div><label><span>Product title</span><input value={card.title || ""} onChange={(event)=>updateRangeCard(index,"title",event.target.value)}/></label><label><span>URL slug</span><input value={card.slug || ""} onChange={(event)=>updateRangeCard(index,"slug",event.target.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))}/></label><label><span>Product group</span><input value={card.group || ""} onChange={(event)=>updateRangeCard(index,"group",event.target.value)}/></label><label><span>Image alt text</span><input value={card.imageAlt || ""} onChange={(event)=>updateRangeCard(index,"imageAlt",event.target.value)}/></label><label><span>Image title</span><input value={card.imageTitle || ""} onChange={(event)=>updateRangeCard(index,"imageTitle",event.target.value)}/></label><label className="full"><span>Short description</span><textarea rows="3" value={card.description || ""} onChange={(event)=>updateRangeCard(index,"description",event.target.value)}/></label><label className="range-card-active full"><input type="checkbox" checked={card.active !== false} onChange={(event)=>updateRangeCard(index,"active",event.target.checked)}/> Show on frontend</label>{!card._id&&<button type="button" className="industry-remove" onClick={()=>set("rangeCards",data.rangeCards.filter((_,itemIndex)=>itemIndex!==index))}><Trash2/> Remove</button>}</div></details></article>)}</div>
                <div className="industry-builder-head"><div><span>WHY CHOOSE US</span><h3>Why choose section</h3></div><button type="button" className="btn secondary" onClick={addWhyCard}><Plus/> Add point</button></div>
                <div className="builder-form why-choose-heading-fields"><label><span>Small heading</span><input value={data.whyChooseEyebrow || ""} onChange={(event)=>set("whyChooseEyebrow",event.target.value)} placeholder="WHY CHOOSE US"/></label><label><span>Section heading</span><input value={data.whyChooseHeading || ""} onChange={(event)=>set("whyChooseHeading",event.target.value)}/></label><label className="full"><span>Short description</span><input value={data.whyChooseDescription || ""} onChange={(event)=>set("whyChooseDescription",event.target.value)}/></label></div>
                <div className="why-editor-layout"><div className="why-editor-points"><div className="industry-editor-grid why-card-editor-grid">{(data.whyChooseCards || []).map((card,index)=><article key={index}><label><span>Point title</span><input value={card.title || ""} onChange={(event)=>updateWhyCard(index,"title",event.target.value)}/></label><label><span>Point description</span><textarea rows="3" value={card.description || ""} onChange={(event)=>updateWhyCard(index,"description",event.target.value)}/></label><button type="button" className="industry-remove" onClick={()=>set("whyChooseCards",data.whyChooseCards.filter((_,itemIndex)=>itemIndex!==index))}><Trash2/> Remove</button></article>)}</div></div><div className="why-editor-image"><label className="industry-image-upload why-main-image-upload">{data.whyChooseImage?<img src={data.whyChooseImage} alt={data.whyChooseImageAlt || data.whyChooseHeading} title={data.whyChooseImageTitle || data.whyChooseHeading}/>:<><Upload/><span>Upload one Why Choose image</span></>}<input type="file" accept="image/*" onChange={uploadWhyImage}/></label><label><span>Image alt text</span><input value={data.whyChooseImageAlt || ""} onChange={(event)=>set("whyChooseImageAlt",event.target.value)}/></label><label><span>Image title</span><input value={data.whyChooseImageTitle || ""} onChange={(event)=>set("whyChooseImageTitle",event.target.value)}/></label></div></div>
                <div className="category-flow-preview"><span>1. PAGE BANNER</span><b>→</b><span>2. IMAGE + CONTENT</span><b>→</b><span>3. TECHNICAL SPECIFICATIONS</span><b>&rarr;</b><span>4. INDUSTRIES</span><b>→</b><span>5. PRODUCT RANGE</span><b>→</b><span>6. WHY CHOOSE THIS MACHINE</span></div>
              </section>}
            </>
          ) : (
            <div className="builder-seo">
              <div className="seo-explain">
                <Globe2 />
                <div>
                  <b>Search appearance</b>
                  <p>
                    These fields control how this page can appear in Google
                    search results.
                  </p>
                </div>
              </div>
              <label>
                <span>Focus keyword</span>
                <input value={data.focusKeyword || ""} onChange={(e) => set("focusKeyword", e.target.value)} placeholder="Primary search phrase" />
              </label>
              <label>
                <span>SEO title</span>
                <input
                  maxLength="60"
                  value={data.seoTitle || ""}
                  onChange={(e) => set("seoTitle", e.target.value)}
                />
                <small>Recommended: 45–60 characters</small>
              </label>
              <label>
                <span>Meta description</span>
                <textarea
                  rows="4"
                  maxLength="160"
                  value={data.metaDescription || ""}
                  onChange={(e) => set("metaDescription", e.target.value)}
                />
                <small>Recommended: 120–160 characters</small>
              </label>
              <label>
                <span>Related keywords</span>
                <input value={data.seoKeywords || ""} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="keyword one, keyword two" />
              </label>
              <label>
                <span>Canonical URL</span>
                <input
                  value={data.canonical || ""}
                  onChange={(e) => set("canonical", e.target.value)}
                  placeholder="https://domain.com/category/product/"
                />
              </label>
              <label><span>Link following</span><select value={data.follow === false ? "nofollow" : "follow"} onChange={(e) => set("follow", e.target.value === "follow")}><option value="follow">Follow links</option><option value="nofollow">NoFollow links</option></select></label>
              <label><span>Schema type</span><select value={data.schemaType || "CollectionPage"} onChange={(e) => set("schemaType", e.target.value)}><option value="CollectionPage">Collection Page</option><option value="WebPage">Web Page</option><option value="ItemList">Item List</option></select></label>
              <label><span>Open Graph title</span><input maxLength="60" value={data.ogTitle || ""} onChange={(e) => set("ogTitle", e.target.value)} /></label>
              <label><span>Open Graph description</span><textarea rows="3" maxLength="160" value={data.ogDescription || ""} onChange={(e) => set("ogDescription", e.target.value)} /></label>
              <label>
                <span>Search indexing</span>
                <select
                  value={data.indexing || "index"}
                  onChange={(e) => set("indexing", e.target.value)}
                >
                  <option value="index">Index — show in search</option>
                  <option value="noindex">NoIndex — hide from search</option>
                </select>
              </label>
              <label className="builder-upload seo-upload">
                <Upload />
                <b>Upload social/OG image</b>
                <small>Recommended 1200 × 630 px</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => upload(e, "ogImage")}
                />
              </label>
              <div className="serp-card">
                <small>GOOGLE PREVIEW</small>
                <a>{data.seoTitle}</a>
                <em>{data.canonical || "https://your-domain.com/page/"}</em>
                <p>{data.metaDescription}</p>
              </div>
            </div>
          )}
          <div className="builder-footer">
            <p>Edit the fields, then publish. Changes will appear on the frontend.</p>
            <div className="builder-footer-actions">
              <button className="btn secondary" onClick={onPreview}><Eye /> Preview frontend</button>
              <button type="button" className="btn primary" onClick={save} disabled={saving}><Save /> {saving ? "Publishing..." : "Save & Publish"}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
