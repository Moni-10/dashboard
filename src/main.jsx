import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Globe2,
  Package,
  Layers3,
  Files,
  TrendingUp,
  Images,
  Mail,
  Users,
  Settings,
  Search,
  Upload,
  Plus,
  ExternalLink,
  Bell,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Check,
  Activity,
  FileText,
  FilePlus2,
  UserPlus,
  HelpCircle,
  Menu,
  X,
  Factory,
  MoreHorizontal,
  LogOut,
  Eye,
  Save,
  ImagePlus,
  Video,
  Workflow,
  Edit3,
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  CalendarDays,
  CloudSun,
  MapPin,
  Droplets,
  Wind,
} from "lucide-react";
import "../styles.css";
import ProductForm from "./ProductForm.jsx";
import WebsiteManager, { websites } from "./WebsiteManager.jsx";
import Login from "./Login.jsx";
import PublicCatalog, { ProductDetail } from "./PublicCatalog.jsx";
import CatalogAdmin from "./CatalogAdmin.jsx";
import { catalogGroups } from "./catalogData.js";
import CreatePage from "./CreatePage.jsx";
import CategoryManager from "./CategoryManager.jsx";
import WorkflowGuide from "./WorkflowGuide.jsx";
import { api } from "./api.js";
import WorkspaceContent from "./WorkspaceContent.jsx";
import WebsiteSettings from "./WebsiteSettingsAdvanced.jsx";
import UserManager from "./UserManager.jsx";

const seed = catalogGroups.flatMap((group) =>
  group.products.map((product) => [
    product.name,
    group.title,
    85,
    "published",
    "Catalogue data",
  ]),
);
const productRow = (product) => [
  product.name,
  product.productGroup || product.categoryName || "Uncategorized",
  product.seo?.title ? 90 : 60,
  product.status,
  product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "Just now",
  product._id,
  product.slug,
  product,
];
const centralSections = [
  { label: "CENTRAL", items: [["Dashboard", LayoutDashboard],["Websites", Globe2],["Users & Roles", Users]] },
];
const websiteSections = [
  { label: "WEBSITE WORKSPACE", items: [["Dashboard", LayoutDashboard]] },
  { label: "CATALOGUE FLOW", items: [["Product Structure", Layers3],["Main Products", LayoutDashboard],["Sub-product Pages", Files],["Product Details", Package]] },
  { label: "CONTENT MANAGEMENT", items: [["Products", Package],["Pages", Files],["Settings", Settings]] },
  { label: "PUBLIC WEBSITE", items: [["Website Preview", ExternalLink]] },
];

const productEditorSections = {
  "Page Banner": ["content", "page-banner"],
  "Product Detail Content": ["content", "basic-information"],
  "Key Features": ["content", "key-features"],
  "Technical Specifications": ["content", "technical-specifications"],
  "Manufactured Products": ["media", "manufactured-products"],
  "Frequently Asked Questions": ["media", "product-faq"],
};

function Toast({ data }) {
  const type = data?.type || (/delete|remove|failed|could not/i.test(data?.title || "") ? "danger" : /edit|update/i.test(data?.title || "") ? "info" : "success");
  return (
    <div className={`toast toast-${type} ${data ? "show" : ""}`} role="status" aria-live="polite">
      <span>
        {type === "danger" ? <AlertTriangle /> : type === "info" ? <Edit3 /> : <CheckCircle2 />}
      </span>
      <div>
        <b>{data?.title}</b>
        <small>{data?.message}</small>
      </div>
    </div>
  );
}
function PublicProductPage() {
  let product = {
    name: "Industrial Printing Machine",
    description:
      "<h2>High-performance machinery</h2><p>Product content entered in the CMS will appear here.</p>",
  };
  try {
    product = {
      ...product,
      ...JSON.parse(localStorage.getItem("mmw-product-preview") || "{}"),
    };
  } catch {}
  return <ProductDetail product={product} website={product.website || {}} />;
}
function Sidebar({
  page,
  navigate,
  open,
  setOpen,
  website,
  setWebsite,
  notify,
  sites = [],
}) {
  const [sitesOpen, setSitesOpen] = useState(false);
  const availableSites = [websites[0], ...sites];
  const visibleSections = website.id === "all" ? centralSections : websiteSections;
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <img src="/mmw-logo.png" alt="Mohindra Mechanical Works" />
      </div>
      <button
        className="sidebar-add-website"
        onClick={() => {
          sessionStorage.setItem("mmw-open-add-website", "1");
          navigate("Websites");
          setOpen(false);
        }}
      >
        <Plus /> <span>Add New Website</span>
      </button>
      <nav className="nav">
        {visibleSections.map((s, i) => (
          <React.Fragment key={i}>
            {s.label && <p>{s.label}</p>}
            {s.items.map(([name, Icon, count]) => (
              <button
                key={name}
                className={`nav-item ${page === name ? "active" : ""} ${["Main Products", "Sub-product Pages", "Product Details"].includes(name) ? "catalog-flow-item" : ""}`}
                data-step={name === "Main Products" ? "1" : name === "Sub-product Pages" ? "2" : name === "Product Details" ? "3" : undefined}
                onClick={() => {
                  const editorTarget = productEditorSections[name];
                  if (editorTarget) {
                    sessionStorage.setItem("mmw-product-tab", editorTarget[0]);
                    sessionStorage.setItem("mmw-product-section", editorTarget[1]);
                    window.dispatchEvent(
                      new CustomEvent("mmw-open-product-section", {
                        detail: { tab: editorTarget[0], section: editorTarget[1] },
                      }),
                    );
                    navigate("Product Details");
                  } else if (name === "Product Categories" || name === "Sub Categories") navigate("Categories");
                  else navigate(name);
                  setOpen(false);
                }}
              >
                <Icon />
                <span>{name}</span>
                {count && <b className="count">{count}</b>}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}
function Stat({ Icon, label, onClick, value = "0", note = "Live workspace data", progress = 0 }) {
  return (
    <button className="stat-card animate-in" onClick={onClick}>
      <div className="stat-head">
        <span className="stat-icon green">
          <Icon />
        </span>
        <em className="neutral">Your data</em>
      </div>
      <h2>{value}</h2>
      <p>{label}</p>
      <div className="progress greenbar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <small>{note}</small>
    </button>
  );
}
function Rows({ rows, edit, preview, remove }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>CATEGORY</th>
            <th>SEO</th>
            <th>STATUS</th>
            <th>UPDATED</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p[0]}>
              <td>
                <div className="product-cell">
                  <span className="product-thumb">
                    <Factory />
                  </span>
                  <p>
                    <b>{p[0]}</b>
                    <small>/{p[0].toLowerCase().replaceAll(" ", "-")}</small>
                  </p>
                </div>
              </td>
              <td>
                <span className="category-tag">{p[1]}</span>
              </td>
              <td>
                <span className={`seo-score ${p[2] < 80 ? "mid" : ""}`}>
                  <i />
                  {p[2]}/100
                </span>
              </td>
              <td>
                <span className={`status ${p[3]}`}>{p[3]}</span>
              </td>
              <td>{p[4]}</td>
              <td>
                <div className="row-actions">
                  <button className="preview" title="Preview product" aria-label={`Preview ${p[0]}`} onClick={() => preview(p)}>
                    <Eye />
                  </button>
                  <button className="edit" title="Edit product" aria-label={`Edit ${p[0]}`} onClick={() => edit(p)}>
                    <Edit3 />
                  </button>
                  <button className="delete" title="Delete product" aria-label={`Delete ${p[0]}`} onClick={() => remove(p)}>
                    <Trash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="empty-state">No matching products found.</p>
      )}
    </div>
  );
}
function Products({
  items,
  website,
  navigate,
  openImport,
  notify,
  onDeleted,
  compact = false,
}) {
  const [q, setQ] = useState(""),
    [filter, setFilter] = useState("all"),
    rows = useMemo(
      () =>
        items.filter(
          (p) =>
            (filter === "all" || p[3] === filter) &&
            p[0].toLowerCase().includes(q.toLowerCase()),
        ),
      [q, filter, items],
    );
  return (
    <article
      className={`panel products-panel ${compact ? "animate-in delayed" : "full-products"}`}
    >
      {compact ? (
        <div className="panel-head">
          <div>
            <h3>Recent products</h3>
            <p>Latest additions and updates</p>
          </div>
          <button className="link-btn" onClick={() => navigate("Products")}>
            View all <ArrowRight />
          </button>
        </div>
      ) : (
        <div className="products-title">
          <div>
            <p className="eyebrow">{website.name.toUpperCase()}</p>
            <h1>Products</h1>
          </div>
          <div className="form-head-actions">
            <button className="btn secondary" onClick={openImport}>
              <Upload /> Bulk import
            </button>
            <button
              className="btn primary"
              onClick={() => navigate("Product Details")}
            >
              <Plus /> Add product
            </button>
          </div>
        </div>
      )}
      <div className="table-tools">
        <label>
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
          />
        </label>
        <div className="chips">
          {["all", "published", "draft"].map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={`chip ${filter === x ? "active" : ""}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <Rows
        rows={rows}
        edit={(product) => { sessionStorage.setItem("mmw-edit-product", JSON.stringify(product[7] || {})); navigate("Product Details"); notify("Edit product opened", product[0]); }}
        preview={(product) => { sessionStorage.setItem("mmw-preview-product", JSON.stringify(product[7] || {})); navigate("Website Preview"); notify("Product preview opened", product[0]); }}
        remove={async (product) => {
          if (!window.confirm(`Delete “${product[0]}”? This product will be permanently removed.`)) return;
          try {
            let productId = product[5] || product[7]?._id;
            if (!productId) {
              const { data } = await api("/api/products", { headers: { "x-website-id": website._id || website.id } });
              productId = data.find((item) => item.slug === product[6] || item.name === product[0])?._id;
            }
            if (!productId) throw new Error("Product record was not found. Refresh the product list and try again.");
            await api(`/api/products/${productId}?permanent=true`, { method: "DELETE", headers: { "x-website-id": website._id || website.id } });
            onDeleted?.(productId);
            notify("Product deleted", `${product[0]} permanently removed.`, "danger");
          } catch (error) { notify("Could not delete product", error.message, "danger"); }
        }}
      />
    </article>
  );
}
function Seo({ navigate }) {
  return (
    <article className="panel seo-panel animate-in delayed">
      <div className="panel-head">
        <div>
          <h3>SEO health</h3>
          <p>Across published pages</p>
        </div>
        <TrendingUp />
      </div>
      <div className="score-wrap">
        <div className="score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="49" />
            <circle className="ring-value" cx="60" cy="60" r="49" />
          </svg>
          <strong>
            92<small>/100</small>
          </strong>
        </div>
        <div>
          <b>Excellent</b>
          <p>Your SEO is performing well.</p>
          <em>↑ 4.6%</em>
        </div>
      </div>
      <button className="full-btn" onClick={() => navigate("Product Details")}>
        Add product SEO <ArrowRight />
      </button>
    </article>
  );
}

function DateWeatherWidget() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState({ temp: "--", wind: "--", humidity: "--", label: "Weather loading", place: "New Delhi" });
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 60000);
    const loadWeather = async (latitude = 28.6139, longitude = 77.209, place = "New Delhi") => {
      try {
        const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
        if (!response.ok) throw new Error("Weather unavailable");
        const payload = await response.json();
        const current = payload.data;
        const labels = { 0:"Clear sky",1:"Mostly clear",2:"Partly cloudy",3:"Cloudy",45:"Foggy",48:"Foggy",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Rain showers",81:"Rain showers",82:"Heavy showers",95:"Thunderstorm" };
        setWeather({ temp: Math.round(current.temperature_2m), wind: Math.round(current.wind_speed_10m), humidity: current.relative_humidity_2m, label: labels[current.weather_code] || "Current weather", place });
      } catch {
        setWeather((value) => ({ ...value, label: "Weather unavailable" }));
      }
    };
    loadWeather();
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadWeather(coords.latitude, coords.longitude, "Current location"),
      () => {},
      { timeout: 5000, maximumAge: 900000 },
    );
    return () => clearInterval(clock);
  }, []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
  return <section className="dashboard-utility-grid">
    <article className="date-widget">
      <header><span><CalendarDays/> TODAY</span><strong>{now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</strong></header>
      <div className="date-summary"><b>{now.getDate()}</b><div><h3>{now.toLocaleDateString("en-IN", { weekday:"long" })}</h3><p>{now.toLocaleDateString("en-IN", { month:"long", year:"numeric" })}</p></div></div>
      <div className="mini-calendar"><div className="calendar-week">{["S","M","T","W","T","F","S"].map((day,index)=><span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-days">{calendarDays.map((day,index)=><i key={index} className={day===now.getDate()?"today":""}>{day}</i>)}</div></div>
    </article>
    <article className="weather-widget">
      <header><span><CloudSun/> LIVE WEATHER</span><em><MapPin/>{weather.place}</em></header>
      <div className="weather-main"><CloudSun/><strong>{weather.temp}<sup>°C</sup></strong><div><h3>{weather.label}</h3><p>{now.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"short" })}</p></div></div>
      <div className="weather-meta"><span><Droplets/><b>{weather.humidity}%</b><small>Humidity</small></span><span><Wind/><b>{weather.wind} km/h</b><small>Wind speed</small></span></div>
    </article>
  </section>;
}
function Quick({ navigate, openImport }) {
  const a = [
    [Package, "Add product", () => navigate("Product Details")],
    [Upload, "Bulk import", openImport],
    [FilePlus2, "Create page", () => navigate("Pages")],
    [UserPlus, "Invite user", () => navigate("Users & Roles")],
  ];
  return (
    <section className="panel quick-panel">
      <div className="panel-head">
        <div>
          <h3>Quick actions</h3>
          <p>Every action is testable</p>
        </div>
      </div>
      <div className="quick-actions">
        {a.map(([Icon, title, go]) => (
          <button key={title} onClick={go}>
            <span className="green">
              <Icon />
            </span>
            <b>{title}</b>
            <small>Open demo workflow</small>
            <ArrowRight />
          </button>
        ))}
      </div>
    </section>
  );
}
function ImportModal({ close, notify }) {
  const [file, setFile] = useState();
  function sample() {
    const u = URL.createObjectURL(
        new Blob(["name,category,status\nDemo Machine,Printing,draft"], {
          type: "text/csv",
        }),
      ),
      a = document.createElement("a");
    a.href = u;
    a.download = "product-import-sample.csv";
    a.click();
    URL.revokeObjectURL(u);
    notify("Sample downloaded", "CSV template saved.");
  }
  return (
    <div
      className="modal-backdrop open"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal modal-pop">
        <button className="modal-close" onClick={close}>
          <X />
        </button>
        <span className="modal-icon">
          <Upload />
        </span>
        <h3>Bulk product import</h3>
        <p>Select a CSV or Excel file for validation.</p>
        <label className="dropzone">
          <Upload />
          <b>{file?.name || "Choose a file"}</b>
          <small>XLSX or CSV up to 10 MB</small>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <div className="modal-actions">
          <button className="btn secondary" onClick={sample}>
            Download sample
          </button>
          <button
            className="btn primary"
            disabled={!file}
            onClick={() => {
              notify("Import validated", `${file.name} is ready.`);
              close();
            }}
          >
            Validate
          </button>
        </div>
      </div>
    </div>
  );
}
function CatalogPageEditor({ notify }) {
  const api = `http://${location.hostname}/roto/api-page-settings.php`;
  const initial = {
    eyebrow: "OUR MACHINES",
    heading: "Industrial printing machines",
    description: "Explore precision-built printing and converting solutions.",
    banner_image: "",
    range_eyebrow: "OUR PRODUCT RANGE",
    range_heading: "Find the right machine for your application.",
    range_description:
      "Open a product to view its complete specifications and details.",
  };
  const pages = [
    ["all-products", "All Products page"],
    ["rotogravure-printing-machine", "Rotogravure Printing Machine"],
    ["mls-rotogravure-printing-machine", "MLS Rotogravure Printing Machine"],
    [
      "shafted-rotogravure-printing-machine",
      "Shafted Rotogravure Printing Machine",
    ],
    [
      "shafted-mls-rotogravure-printing-machine",
      "Shafted MLS Rotogravure Printing Machine",
    ],
    [
      "shaftless-rotogravure-printing-machine",
      "Shaftless Rotogravure Printing Machine",
    ],
    [
      "mls-shaftless-rotogravure-printing-machine",
      "MLS Shaftless Rotogravure Printing Machine",
    ],
    [
      "pharmaceutical-foil-rotogravure-printing-machine",
      "Pharmaceutical Foil Rotogravure Printing Machine",
    ],
    ["home", "Home Page"],
    ["company", "Our Company Page"],
    ["contact", "Contact Us Page"],
    ["gallery", "Gallery Page"],
    ["video", "Videos Page"],
    ["products", "Products Page"],
  ];
  const [data, setData] = useState(initial),
    [saving, setSaving] = useState(false),
    [pageKey, setPageKey] = useState("all-products");
  useEffect(() => {
    fetch(`${api}?key=${pageKey}`)
      .then((r) => r.json())
      .then((r) => r.settings && setData(r.settings))
      .catch(() => {});
  }, [pageKey]);
  const set = (key, value) => setData({ ...data, [key]: value });
  const image = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      set("banner_image", src);
    };
    reader.readAsDataURL();
  };
  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page_key: pageKey }),
      });
      if (!r.ok) throw new Error();
      notify("Page banner saved", `Banner for ${pageKey} is now live.`);
    } catch {
      notify("Could not save", "Please make sure XAMPP Apache is running.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="catalog-page-editor">
      <div className="pages-manager-head">
        <div>
          <span>WEBSITE PAGES</span>
          <h2>Dynamic page banner</h2>
          <p>
            Select a page and customize its banner heading, description, and
            image.
          </p>
        </div>
        <button className="btn primary" onClick={save}>
          <Save />
          {saving ? "Saving..." : "Save banner"}
        </button>
      </div>
      <FieldBox
        label="Select page"
        value={pageKey}
        change={setPageKey}
        options={pages}
      />
      {data.banner_image && (
        <div className="banner-preview">
          <img src={data.banner_image} alt="Banner preview" />
          <div className="banner-preview-text">
            <span>{data.eyebrow}</span>
            <h2>{data.heading}</h2>
            <p>{data.description}</p>
          </div>
        </div>
      )}
      <div className="form-grid two">
        <FieldBox
          label="Small heading"
          value={data.eyebrow}
          change={(v) => set("eyebrow", v)}
        />
        <FieldBox
          label="Main heading"
          value={data.heading}
          change={(v) => set("heading", v)}
        />
        <FieldBox
          label="Banner description"
          value={data.description}
          change={(v) => set("description", v)}
          area
        />
        <label className="catalog-banner-upload">
          <ImagePlus />
          <b>{data.banner_image ? "Banner selected" : "Choose banner image"}</b>
          <input type="file" accept="image/*" onChange={image} />
        </label>
        <FieldBox
          label="Products section label"
          value={data.range_eyebrow}
          change={(v) => set("range_eyebrow", v)}
        />
        <FieldBox
          label="Products section heading"
          value={data.range_heading}
          change={(v) => set("range_heading", v)}
        />
      </div>
    </section>
  );
}
function FieldBox({ label, value, change, area = false, options }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {options ? (
        <select value={value} onChange={(e) => change(e.target.value)}>
          {options.map(([id, name]) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
      ) : area ? (
        <textarea
          rows="3"
          value={value}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input value={value} onChange={(e) => change(e.target.value)} />
      )}
    </label>
  );
}
function Module({ page, navigate, notify }) {
  if (page === "Other Website Pages") {
    const pages = [
      {
        name: "Home",
        file: "index.php",
        description:
          "Main landing page, banners, company introduction and machine sections.",
      },
      {
        name: "Our Company",
        file: "company.php",
        description:
          "Company profile, manufacturing capabilities and business information.",
      },
      {
        name: "Contact Us",
        file: "contact.php",
        description:
          "Contact details, enquiry form, phone, email and location.",
      },
      {
        name: "Gallery",
        file: "gallery.php",
        description: "Machine and manufacturing image gallery.",
      },
      {
        name: "Videos",
        file: "video.php",
        description: "Machine demonstration and production videos.",
      },
      {
        name: "Products",
        file: "products.php",
        description: "Dynamic products published from the dashboard.",
      },
    ];
    return (
      <div className="pages-manager animate-in">
        <CatalogPageEditor notify={notify} />
        <div className="pages-manager-head">
          <div>
            <span>WEBSITE STRUCTURE</span>
            <h1>Pages</h1>
            <p>
              These are the real PHP pages inside your roto website. Open each
              page to test its current frontend.
            </p>
          </div>
          <button
            className="btn primary"
            onClick={() =>
              window.open(
                "http://127.0.0.1/roto/",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <ExternalLink />
            Open website
          </button>
        </div>
        <div className="pages-grid">
          {pages.map((item, index) => (
            <article className="page-manage-card" key={item.file}>
              <div className="page-card-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="page-card-icon">
                <FileText />
              </div>
              <h3>{item.name}</h3>
              <code>/{item.file}</code>
              <p>{item.description}</p>
              <div className="page-card-status">
                <Check />
                Active page
              </div>
              <button
                onClick={() =>
                  window.open(
                    `http://127.0.0.1/roto/${item.file}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <Eye />
                View frontend
              </button>
            </article>
          ))}
        </div>
        <div className="pages-dynamic-note">
          <Activity />
          <div>
            <b>Automatic product detail pages</b>
            <p>
              When you publish a product from the dashboard, a product.php?slug=product-name URL is automatically generated.
              There is no need to create a separate PHP file for each product.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const modules = {
    Categories: {
      text: "Create a category or product group and assign it to a product. It appears on frontend cards and detail pages.",
      features: [
        "Unlimited categories",
        "Product groups",
        "Frontend filtering",
      ],
      label: "Add category with product",
      tab: "content",
    },
  };
  const item = modules[page] || {
    text: "This feature requires backend configuration.",
    features: ["Secure records", "Role-based access", "Website-specific data"],
  };
  const act = () => {
    if (item.tab) {
      sessionStorage.setItem("mmw-product-tab", item.tab);
      navigate("Product Details");
    } else if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="module-page module-feature-page animate-in">
      <div className="module-icon">
        <Activity />
      </div>
      <h1>{page}</h1>
      <p>{item.text}</p>
      <div className="module-feature-list">
        {item.features.map((feature) => (
          <span key={feature}>
            <Check />
            {feature}
          </span>
        ))}
      </div>
      {item.label && (
        <button className="btn primary" onClick={act}>
          <Plus />
          {item.label}
        </button>
      )}
    </div>
  );
}

function App() {
  const storedToken = localStorage.getItem("mmw-auth-token") || sessionStorage.getItem("mmw-auth-token");
  const [loggedIn, setLoggedIn] = useState(Boolean(storedToken)),
    [authUser, setAuthUser] = useState(() => { try { return JSON.parse(localStorage.getItem("mmw-auth-user") || sessionStorage.getItem("mmw-auth-user") || "null"); } catch { return null; } }),
    [page, setPage] = useState("Dashboard"),
    [mobile, setMobile] = useState(false),
    [modal, setModal] = useState(false),
    [website, setWebsite] = useState(websites[0]),
    [toast, setToast] = useState(),
    [profile, setProfile] = useState(false),
    [query, setQuery] = useState(""),
    [items, setItems] = useState(seed),
    [sites, setSites] = useState([]),
    [theme, setTheme] = useState(() => localStorage.getItem("mmw-theme") || "dark");
  const notify = (title, message, type) => setToast({ title, message, type }),
    navigate = (p) => {
      setPage(p);
      setProfile(false);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    };
  useEffect(() => {
    if (!loggedIn) return;
    api("/api/websites").then(({ data }) => {
      const loaded = data.map((w) => ({ ...w, id: w._id, initial: w.name.charAt(0).toUpperCase() }));
      setSites(loaded);
      if (website.id === "all" && loaded.length) setWebsite(loaded[0]);
    }).catch((error) => notify("Could not load websites", error.message));
  }, [loggedIn]);
  useEffect(() => {
    const websiteId = website?._id || website?.id;
    if (!loggedIn || !/^[a-f\d]{24}$/i.test(websiteId || "")) { setItems([]); return; }
    api("/api/products?limit=100", { headers: { "x-website-id": websiteId } })
      .then(({ data }) => setItems(data.map(productRow)))
      .catch((error) => notify("Could not load products", error.message));
  }, [loggedIn, website?.id]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const f = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector(".top-actions input")?.focus();
      }
    };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, []);
  if (!loggedIn) return <Login onLogin={(user) => { setAuthUser(user); setLoggedIn(true); }} />;
  return (
    <div className={`app-shell theme-${theme}`}>
      <Sidebar
        {...{
          page,
          navigate,
          open: mobile,
          setOpen: setMobile,
          website,
          setWebsite,
          notify,
          sites,
        }}
      />
      {mobile && (
        <div className="mobile-overlay open" onClick={() => setMobile(false)} />
      )}
      <main className={`main theme-${theme} page-${page.toLowerCase().replace(/[^a-z0-9]+/g, "-")} ${page === "Dashboard" && theme === "dark" ? "dashboard-dark" : ""}`}>
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="crumb">
            <span>Mohindra CMS</span>
            <b>/</b>
            <strong>{page}</strong>
            <span className="tenant-pill">
              <Globe2 />
              {website.name}
            </span>
          </div>
          <div className="top-actions">
            <label className="search">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query) {
                    navigate("Products");
                    notify("Search applied", query);
                  }
                }}
                placeholder="Search anything..."
              />
              <kbd>Ctrl K</kbd>
            </label>
            <button className="icon-btn theme-toggle" title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-label="Toggle dashboard theme" onClick={() => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); localStorage.setItem("mmw-theme", next); notify(`${next === "dark" ? "Dark" : "Light"} theme enabled`, "Your theme preference has been saved.", "info"); }}>{theme === "dark" ? <Sun /> : <Moon />}</button>
            <button
              className="icon-btn"
              onClick={() =>
                notify("Website preview", "Demo frontend preview opened.")
              }
            >
              <ExternalLink />
            </button>
            <button
              className="icon-btn notification"
              onClick={() =>
                notify("Notifications", "You have 3 demo notifications.")
              }
            >
              <Bell />
              <span />
            </button>
            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfile(!profile)}>
                <span>MS</span>
                <div>
                  <b>{authUser?.name || "CMS User"}</b>
                  <small>{(authUser?.role || "user").replace("_", " ")}</small>
                </div>
                <ChevronDown />
              </button>
              {profile && (
                <div className="profile-menu">
                  <button onClick={() => { navigate("Settings"); setProfile(false); }}>
                    <Settings /> Settings
                  </button>
                  <button className="profile-signout" onClick={() => { localStorage.removeItem("mmw-auth-token");sessionStorage.removeItem("mmw-auth-token");localStorage.removeItem("mmw-auth-user");sessionStorage.removeItem("mmw-auth-user");setAuthUser(null);setLoggedIn(false); }}>
                    <LogOut /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content">
          {page === "Dashboard" ? (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">SUNDAY, 30 AUGUST</p>
                  <h1>Good morning, Mohinder.</h1>
                  <p>{website.id === "all" ? "Manage websites and users from the central dashboard." : website.name + " workspace is active."}</p>
                </div>
                <div className="primary-actions">
                  {website.id === "all" ? <>
                  <button className="btn secondary" onClick={() => navigate("Users & Roles")}><Users /> Manage users</button>
                  <button className="btn primary" onClick={() => navigate("Websites")}><Plus /> Add website</button>
                  </> : <>
                  <button
                    className="btn secondary"
                    onClick={() => setModal(true)}
                  >
                    <Upload /> Bulk import
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => navigate("Product Details")}
                  >
                    <Plus /> Add product
                  </button>
                  </>}
                </div>
              </section>
              <section className="stats-grid">
                <Stat
                  Icon={Globe2}
                  value={String(sites.length)}
                  label="Active websites"
                  note={`${sites.length} website workspace${sites.length === 1 ? "" : "s"}`}
                  progress={Math.min(100, sites.length * 20)}
                  onClick={() => navigate("Websites")}
                />
                <Stat
                  Icon={Package}
                  value={String(items.length)}
                  label="Total products"
                  note={`${items.filter((item) => item[3] === "published").length} published products`}
                  progress={items.length ? Math.round(items.filter((item) => item[3] === "published").length / items.length * 100) : 0}
                  onClick={() => navigate("Products")}
                />
                <Stat
                  Icon={TrendingUp}
                  value={items.length ? `${Math.round(items.reduce((sum,item)=>sum+(item[2] || 0),0)/items.length)}/100` : "—"}
                  label="Average SEO"
                  note={items.length ? "Calculated from saved products" : "Add products to calculate SEO"}
                  progress={items.length ? Math.round(items.reduce((sum,item)=>sum+(item[2] || 0),0)/items.length) : 0}
                  onClick={() => navigate("Product Details")}
                />
                <Stat
                  Icon={FileText}
                  value={String(items.filter((item) => item[3] === "draft").length)}
                  label="Draft products"
                  note="Products waiting to be published"
                  progress={items.length ? Math.round(items.filter((item) => item[3] === "draft").length / items.length * 100) : 0}
                  onClick={() => navigate("Products")}
                />
              </section>
              {website.id !== "all" && <section className="workspace-overview"><div><span>CONTENT STATUS</span><h2>Workspace overview</h2><p>Live summary of published and draft content.</p></div><article><b>{items.filter((item)=>item[3]==="published").length}</b><span>Published</span></article><article><b>{items.filter((item)=>item[3]==="draft").length}</b><span>Drafts</span></article><article><b>{items.filter((item)=>item[2]>=80).length}</b><span>SEO ready</span></article><button onClick={()=>navigate("Product Details")}><Plus/> Create product</button></section>}
              {website.id !== "all" && <DateWeatherWidget />}
              {website.id !== "all" && <section className="dashboard-insights">
                <article className="insight-card analytics-card"><header><div><span>PRODUCT ANALYTICS</span><h3>Publishing activity</h3></div><button onClick={()=>navigate("Products")}>View report <ArrowRight/></button></header><div className="analytics-bars">{[42,68,54,88,63,78,51].map((height,index)=><i key={index} style={{"--bar":`${height}%`}}><b></b><small>{["M","T","W","T","F","S","S"][index]}</small></i>)}</div></article>
                <article className="insight-card queue-card"><header><div><span>CONTENT QUEUE</span><h3>Recent workspace items</h3></div></header><div>{items.slice(0,4).map((item,index)=><button key={item[5] || index} onClick={()=>navigate("Products")}><i><Package/></i><span><b>{item[0]}</b><small>{item[1]}</small></span><em className={item[3]}>{item[3]}</em></button>)}{!items.length&&<p>No products added yet.</p>}</div></article>
                <article className="insight-card progress-card"><header><div><span>WORKSPACE PROGRESS</span><h3>Publishing completion</h3></div></header><div className="progress-donut" style={{"--score":`${items.length ? Math.round(items.filter((item)=>item[3]==="published").length/items.length*100) : 0}%`}}><strong>{items.length ? Math.round(items.filter((item)=>item[3]==="published").length/items.length*100) : 0}%</strong><span>Published</span></div><div className="progress-legend"><span><i></i> Published</span><span><i></i> Draft</span></div></article>
              </section>}
              {website.id !== "all" && <><section className="main-grid">
                <Products
                  items={items}
                  website={website}
                  navigate={navigate}
                  openImport={() => setModal(true)}
                  notify={notify}
                  onDeleted={(id) => setItems(items.filter((item) => item[5] !== id))}
                  compact
                />
                <aside>
                  <Seo navigate={navigate} />
                </aside>
              </section>
              <div className="bottom-grid">
                <Quick navigate={navigate} openImport={() => setModal(true)} />
              </div>
              </>}
            </>
          ) : page === "Users & Roles" ? (
            <UserManager sites={sites} notify={notify} />
          ) : page === "Products" ? (
            <Products
              items={items}
              website={website}
              navigate={navigate}
              openImport={() => setModal(true)}
              notify={notify}
              onDeleted={(id) => setItems(items.filter((item) => item[5] !== id))}
            />
          ) : page === "CMS Workflow Guide" ? (
            <WorkflowGuide />
          ) : page === "Categories" || page === "Product Structure" ? (
            <CategoryManager website={website} notify={notify} onCreateProduct={() => navigate("Product Details")} />
          ) : page === "Pages" ? (
            <WorkspaceContent mode={page} website={website} notify={notify} />
          ) : page === "Settings" ? (
            <WebsiteSettings website={website} notify={notify} onUpdated={(updated) => { setWebsite(updated); setSites(sites.map((s) => s.id === updated.id ? updated : s)); }} />
          ) : page === "Create New Page" ? (
            <CreatePage
              onBack={() => navigate("All Page Builder")}
              onSaved={() => navigate("All Page Builder")}
              notify={notify}
            />
          ) : page === "Main Products" || page === "Main Catalogue Page" ? (
            <CatalogAdmin
              key={`main-${website.id}`}
              website={website}
              mode="main"
              onCreate={() => navigate("Product Details")}
              onPreview={() => navigate("Website Preview")}
              notify={notify}
            />
          ) : page === "Sub-product Pages" || page === "Category Pages" ? (
            <CatalogAdmin
              key={`category-${website.id}`}
              website={website}
              mode="category"
              onCreate={() => navigate("Product Details")}
              onPreview={() => navigate("Website Preview")}
              notify={notify}
            />
          ) : page === "Product Details" || page === "Product Detail Pages" ? (
            <ProductForm
              website={website}
              onBack={() => navigate("Products")}
              onNotify={notify}
              onPublished={(name, saved) => {
                if (saved?._id) setItems([productRow(saved), ...items.filter((item) => item[5] !== saved._id)]);
                navigate("Products");
              }}
            />
          ) : page === "All Page Builder" ? (
            <CatalogAdmin
              key={`all-${website.id}`}
              website={website}
              mode="all"
              onCreate={() => navigate("Create New Page")}
              onPreview={() => navigate("Website Preview")}
              notify={notify}
            />
          ) : page === "Website Preview" ? (
            <PublicCatalog website={website} />
          ) : page === "Add Product" ? (
            <ProductForm
              website={website}
              onBack={() => navigate("Products")}
              onNotify={notify}
              onPublished={(name, saved) => {
                if (saved?._id) setItems([productRow(saved), ...items.filter((item) => item[5] !== saved._id)]);
                navigate("Products");
              }}
            />
          ) : page === "Websites" ? (
            <WebsiteManager
              selected={website}
              onSelect={(w) => {
                setWebsite(w);
                notify("Website selected", w.name);
              }}
              onNotify={notify}
              sites={sites}
              onSitesChange={setSites}
            />
          ) : (
            <Module page={page} navigate={navigate} notify={notify} />
          )}
        </div>
      </main>
      {modal && <ImportModal close={() => setModal(false)} notify={notify} />}
      <Toast data={toast} />
    </div>
  );
}
Module.defaultProps = {
  navigate: (target) => {
    const button = [...document.querySelectorAll("button")].find(
      (item) => item.textContent.trim() === target,
    );
    button?.click();
  },
};
const isProductPreview =
  new URLSearchParams(location.search).get("preview") === "product";
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("CMS screen error", error, info);
  }
  render() {
    if (this.state.error)
      return (
        <main className="screen-error">
          <Activity />
          <h1>Page could not open</h1>
          <p>{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              location.reload();
            }}
          >
            Reload dashboard
          </button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    {isProductPreview ? <PublicProductPage /> : <App />}
  </AppErrorBoundary>,
);
