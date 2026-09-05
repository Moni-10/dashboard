import React from "react";
import { ArrowRight, CheckCircle2, ExternalLink, FileText, Globe2, Package, Workflow } from "lucide-react";

const PageCard = ({ icon: Icon, title, route, source, children }) => <article className="integration-card"><span><Icon /></span><div><small>{source}</small><h3>{title}</h3><code>{route}</code><p>{children}</p></div></article>;
export default function FrontendIntegration({ website, notify = () => {} }) {
  const domain = website.domain, origin = location.origin;
  const urls = {
    products: `${origin}/api/public/products?domain=${domain}`,
    categories: `${origin}/api/public/categories?domain=${domain}`,
    product: `${origin}/api/public/products/product-slug?domain=${domain}`,
    blogs: `${origin}/api/public/content?type=blog&domain=${domain}`,
    blog: `${origin}/api/public/content/blog/blog-slug?domain=${domain}`,
  };
  const copy = (value) => navigator.clipboard.writeText(value).then(() => notify("Copied", value));
  return <div className="website-page animate-in"><div className="form-page-head"><div><p className="eyebrow">DASHBOARD → PUBLIC WEBSITE</p><h1>Frontend Integration</h1><p>These pages and APIs connect published CMS content to {website.name}.</p></div><button className="btn primary" onClick={() => window.open("/?preview=", "_blank")}><ExternalLink /> Open preview</button></div>
    <div className="tenant-banner"><Globe2 /><div><b>Active domain: {domain}</b><span>Every request sends this domain. The API resolves its websiteId and returns only this website's published records.</span></div></div>
    <section className="integration-flow"><PageCard icon={Globe2} title="Main Catalogue Page" route="/products" source="Categories API">Main category cards; click opens a category listing.</PageCard><ArrowRight /><PageCard icon={Workflow} title="Category Page" route="/products/category-slug" source="Categories + Products API">Published product cards for the selected category.</PageCard><ArrowRight /><PageCard icon={Package} title="Product Detail Page" route="/products/product-slug" source="Single Product API">Only selected product: gallery, price, description, features, specifications, video and PDF.</PageCard></section>
    <section className="integration-flow blog"><PageCard icon={FileText} title="Blog Listing Page" route="/blog" source="Blogs API">All published blog cards for this website.</PageCard><ArrowRight /><PageCard icon={FileText} title="Blog Detail Page" route="/blog/blog-slug" source="Single Blog API">Selected blog content, featured image and SEO metadata.</PageCard></section>
    <section className="form-card"><div className="form-card-title"><CheckCircle2 /><div><h3>API endpoints for frontend developer</h3><p>Click any endpoint to copy it.</p></div></div><div className="integration-endpoints">{Object.entries(urls).map(([name, url]) => <button key={name} onClick={() => copy(url)}><b>{name}</b><code>{url}</code></button>)}</div></section>
    <section className="form-card"><div className="form-card-title"><Workflow /><div><h3>How content appears</h3><p>Same flow for React, PHP, Next.js or any frontend.</p></div></div><ol className="integration-steps">    <li>Select a website from the dashboard website switcher.</li><li>Add categories and products/blogs.</li><li>Draft content does not appear in the public API.</li><li>Once the status is Published, the record appears in the frontend API response.</li><li>The frontend slug route calls the product/blog detail API.</li><li>Render SEO title, description, canonical and robots values in the page head.</li></ol></section>
  </div>;
}
