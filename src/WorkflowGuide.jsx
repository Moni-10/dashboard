import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Package,
  Users,
} from "lucide-react";
const steps = [
  [
    "Login",
    "Super Admin/Admin logs in securely with username and password.",
    LockKeyhole,
  ],
  [
    "Central Dashboard",
    "Manage Websites and Users & Roles in the All Websites context.",
    LayoutDashboard,
  ],
  [
    "Website Add & Select",
    "Add a website and select it from the sidebar switcher. Selection changes the entire CMS context.",
    Globe2,
  ],
  [
    "Website Workspace",
    "Products, Categories, Pages, Blogs, Inquiries, Media, SEO and Settings are for the selected website.",
    Package,
  ],
  [
    "Category Structure",
    "Parent blank = Main Category. Parent selected = Sub Category.",
    Users,
  ],
  [
    "Add Product",
    "Fill in basic information, images, specifications, applications, SEO and publish settings.",
    Package,
  ],
  [
    "MongoDB Save",
    "Each record is saved with a websiteId; website data will not be mixed.",
    Database,
  ],
  [
    "Public Frontend",
    "Published records are displayed on the selected domain through Product Listing and Product Detail APIs.",
    Globe2,
  ],
];
export default function WorkflowGuide() {
  return (
    <div className="workflow-guide animate-in">
      <div className="form-page-head">
        <div>
          <p className="eyebrow">MULTI-WEBSITE CMS</p>
          <h1>From Dashboard to Frontend</h1>
          <p>Complete map of the admin workflow and public website publishing.</p>
        </div>
      </div>
      <div className="workflow-steps">
        {steps.map(([title, text, Icon], i) => (
          <article key={title}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <i>
              <Icon />
            </i>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            {i < steps.length - 1 && <ArrowRight />}
          </article>
        ))}
      </div>
      <section className="workflow-api panel">
        <div>
          <Database />
          <h2>Frontend API flow</h2>
        </div>
        <code>GET /api/public/products?domain=selected-domain.com</code>
        <ArrowRight />
        <code>
          GET /api/public/products/product-slug?domain=selected-domain.com
        </code>
      </section>
      <section className="workflow-content panel">
        <h2>Product Detail Page Content</h2>
        <div>
          {[
            "Page banner",
            "Name, price, category and description",
            "Main and gallery images",
            "Key features",
            "Manufactured products",
            "Technical specifications",
            "Machine video",
            "Brochure PDF",
            "SEO metadata",
          ].map((x) => (
            <span key={x}>
              <CheckCircle2 />
              {x}
            </span>
          ))}
        </div>
      </section>
      <div className="tenant-banner">
        <Globe2 />
        <div>
          <b>Publishing rule</b>
          <span>
            Draft content will not appear on the public website. Only Published
            records are returned on the selected website domain.
          </span>
        </div>
      </div>
    </div>
  );
}
