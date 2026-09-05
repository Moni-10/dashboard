import React, { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Globe2, MoreHorizontal, Plus, Settings, X } from "lucide-react";
import { api } from "./api.js";

export const websites = [{ id: "all", name: "All Websites", domain: "Central CMS", initial: "A" }];
const normalize = (site) => ({ ...site, id: site._id || site.id, initial: site.name?.charAt(0).toUpperCase() || "W" });

export default function WebsiteManager({ selected, onSelect, onNotify = () => {}, sites: externalSites, onSitesChange = () => {} }) {
  const [adding, setAdding] = useState(false);
  const [sites, setSites] = useState(externalSites || []);
  const [form, setForm] = useState({ name: "", domain: "", type: "main", subdomain: "" });
  const finalDomain = form.type === "subdomain" && form.subdomain ? `${form.subdomain}.${form.domain}` : form.domain;
  useEffect(() => { if (externalSites) setSites(externalSites); }, [externalSites]);
  useEffect(() => { if (!externalSites) api("/api/websites").then(({ data }) => setSites(data.map(normalize))).catch((e) => onNotify("Could not load websites", e.message)); }, []);
  useEffect(() => {
    if (sessionStorage.getItem("mmw-open-add-website") === "1") {
      sessionStorage.removeItem("mmw-open-add-website");
      setAdding(true);
    }
  }, []);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function create() {
    try {
      const { data } = await api("/api/websites", { method: "POST", body: JSON.stringify({ name: form.name.trim(), domain: finalDomain.toLowerCase(), subdomain: form.type === "subdomain" ? form.subdomain : undefined, slug: finalDomain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), status: "active" }) });
      const site = normalize(data), next = [...sites, site];
      setSites(next); onSitesChange(next); onSelect(site); onNotify("Website created", `${site.name} · ${site.domain}`);
      setAdding(false); setForm({ name: "", domain: "", type: "main", subdomain: "" });
    } catch (e) { onNotify("Could not create website", e.message); }
  }
  return <div className="website-page animate-in">
    <div className="form-page-head"><div><p className="eyebrow">MULTI-WEBSITE CMS</p><h1>Websites</h1><p>Manage independent websites and their content.</p></div><button className="btn primary" onClick={() => setAdding(true)}><Plus /> Add website</button></div>
    <div className="tenant-banner"><Globe2 /><div><b>Content isolation is active</b><span>Products, categories and pages stay linked to the selected website.</span></div></div>
    {sites.length ? <div className="website-grid">{sites.map((w) => <article className={`website-card ${selected?.id === w.id ? "selected" : ""}`} key={w.id}>
      <div className="website-card-head"><span>{w.initial}</span><div><h3>{w.name}</h3><p>{w.domain}</p></div><MoreHorizontal /></div><div className="website-status"><span><CheckCircle2 /> {w.status || "active"}</span><em>Database connected</em></div>
      <div className="website-actions"><button onClick={() => onSelect(w)}><CheckCircle2 /> Select</button><button onClick={() => onNotify("Website settings", `${w.name} selected`)}><Settings /> Settings</button><button onClick={() => window.open(`https://${w.domain}`, "_blank", "noopener,noreferrer")}><ExternalLink /></button></div>
    </article>)}</div> : <div className="clean-empty"><span><Globe2 /></span><h2>No websites added</h2><p>Add the first website to start managing its content.</p><button className="btn primary" onClick={() => setAdding(true)}><Plus /> Add your first website</button></div>}
    {adding && <div className="modal-backdrop open"><div className="modal modal-pop website-modal"><button className="modal-close" onClick={() => setAdding(false)}><X /></button><span className="modal-icon"><Globe2 /></span><h3>Add new website</h3><p>This website will receive its own isolated CMS workspace.</p>
      <label className="form-field"><span>Website name *</span><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Mohindra Mechanical Works" /></label>
      <div className="domain-type"><button type="button" className={form.type === "main" ? "active" : ""} onClick={() => update("type", "main")}><Globe2 /><b>Main domain</b><small>example.com</small></button><button type="button" className={form.type === "subdomain" ? "active" : ""} onClick={() => update("type", "subdomain")}><ExternalLink /><b>Subdomain</b><small>shop.example.com</small></button></div>
      {form.type === "subdomain" && <label className="form-field"><span>Subdomain *</span><input value={form.subdomain} onChange={(e) => update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="products" /></label>}
      <label className="form-field"><span>{form.type === "main" ? "Domain" : "Parent domain"} *</span><input value={form.domain} onChange={(e) => update("domain", e.target.value.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""))} placeholder="example.com" />{finalDomain && <small>Final address: https://{finalDomain}</small>}</label>
      <div className="modal-actions"><button className="btn secondary" onClick={() => setAdding(false)}>Cancel</button><button className="btn primary" disabled={!form.name.trim() || !form.domain || (form.type === "subdomain" && !form.subdomain)} onClick={create}>Create website</button></div>
    </div></div>}
  </div>;
}
