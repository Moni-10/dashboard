import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Factory, Mail, MessageCircle, Play, Search } from "lucide-react";

const imageUrl = (media) => media?.url || "/catalog-hero.png";
const safeHtml = (html) => {
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
  doc.querySelectorAll("script,iframe,object,embed,form").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => [...node.attributes].forEach((attr) => { if (/^on/i.test(attr.name) || ["javascript:", "data:text/html"].some((x) => attr.value.toLowerCase().startsWith(x))) node.removeAttribute(attr.name); }));
  return doc.body.innerHTML;
};
export default function PublicCatalog({ website }) {
  const [categories, setCategories] = useState([]), [products, setProducts] = useState([]), [blogs, setBlogs] = useState([]), [category, setCategory] = useState(null), [product, setProduct] = useState(null), [blog, setBlog] = useState(null), [view, setView] = useState("products"), [query, setQuery] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => {
    const raw = sessionStorage.getItem("mmw-preview-product");
    if (!raw) return;
    sessionStorage.removeItem("mmw-preview-product");
    try { setProduct(JSON.parse(raw)); } catch { setProduct(null); }
  }, []);
  useEffect(() => { setLoading(true); Promise.all([
    fetch(`/api/public/categories?domain=${encodeURIComponent(website.domain)}`).then((r) => r.json()),
    fetch(`/api/public/products?domain=${encodeURIComponent(website.domain)}`).then((r) => r.json()),
    fetch(`/api/public/content?type=blog&domain=${encodeURIComponent(website.domain)}`).then((r) => r.json()),
  ]).then(([c, p, b]) => { setCategories(c.data || []); setProducts(p.data || []); setBlogs(b.data || []); }).finally(() => setLoading(false)); }, [website.domain]);
  useEffect(() => {
    const slug = sessionStorage.getItem("mmw-preview-product-slug");
    if (!slug || !products.length) return;
    const selected = products.find((item) => item.slug === slug);
    sessionStorage.removeItem("mmw-preview-product-slug");
    if (selected) openProduct(selected);
  }, [products]);
  async function openProduct(item) { const response = await fetch(`/api/public/products/${item.slug}?domain=${encodeURIComponent(website.domain)}`); const result = await response.json(); if (result.success) { const categoryName = categories.find((c) => String(c._id) === String(result.data.categoryId))?.name; setProduct({ ...result.data, categoryName }); scrollTo({ top: 0, behavior: "smooth" }); } }
  const visible = useMemo(() => products.filter((p) => (!category || String(p.categoryId) === String(category._id)) && p.name.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  if (loading) return <div className="public-catalog-loading">Loading {website.name} catalogue...</div>;
  if (product) return <ProductDetail product={product} website={website} back={() => setProduct(null)} />;
  if (blog) return <BlogDetail blog={blog} website={website} back={() => setBlog(null)} />;
  return <div className="live-catalog animate-in">
    <nav className="public-preview-nav"><b>{website.name}</b><div><button className={view === "products" ? "active" : ""} onClick={() => setView("products")}>Products</button><button className={view === "blogs" ? "active" : ""} onClick={() => setView("blogs")}>Blogs</button></div></nav>
    {view === "blogs" ? <BlogList blogs={blogs} open={setBlog} website={website} /> : <>
    <section className="live-catalog-hero" style={{ backgroundImage: `linear-gradient(100deg,rgba(8,31,60,.94),rgba(135,0,27,.72)),url("${category?.image?.url || website.seo?.ogImage || "/catalog-hero.png"}")` }}><div><nav className="public-breadcrumb"><button onClick={() => setCategory(null)}>Home</button><ArrowRight /> <button onClick={() => setCategory(null)}>Products</button>{category && <><ArrowRight /><span>{category.name}</span></>}</nav><span>{category ? "PRODUCT CATEGORY" : "INDUSTRIAL MACHINERY"}</span><h1>{category?.name || website.seo?.title || `${website.name} Product Catalogue`}</h1><p>{category?.description || website.seo?.description || "Explore precision-built machinery, specifications and application-focused solutions."}</p></div></section>
    {!category && <section className="catalog-group"><div className="catalog-title"><span>MAIN CATEGORIES</span><h2>Find the right machine</h2><p>Each category opens its own responsive sub-product listing.</p></div><div className="category-card-grid">{categories.filter((c) => !c.parentId).map((c, i) => <article className="category-public-card" key={c._id} onClick={() => setCategory(c)}><div className="category-card-image"><img src={imageUrl(c.image)} alt={c.name} /><b>{String(i + 1).padStart(2, "0")}</b></div><div><span>PRODUCT GROUP</span><h3>{c.name}</h3><p>{c.description || `${products.filter((p) => String(p.categoryId) === String(c._id)).length} products available`}</p><button>Explore category <ArrowRight /></button></div></article>)}</div></section>}
    {(category || !categories.length) && <section className="catalog-group"><div className="catalog-title"><span>SUB PRODUCTS</span><h2>{category?.name || "Published products"}</h2><p>Open any product to view only that product's saved details.</p></div><div className="catalog-grid">{visible.map((p) => <article className="public-product-card" key={p._id} onClick={() => openProduct(p)}><div className="public-card-image"><img src={imageUrl(p.featuredImage || p.hero?.image)} alt={p.name} /><span>{p.productGroup || category?.name || "Machine"}</span></div><div className="public-card-body"><small>INDUSTRIAL PRODUCT</small><h3>{p.name}</h3><p>{p.shortDescription}</p><div><button>View details <ArrowRight /></button><a href={`mailto:${website.email || "info@mohindramechanical.com"}?subject=${encodeURIComponent(p.name)}`} onClick={(e) => e.stopPropagation()}><Mail /> Enquiry</a></div></div></article>)}</div>{!visible.length && <p className="empty-state">No published products in this category.</p>}</section>}
    </>}
  </div>;
}

function BlogList({ blogs, open, website }) {
  return <><section className="live-catalog-hero blog-hero" style={{ backgroundImage: `linear-gradient(100deg,rgba(8,31,60,.94),rgba(135,0,27,.72)),url("${website.seo?.ogImage || "/catalog-hero.png"}")` }}><div><nav className="public-breadcrumb"><button>Home</button><ArrowRight /><span>Blogs</span></nav><span>INSIGHTS & KNOWLEDGE</span><h1>Latest from our engineering team</h1><p>Published articles, machine guides and industry updates.</p></div></section><section className="catalog-group"><div className="catalog-title"><span>BLOG</span><h2>Latest articles</h2></div><div className="public-blog-grid">{blogs.map((post) => <article key={post._id} onClick={() => open(post)}>{post.file?.url && post.file.mimeType?.startsWith("image/") ? <img src={post.file.url} alt={post.title} /> : <div className="blog-placeholder"><Factory /></div>}<div><small>{new Date(post.publishAt || post.updatedAt).toLocaleDateString()}</small><h3>{post.title}</h3><p>{post.excerpt}</p><button>Read article <ArrowRight /></button></div></article>)}{!blogs.length && <p className="empty-state">No published blogs yet.</p>}</div></section></>;
}
function BlogDetail({ blog, website, back }) {
  return <article className="public-blog-detail"><button className="detail-back" onClick={back}><ArrowLeft /> All blogs</button><header><span>{website.name} · INSIGHTS</span><h1>{blog.title}</h1><p>{blog.excerpt}</p></header>{blog.file?.url && blog.file.mimeType?.startsWith("image/") && <img className="blog-cover" src={blog.file.url} alt={blog.title} />}<div className="blog-content" dangerouslySetInnerHTML={{ __html: safeHtml(blog.content) }} /></article>;
}

export function ProductDetail({ product, website = {}, back }) {
  const images = [product.featuredImage, ...(product.gallery || [])].filter(x => x?.url);
  const [active, setActive] = useState(0), [video, setVideo] = useState('');
  const videos = (product.videoSection?.youtubeUrls?.length ? product.videoSection.youtubeUrls : [product.videoSection?.youtubeUrl]).filter(Boolean).slice(0,2);
  const videoId = url => { try { const u = new URL(url); return u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.split('/').pop(); } catch { return ''; } };
  const features = (product.features || []).filter(Boolean);
  return <div className="product-reference-preview">
    {back && <button className="detail-back" onClick={back}><ArrowLeft/> Back to products</button>}
    <section className="preview-banner"><img src={product.hero?.image?.url || product.featuredImage?.url || '/catalog-hero.png'} alt={product.name}/><div><span>{product.hero?.subheading || 'PRODUCT DETAILS'}</span><h1>{product.hero?.heading || product.name}</h1><p>{product.shortDescription}</p></div></section>
    <section className="preview-overview"><div className="preview-media"><div className="preview-thumbs">{images.map((img,i)=><button type="button" key={i} onClick={()=>{setActive(i);setVideo('');}} className={active===i&&!video?'active':''}><img src={img.url} alt={img.alt || product.name}/></button>)}</div><div className="preview-stage">{video?<iframe src={'https://www.youtube.com/embed/'+video} title="Machine video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<img src={images[active]?.url || '/catalog-hero.png'} alt={images[active]?.alt || product.name}/>}</div>{videos.length>0&&<div className="preview-videos">{videos.map((url,i)=><button key={i} onClick={()=>setVideo(videoId(url))}><img src={'https://img.youtube.com/vi/'+videoId(url)+'/hqdefault.jpg'} alt=""/><span>? Watch Video {i+1}</span></button>)}</div>}</div><article><h2>{product.name}</h2>{product.priceLabel&&<strong>{product.priceLabel} / Piece</strong>}<div className="preview-tags">{product.categoryName&&<span>Category <b>{product.categoryName}</b></span>}{product.subCategoryName&&<b>{product.subCategoryName}</b>}</div><small>Description</small><div dangerouslySetInnerHTML={{__html:safeHtml(product.description || product.shortDescription || '')}}/>{product.productGroup&&<div className="preview-tags">Group <b>{product.productGroup}</b></div>}</article></section>
    {features.length>0&&<section className="preview-features"><h2>Key Features</h2><div>{features.map((f,i)=>{const [title,...rest]=f.split(':');return <article key={i}><span><CheckCircle2/></span><h3>{title}</h3><p>{rest.join(':')}</p></article>;})}</div></section>}
    {product.specifications?.length>0&&<section className="preview-specs"><h2>Technical Specifications</h2><div className="technical-table-wrap"><table className="technical-table" aria-label="Technical specifications"><thead><tr><th scope="col">Specification</th><th scope="col">Value / Unit</th></tr></thead><tbody>{product.specifications.filter(x=>x.name).map((x,i)=><tr key={i}><th scope="row">{x.name}</th><td>{x.value}</td></tr>)}</tbody></table></div></section>}
    {product.showcaseCards?.some(x=>x.image?.url&&x.title&&x.active!==false)&&<section className="preview-made"><h2>Products Manufactured by This Machine</h2><div>{product.showcaseCards.filter(x=>x.image?.url&&x.title&&x.active!==false).map((x,i)=><figure key={i}><img src={x.image.url} alt={x.title}/><figcaption>{x.title}</figcaption></figure>)}</div></section>}
    {product.faqs?.some(x=>x.question)&&<section className="preview-faq"><div><h2>Frequently Asked Questions</h2>{product.faqs.filter(x=>x.question).map((x,i)=><details key={i} name="preview-faq"><summary>{x.question}</summary><p>{x.answer}</p></details>)}</div>{product.faqSection?.image?.url&&<img src={product.faqSection.image.url} alt={product.faqSection.image.alt || 'Frequently asked questions'}/>}</section>}
  </div>;
}
