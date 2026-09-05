import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import {
  Edit3,
  FolderTree,
  Layers3,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
const read = () => {
  try {
    return JSON.parse(localStorage.getItem("mmw-category-records") || "[]");
  } catch {
    return [];
  }
};
const slugify = (v) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export default function CategoryManager({ website, notify = () => {}, onCreateProduct = () => {} }) {
  const [items, setItems] = useState(read),
    [query, setQuery] = useState(""),
    [editing, setEditing] = useState(null),
    [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem("mmw-product-groups") || "[]")),
    [mainName, setMainName] = useState(""),
    [subName, setSubName] = useState(""),
    [subParent, setSubParent] = useState(""),
    [detailMain, setDetailMain] = useState(""),
    [detailSub, setDetailSub] = useState(""),
    [detailGroup, setDetailGroup] = useState(""),
    [detailProductName, setDetailProductName] = useState("");
  const empty = {
      name: "",
      slug: "",
      parentId: "",
      group: "",
      description: "",
      image: { url: "", alt: "", title: "" },
      status: "published",
      sortOrder: 0,
    },
    [form, setForm] = useState(empty);
  const websiteId = website?._id || website?.id;
  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(websiteId || "")) { setItems([]); return; }
    api("/api/categories", { headers: { "x-website-id": websiteId } })
      .then(({ data }) => { setItems(data.map((x) => ({ ...x, id: x._id }))); setGroups((current) => [...new Set([...current, ...data.map((x) => x.group).filter(Boolean)])]); })
      .catch((error) => notify("Could not load categories", error.message));
  }, [websiteId]);
  const parents = items.filter((x) => !x.parentId),
    shown = useMemo(
      () =>
        items.filter((x) => x.name.toLowerCase().includes(query.toLowerCase())),
      [items, query],
    );
  const persist = (next) => {
    setItems(next);
    localStorage.setItem("mmw-category-records", JSON.stringify(next));
    localStorage.setItem(
      "mmw-categories",
      JSON.stringify(next.map((x) => x.name)),
    );
  };
  const save = async () => {
    if (!form.name.trim())
      return notify("Category name required", "Please enter a category name.");
    const duplicate = items.find((item) =>
      item.id !== editing?.id &&
      item.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      String(item.parentId || "") === String(form.parentId || "")
    );
    if (duplicate)
      return notify("Category already exists", "A category with the same name already exists under the same parent.");
    let record = {
        ...form,
        parentId: form.parentId || null,
        slug: form.slug || slugify(form.name),
        id: editing?.id || "category-" + Date.now(),
      };
    if (!/^[a-f\d]{24}$/i.test(websiteId || "")) return notify("Select a website", "Choose a saved website before adding categories.");
    try {
      const { data } = await api("/api/categories" + (editing ? "/" + editing.id : ""), { method: editing ? "PUT" : "POST", headers: { "x-website-id": websiteId }, body: JSON.stringify(record) });
      record = { ...data, id: data._id };
      persist(editing ? items.map((x) => (x.id === editing.id ? record : x)) : [...items, record]);
    } catch (error) { return notify("Could not save category", error.message); }
    notify(editing ? "Category updated" : "Category created", record.name);
    setForm(empty);
    setEditing(null);
  };
  const remove = async (item) => {
    if (items.some((x) => x.parentId === item.id))
      return notify("Cannot delete", "Delete its sub categories first.");
    try { await api(`/api/categories/${item.id}`, { method: "DELETE", headers: { "x-website-id": websiteId } }); persist(items.filter((x) => x.id !== item.id)); notify("Category deleted", item.name); }
    catch (error) { notify("Could not delete category", error.message); }
  };
  const edit = (item) => {
    setEditing(item);
    setForm(item);
  };
  const addGroup = () => {
    const name = window.prompt("Enter new machine group name:")?.trim();
    if (!name) return;
    if (groups.some((group) => group.toLowerCase() === name.toLowerCase())) return notify("Group already exists", name);
    const next = [...groups, name];
    setGroups(next);
    localStorage.setItem("mmw-product-groups", JSON.stringify(next));
    setForm({ ...form, group: name });
    setDetailGroup(name);
    notify("Machine group created", name);
  };
  const quickCreate = async (name, parentId = null) => {
    const cleanName = name.trim();
    if (!cleanName) return notify("Name required", parentId ? "Enter sub-category name." : "Enter main category name.");
    try {
      const { data } = await api("/api/categories", { method: "POST", headers: { "x-website-id": websiteId }, body: JSON.stringify({ name: cleanName, slug: slugify(cleanName), parentId, group: detailGroup, status: "published" }) });
      persist([...items, { ...data, id: data._id }]);
      if (parentId) setSubName(""); else { setMainName(""); setSubParent(data._id); }
      notify(parentId ? "Sub-category created" : "Main category created", cleanName);
    } catch (error) { notify("Could not create category", error.message); }
  };
  const openDetailProduct = () => {
    if (!detailMain) return notify("Select main category", "Choose the main category for this detail product.");
    if (!detailProductName.trim()) return notify("Product name required", "Enter the product whose detail page you want to create.");
    const cleanGroup = detailGroup.trim();
    if (cleanGroup && !groups.some((group) => group.toLowerCase() === cleanGroup.toLowerCase())) {
      const nextGroups = [...groups, cleanGroup];
      setGroups(nextGroups);
      localStorage.setItem("mmw-product-groups", JSON.stringify(nextGroups));
    }
    const productSlug = slugify(detailProductName);
    sessionStorage.setItem("mmw-product-structure", JSON.stringify({ productName: detailProductName.trim(), productSlug, categoryId: detailMain, subCategoryId: detailSub, group: cleanGroup }));
    onCreateProduct();
  };
  const createSubCategory = () => {
    if (!subParent) return notify("Select main category", "Select a main category before adding a sub-category.");
    quickCreate(subName, subParent);
  };
  const uploadImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: { ...(form.image || {}), url: String(reader.result || "") } });
    reader.readAsDataURL(file);
  };
  return (
    <div className="category-manager animate-in">
      <div className="form-page-head">
        <div>
          <p className="eyebrow">PRODUCT STRUCTURE</p>
          <h1>Product Structure</h1>
          <p>
            Create main products, sub-products and machine groups here, then map the detail product.
          </p>
        </div>
      </div>
      <section className="structure-flow-row">
        <article><span>STEP 1</span><h3>Main Category</h3><p>Slug is automatically generated.</p><input value={mainName} onChange={(e)=>setMainName(e.target.value)} placeholder="Main product category"/><label className="structure-slug-preview"><span>Main category slug</span><input readOnly value={mainName ? `/${slugify(mainName)}` : ""} placeholder="/main-category-slug"/></label><button type="button" onClick={()=>quickCreate(mainName)}><Plus/> Add main category</button></article>
        <article><span>STEP 2</span><h3>Sub-category</h3><p>Main category ke andar sub-product.</p><select value={subParent} onChange={(e)=>setSubParent(e.target.value)}><option value="">Select main category</option>{parents.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><input value={subName} onChange={(e)=>setSubName(e.target.value)} placeholder="Sub-category name"/><label className="structure-slug-preview"><span>Sub-category slug</span><input readOnly value={subName ? `/${[items.find(item=>String(item.id)===String(subParent))?.slug,slugify(subName)].filter(Boolean).join("/")}` : ""} placeholder="/main-category/sub-category"/></label><button type="button" onClick={createSubCategory}><Plus/> Add sub-category</button></article>
        <article><span>STEP 3</span><h3>Product Detail Page</h3><p>Add which product's details will open.</p><input value={detailProductName} onChange={(e)=>setDetailProductName(e.target.value)} placeholder="Enter product name"/><select value={detailMain} onChange={(e)=>{setDetailMain(e.target.value);setDetailSub("")}}><option value="">Choose main category</option>{parents.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={detailSub} onChange={(e)=>{const subId=e.target.value;setDetailSub(subId);const selectedSub=items.find(item=>String(item.id)===String(subId));if(selectedSub?.parentId)setDetailMain(String(selectedSub.parentId))}}><option value="">Choose sub-category</option>{items.filter(item=>item.parentId&&(!detailMain||String(item.parentId)===String(detailMain))).map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><label className="structure-slug-preview"><span>Page URL / slug</span><input readOnly value={`/${[items.find(item=>String(item.id)===String(detailMain))?.slug,items.find(item=>String(item.id)===String(detailSub))?.slug,slugify(detailProductName)].filter(Boolean).join("/")}`} placeholder="Slug generates automatically"/></label><input value={detailGroup} onChange={(e)=>setDetailGroup(e.target.value)} placeholder="Enter machine group name"/><button type="button" onClick={openDetailProduct}><Plus/> Create detail page</button></article>
      </section>
      <div className="category-manager-grid">
        <section className="form-card category-editor">
          <div className="form-card-title">
            <FolderTree />
            <div>
              <h3>{editing ? "Edit category" : (form.parentId ? "Add sub-category" : "Add main category")}</h3>
              <p>Create a main category first; when adding a sub-category, select its parent category.</p>
            </div>
          </div>
          <label className="form-field">
            <span>Category name</span>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: slugify(e.target.value),
                })
              }
              placeholder="Rotogravure Printing Machine"
            />
          </label>
          <label className="form-field">
            <span>Main category (for sub-category)</span>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">None — create main category</option>
              {parents
                .filter((x) => x.id !== editing?.id)
                .map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
          </label>
          <small className="form-help">On save, the category's frontend PHP URL is automatically generated; there is no need to create a separate PHP file.</small>
          <label className="form-field">
            <span>Machine group</span>
            <div className="select-add-row"><select value={form.group || ""} onChange={(e) => setForm({ ...form, group: e.target.value })}>
              <option value="">Select group</option>
              {groups.map((group) => <option value={group} key={group}>{group}</option>)}
            </select><button type="button" onClick={addGroup}><Plus /> Add group</button></div>
            <small>On the frontend card, this group will be displayed instead of the PRODUCT CATEGORY number.</small>
          </label>
          <label className="form-field">
            <span>URL slug</span>
            <input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: slugify(e.target.value) })
              }
            />
          </label>
          <label className="form-field">
            <span>Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="upload-box compact category-card-upload">
            {form.image?.url ? <img src={form.image.url} alt={form.image.alt || form.name} /> : <FolderTree />}
            <b>{form.image?.url ? "Replace category card image" : "Upload category card image"}</b>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadImage(e.target.files?.[0])} />
          </label>
          <div className="form-grid two">
            <label className="form-field"><span>Image alt text</span><input value={form.image?.alt || ""} onChange={(e) => setForm({ ...form, image: { ...(form.image || {}), alt: e.target.value } })} /></label>
            <label className="form-field"><span>Image title</span><input value={form.image?.title || ""} onChange={(e) => setForm({ ...form, image: { ...(form.image || {}), title: e.target.value } })} /></label>
          </div>
          <div className="form-grid two">
            <label className="form-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="form-field">
              <span>Sort order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="form-head-actions">
            {editing && (
              <button
                className="btn secondary"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                }}
              >
                <X />
                Cancel
              </button>
            )}
            <button className="btn primary" onClick={save}>
              {editing ? <Save /> : <Plus />}
              {editing ? "Update" : (form.parentId ? "Add sub-category" : "Add main category")}
            </button>
          </div>
        </section>
        <section className="panel category-list-panel">
          <div className="table-tools">
            <label>
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories..."
              />
            </label>
          </div>
          <div className="category-records">
            {shown.map((item) => (
              <article key={item.id}>
                <span className={item.parentId ? "sub" : "main"}>
                  {item.parentId ? <Layers3 /> : <FolderTree />}
                </span>
                <div>
                  <b>{item.name}</b>
                  <small>
                    {item.parentId
                      ? "Sub category of " +
                        (items.find((x) => x.id === item.parentId)?.name ||
                          "Main category")
                      : (item.group ? item.group + " group · Main category" : "Main category")}{" "}
                    · {item.status}
                  </small>
                </div>
                <button onClick={() => edit(item)}>
                  <Edit3 />
                </button>
                <button className="danger" onClick={() => remove(item)}>
                  <Trash2 />
                </button>
              </article>
            ))}
            {!shown.length && (
              <p className="empty-state">No categories added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
