import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, FileText, Search, Trash2, X } from "lucide-react";
import { api } from "./api.js";

export default function ProductContentLibrary({ website, notify = () => {}, onEdit = () => {} }) {
  const websiteId = website?._id || website?.id, headers = { "x-website-id": websiteId };
  const [products, setProducts] = useState([]), [query, setQuery] = useState(""), [viewing, setViewing] = useState(null);
  const load = () => api("/api/products?limit=100", { headers }).then(({ data }) => setProducts(data)).catch((e) => notify("Could not load products", e.message));
  useEffect(load, [websiteId]);
  const shown = useMemo(() => products.filter((p) => `${p.name} ${p.categoryName || ""} ${p.productGroup || ""} ${p.shortDescription || ""}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  function edit(product) { sessionStorage.setItem("mmw-edit-product-id", product._id); onEdit(product); }
  async function remove(product) {
    if (!confirm(`PERMANENTLY delete “${product.name}”? This cannot be undone.`)) return;
    if (!confirm("Final confirmation: all product content, images, specifications and SEO will be permanently deleted. Continue?")) return;
    try { await api(`/api/products/${product._id}?permanent=true`, { method: "DELETE", headers }); notify("Product permanently deleted", product.name); setViewing(null); load(); }
    catch (e) { notify("Could not delete product", e.message); }
  }
  return <div className="website-page animate-in">
    <div className="form-page-head"><div><p className="eyebrow">PRODUCT CONTENT</p><h1>Product Content Library</h1><p>View, edit and permanently delete complete product content saved from Add Product.</p></div></div>
    <section className="panel image-library-panel"><div className="table-tools"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product content..." /></label></div><div className="product-content-grid">{shown.map((product) => <article key={product._id}><div className="product-content-cover">{product.featuredImage?.url ? <img src={product.featuredImage.url} alt={product.featuredImage.alt || product.name} /> : <FileText />}</div><div className="product-content-copy"><span className={`status ${product.status}`}>{product.status}</span><h3>{product.name}</h3><p>{product.shortDescription || "No short description"}</p><small>{product.categoryName || "No category"} · {(product.gallery || []).length + (product.featuredImage?.url ? 1 : 0)} images · {(product.specifications || []).length} specifications</small></div><footer><button onClick={() => setViewing(product)}><Eye /> View</button><button onClick={() => edit(product)}><Edit3 /> Edit</button><button className="danger" onClick={() => remove(product)}><Trash2 /> Delete</button></footer></article>)}{!shown.length && <p className="empty-state">No product content saved yet.</p>}</div></section>
    {viewing && <div className="modal-backdrop open"><div className="modal modal-pop product-content-modal"><button className="modal-close" onClick={() => setViewing(null)}><X /></button><span className={`status ${viewing.status}`}>{viewing.status}</span><h2>{viewing.name}</h2>{viewing.featuredImage?.url && <img src={viewing.featuredImage.url} alt={viewing.featuredImage.alt || viewing.name} />}<p><b>Category:</b> {viewing.categoryName || "—"}</p><p><b>Group:</b> {viewing.productGroup || "—"}</p><p><b>Price:</b> {viewing.priceLabel || "Price on request"}</p><p>{viewing.shortDescription}</p><div className="content-modal-stats"><span>{(viewing.gallery || []).length} Gallery images</span><span>{(viewing.features || []).length} Features</span><span>{(viewing.specifications || []).length} Specifications</span><span>{viewing.seo?.title ? "SEO added" : "SEO pending"}</span></div><div className="modal-actions"><button className="btn secondary" onClick={() => setViewing(null)}>Close</button><button className="btn primary" onClick={() => edit(viewing)}><Edit3 /> Edit complete product</button></div></div></div>}
  </div>;
}
