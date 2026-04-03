import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../services/catalogApi";
import { createCategory, createProduct, deleteProduct, updateProduct } from "../services/adminApi";

const emptyProductForm = {
  name: "",
  author: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  model: "",
  serialNumber: "",
  warrantyStatus: "",
  distributor: "",
  categoryName: "",
  featured: false,
  editorChoice: false,
  newArrival: false,
};

const emptyCategoryForm = {
  name: "",
  imageUrl: "",
  displayOrder: "",
};

function AdminInput({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#d4c7aa" }}>{label}</span>
      {children}
    </label>
  );
}

function textInputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(212, 199, 170, 0.24)",
    background: "rgba(14, 14, 18, 0.92)",
    color: "#f7f3ea",
  };
}

export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [categoryDtos, productDtos] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);
      setCategories(categoryDtos);
      setProducts(productDtos);
      setProductForm((prev) => ({
        ...prev,
        categoryName: prev.categoryName || categoryDtos[0]?.name || "",
      }));
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => b.id - a.id),
    [products]
  );

  function handleProductChange(event) {
    const { name, value, type, checked } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCategoryChange(event) {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function buildProductPayload() {
    return {
      name: productForm.name,
      author: productForm.author,
      description: productForm.description,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl,
      model: productForm.model,
      serialNumber: productForm.serialNumber,
      warrantyStatus: productForm.warrantyStatus,
      distributor: productForm.distributor,
      categoryName: productForm.categoryName,
      featured: productForm.featured,
      editorChoice: productForm.editorChoice,
      newArrival: productForm.newArrival,
    };
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = buildProductPayload();

      if (editingId) {
        await updateProduct(editingId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product created successfully.");
      }

      setEditingId(null);
      setProductForm({
        ...emptyProductForm,
        categoryName: categories[0]?.name || "",
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await createCategory({
        name: categoryForm.name,
        imageUrl: categoryForm.imageUrl,
        displayOrder: categoryForm.displayOrder ? Number(categoryForm.displayOrder) : null,
      });
      setCategoryForm(emptyCategoryForm);
      setMessage("Category created successfully.");
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name || "",
      author: product.author || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      model: product.model || "",
      serialNumber: product.serialNumber || "",
      warrantyStatus: product.warrantyStatus || "",
      distributor: product.distributor || "",
      categoryName: product.category || categories[0]?.name || "",
      featured: Boolean(product.featured),
      editorChoice: Boolean(product.editorChoice),
      newArrival: Boolean(product.newArrival),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetProductForm() {
    setEditingId(null);
    setProductForm({
      ...emptyProductForm,
      categoryName: categories[0]?.name || "",
    });
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm("Delete this product from the database?");
    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await deleteProduct(productId);
      if (editingId === productId) {
        resetProductForm();
      }
      setMessage("Product deleted successfully.");
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ background: "#06070a", minHeight: "100vh", color: "#f7f3ea", paddingBottom: 80 }}>
      <div className="catalogue-breadcrumb">
        <Link to="/catalogue" className="breadcrumb-link">Back to Catalogue</Link>
      </div>

      <section style={{ width: "min(1180px, calc(100% - 48px))", margin: "0 auto", display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <p className="section-tag">Product Manager Panel</p>
          <h1 className="section-title">Admin Catalogue Management</h1>
          <p className="section-subtitle">
            Add categories, create products, edit stock and pricing, and delete catalogue entries directly in PostgreSQL.
          </p>
        </div>

        {error && (
          <div style={{ padding: 14, borderRadius: 14, background: "rgba(131, 34, 52, 0.22)", border: "1px solid rgba(255, 120, 120, 0.24)" }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ padding: 14, borderRadius: 14, background: "rgba(33, 111, 72, 0.2)", border: "1px solid rgba(134, 239, 172, 0.22)" }}>
            {message}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24, alignItems: "start" }}>
          <form onSubmit={handleProductSubmit} style={{ display: "grid", gap: 18, padding: 24, borderRadius: 24, background: "rgba(15, 16, 21, 0.92)", border: "1px solid rgba(212, 199, 170, 0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>{editingId ? "Edit Product" : "Create Product"}</h2>
                <p style={{ margin: "6px 0 0", color: "#bdb4a3" }}>This form writes directly to the backend database.</p>
              </div>
              {editingId && (
                <button type="button" onClick={resetProductForm} style={{ ...textInputStyle(), width: "auto", cursor: "pointer" }}>
                  Cancel Edit
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              <AdminInput label="Name"><input name="name" value={productForm.name} onChange={handleProductChange} style={textInputStyle()} required /></AdminInput>
              <AdminInput label="Author"><input name="author" value={productForm.author} onChange={handleProductChange} style={textInputStyle()} required /></AdminInput>
              <AdminInput label="Price"><input name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductChange} style={textInputStyle()} required /></AdminInput>
              <AdminInput label="Stock"><input name="stock" type="number" min="0" step="1" value={productForm.stock} onChange={handleProductChange} style={textInputStyle()} required /></AdminInput>
              <AdminInput label="Category">
                <select name="categoryName" value={productForm.categoryName} onChange={handleProductChange} style={textInputStyle()} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </AdminInput>
              <AdminInput label="Image URL"><input name="imageUrl" value={productForm.imageUrl} onChange={handleProductChange} style={textInputStyle()} /></AdminInput>
              <AdminInput label="Model"><input name="model" value={productForm.model} onChange={handleProductChange} style={textInputStyle()} /></AdminInput>
              <AdminInput label="Serial Number"><input name="serialNumber" value={productForm.serialNumber} onChange={handleProductChange} style={textInputStyle()} /></AdminInput>
              <AdminInput label="Warranty Status"><input name="warrantyStatus" value={productForm.warrantyStatus} onChange={handleProductChange} style={textInputStyle()} /></AdminInput>
              <AdminInput label="Distributor"><input name="distributor" value={productForm.distributor} onChange={handleProductChange} style={textInputStyle()} /></AdminInput>
            </div>

            <AdminInput label="Description">
              <textarea name="description" rows="5" value={productForm.description} onChange={handleProductChange} style={{ ...textInputStyle(), resize: "vertical" }} required />
            </AdminInput>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
              {[
                ["featured", "Featured on Home"],
                ["editorChoice", "Editor's Choice"],
                ["newArrival", "New Arrival"],
              ].map(([name, label]) => (
                <label key={name} style={{ display: "flex", alignItems: "center", gap: 8, color: "#e9dec8" }}>
                  <input type="checkbox" name={name} checked={productForm[name]} onChange={handleProductChange} />
                  {label}
                </label>
              ))}
            </div>

            <button type="submit" disabled={submitting || loading} className="btn-primary">
              {submitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
          </form>

          <form onSubmit={handleCategorySubmit} style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "rgba(15, 16, 21, 0.92)", border: "1px solid rgba(212, 199, 170, 0.18)" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Create Category</h2>
              <p style={{ margin: "6px 0 0", color: "#bdb4a3" }}>New categories become tabs on the catalogue page.</p>
            </div>

            <AdminInput label="Category Name"><input name="name" value={categoryForm.name} onChange={handleCategoryChange} style={textInputStyle()} required /></AdminInput>
            <AdminInput label="Category Image URL"><input name="imageUrl" value={categoryForm.imageUrl} onChange={handleCategoryChange} style={textInputStyle()} /></AdminInput>
            <AdminInput label="Display Order"><input name="displayOrder" type="number" min="0" step="1" value={categoryForm.displayOrder} onChange={handleCategoryChange} style={textInputStyle()} /></AdminInput>

            <button type="submit" disabled={submitting || loading} className="btn-dark">Create Category</button>

            <div style={{ display: "grid", gap: 10 }}>
              <h3 style={{ margin: "12px 0 0", fontSize: 18 }}>Existing Categories</h3>
              {categories.map((category) => (
                <div key={category.id} style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 199, 170, 0.12)" }}>
                  <strong>{category.name}</strong>
                  <div style={{ color: "#bdb4a3", fontSize: 13, marginTop: 4 }}>Display Order: {category.displayOrder ?? "—"}</div>
                </div>
              ))}
            </div>
          </form>
        </div>

        <section style={{ display: "grid", gap: 16, padding: 24, borderRadius: 24, background: "rgba(15, 16, 21, 0.92)", border: "1px solid rgba(212, 199, 170, 0.18)" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Current Products</h2>
            <p style={{ margin: "6px 0 0", color: "#bdb4a3" }}>These rows come from the backend database.</p>
          </div>

          {loading ? (
            <p style={{ color: "#bdb4a3" }}>Loading products...</p>
          ) : sortedProducts.length === 0 ? (
            <p style={{ color: "#bdb4a3" }}>No products found.</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {sortedProducts.map((product) => (
                <article key={product.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 16, alignItems: "center", padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 199, 170, 0.12)" }}>
                  <img src={product.imageUrl || product.image || "https://via.placeholder.com/120x160?text=Book"} alt={product.name} style={{ width: 120, height: 160, objectFit: "cover", borderRadius: 12 }} />
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 13, color: "#c7b68f" }}>{product.category}</div>
                    <h3 style={{ margin: 0, fontSize: 20 }}>{product.name}</h3>
                    <div style={{ color: "#d9d0c0" }}>by {product.author}</div>
                    <div style={{ color: "#bdb4a3", fontSize: 14 }}>Stock: {product.stock} · Price: ${product.price.toFixed(2)}</div>
                    <div style={{ color: "#9e9482", fontSize: 13 }}>
                      {product.featured ? "Featured · " : ""}
                      {product.editorChoice ? "Editor Choice · " : ""}
                      {product.newArrival ? "New Arrival" : "Standard"}
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    <button onClick={() => startEdit(product)} className="btn-primary" type="button">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="wishlist-secondary-btn" type="button" disabled={submitting}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}