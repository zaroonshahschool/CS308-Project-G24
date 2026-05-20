import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchCategories, fetchProducts } from "../services/catalogApi";
import {
  advanceDeliveryStatus,
  createCategory,
  createCollection,
  createProduct,
  deleteCollection,
  deleteProduct,
  fetchAdminCollections,
  fetchDeliveries,
  updateCollection,
  updateProduct,
} from "../services/adminApi";

const emptyProductForm = {
  name: "",
  author: "",
  description: "",
  price: "",
  costPrice: "",
  stock: "",
  imageUrl: "",
  publisher: "",
  paperType: "",
  pageCount: "",
  dimensions: "",
  publicationDate: "",
  isbn: "",
  language: "",
  coverType: "",
  categoryName: "",
  featured: false,
  editorChoice: false,
  newArrival: false,
  limitedEdition: false,
};

const emptyCategoryForm = {
  name: "",
  imageUrl: "",
  displayOrder: "",
};

const emptyCollectionForm = {
  name: "",
  description: "",
  imageUrl: "",
  productIds: [],
};

function normalizeOrderStatus(status) {
  return (status || "PROCESSING").toLowerCase().replace(/_/g, "-");
}

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function AdminPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actingOrderId, setActingOrderId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm);
  const [editingCollectionId, setEditingCollectionId] = useState(null);

  const loadAdminData = useCallback(async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [categoryDtos, productDtos, deliveryDtos, collectionDtos] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchDeliveries(),
        fetchAdminCollections(),
      ]);
      setCategories(categoryDtos);
      setProducts(productDtos);
      setDeliveries(deliveryDtos);
      setCollections(collectionDtos);
      setProductForm((prev) => ({
        ...prev,
        categoryName: prev.categoryName || categoryDtos[0]?.name || "",
      }));
    } catch (err) {
      const message = err.message || "Failed to load admin data.";
      setError(message);
      toast.error(message, { title: "Admin data error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => b.id - a.id),
    [products]
  );

  const deliveryStats = useMemo(() => {
    const pending = deliveries.filter((row) => !row.completed).length;
    const completed = deliveries.filter((row) => row.completed).length;
    return { pending, completed, total: deliveries.length };
  }, [deliveries]);

  function handleProductChange(event) {
    const { name, value, type, checked } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCollectionChange(event) {
    const { name, value } = event.target;
    setCollectionForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCollectionProductToggle(productId) {
    setCollectionForm((prev) => {
      const ids = prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds: ids };
    });
  }

  function startEditCollection(col) {
    setEditingCollectionId(col.id);
    setCollectionForm({
      name: col.name || "",
      description: col.description || "",
      imageUrl: col.imageUrl || "",
      productIds: col.productIds || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetCollectionForm() {
    setEditingCollectionId(null);
    setCollectionForm(emptyCollectionForm);
  }

  async function handleCollectionSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: collectionForm.name,
        description: collectionForm.description,
        imageUrl: collectionForm.imageUrl,
        productIds: collectionForm.productIds,
      };
      if (editingCollectionId) {
        await updateCollection(editingCollectionId, payload);
        toast.success("Collection updated.", { title: "Collection saved" });
      } else {
        await createCollection(payload);
        toast.success("Collection created.", { title: "Collection saved" });
      }
      resetCollectionForm();
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Failed to save collection.", { title: "Collection error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCollection(id) {
    if (!window.confirm("Delete this collection?")) return;
    setSubmitting(true);
    try {
      await deleteCollection(id);
      toast.success("Collection deleted.", { title: "Collection" });
      await loadAdminData();
    } catch (err) {
      toast.error(err.message || "Failed to delete collection.", { title: "Collection error" });
    } finally {
      setSubmitting(false);
    }
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
      costPrice: productForm.costPrice ? Number(productForm.costPrice) : null,
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl,
      publisher: productForm.publisher,
      paperType: productForm.paperType,
      pageCount: productForm.pageCount ? Number(productForm.pageCount) : null,
      dimensions: productForm.dimensions,
      publicationDate: productForm.publicationDate,
      isbn: productForm.isbn,
      language: productForm.language,
      coverType: productForm.coverType,
      categoryName: productForm.categoryName,
      featured: productForm.featured,
      editorChoice: productForm.editorChoice,
      newArrival: productForm.newArrival,
      limitedEdition: productForm.limitedEdition,
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
        toast.success("Product updated successfully.", { title: "Product saved" });
      } else {
        await createProduct(payload);
        setMessage("Product created successfully.");
        toast.success("Product created successfully.", { title: "Product saved" });
      }

      setEditingId(null);
      setProductForm({
        ...emptyProductForm,
        categoryName: categories[0]?.name || "",
      });
      await loadAdminData();
    } catch (err) {
      const message = err.message || "Failed to save product.";
      setError(message);
      toast.error(message, { title: "Product error" });
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
      toast.success("Category created successfully.", { title: "Category saved" });
      await loadAdminData();
    } catch (err) {
      const message = err.message || "Failed to create category.";
      setError(message);
      toast.error(message, { title: "Category error" });
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
      costPrice: String(product.costPrice ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      publisher: product.publisher || "",
      paperType: product.paperType || "",
      pageCount: product.pageCount != null ? String(product.pageCount) : "",
      dimensions: product.dimensions || "",
      publicationDate: product.publicationDate || "",
      isbn: product.isbn || "",
      language: product.language || "",
      coverType: product.coverType || "",
      categoryName: product.category || categories[0]?.name || "",
      featured: Boolean(product.featured),
      editorChoice: Boolean(product.editorChoice),
      newArrival: Boolean(product.newArrival),
      limitedEdition: Boolean(product.limitedEdition),
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
      toast.success("Product deleted successfully.", { title: "Product deleted" });
      await loadAdminData();
    } catch (err) {
      const message = err.message || "Failed to delete product.";
      setError(message);
      toast.error(message, { title: "Product error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdvanceDelivery(orderId) {
    setError("");
    setMessage("");
    setActingOrderId(orderId);

    try {
      await advanceDeliveryStatus(orderId);
      const updated = await fetchDeliveries();
      setDeliveries(updated);
      toast.success("Delivery status updated.", { title: "Delivery updated" });
    } catch (err) {
      const message = err.message || "Failed to advance delivery status.";
      setError(message);
      toast.error(message, { title: "Delivery error" });
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/catalogue" className="breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Catalogue
        </Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <div>
            <p className="section-tag">Product Manager Panel</p>
            <h1 className="section-title">Catalogue & Deliveries</h1>
          </div>
          <p className="section-subtitle">
            Manage products and categories, and track deliveries through processing, in-transit, and delivered.
          </p>
        </div>

        {error ? <p className="checkout-error">{error}</p> : null}
        {message ? (
          <div className="order-success-banner">
            <p className="order-item-name">{message}</p>
          </div>
        ) : null}

        <div className="admin-grid">
          <form onSubmit={handleProductSubmit} className="account-card admin-product-form">
            <div className="admin-card-head">
              <h2 className="account-card-title">{editingId ? "Edit Product" : "Create Product"}</h2>
              {editingId ? (
                <button type="button" onClick={resetProductForm} className="wishlist-secondary-btn">
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
              This form writes directly to the database.
            </p>

            <div className="admin-form-grid">
              <label className="review-field">
                <span>Name</span>
                <input name="name" value={productForm.name} onChange={handleProductChange} required />
              </label>
              <label className="review-field">
                <span>Author</span>
                <input name="author" value={productForm.author} onChange={handleProductChange} required />
              </label>
              <label className="review-field">
                <span>Price</span>
                <input name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductChange} required />
              </label>
              <label className="review-field">
                <span>Cost Price</span>
                <input name="costPrice" type="number" min="0" step="0.01" value={productForm.costPrice} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Stock</span>
                <input name="stock" type="number" min="0" step="1" value={productForm.stock} onChange={handleProductChange} required />
              </label>
              <label className="review-field">
                <span>Category</span>
                <select name="categoryName" value={productForm.categoryName} onChange={handleProductChange} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="review-field">
                <span>Image URL</span>
                <input name="imageUrl" value={productForm.imageUrl} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Publisher</span>
                <input name="publisher" value={productForm.publisher} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Language</span>
                <input name="language" value={productForm.language} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>ISBN</span>
                <input name="isbn" value={productForm.isbn} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Page Count</span>
                <input name="pageCount" type="number" min="1" step="1" value={productForm.pageCount} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Cover Type</span>
                <input name="coverType" value={productForm.coverType} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Paper Type</span>
                <input name="paperType" value={productForm.paperType} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Dimensions</span>
                <input name="dimensions" value={productForm.dimensions} onChange={handleProductChange} />
              </label>
              <label className="review-field">
                <span>Publication Date</span>
                <input name="publicationDate" value={productForm.publicationDate} onChange={handleProductChange} />
              </label>
            </div>

            <label className="review-field">
              <span>Description</span>
              <textarea name="description" rows="5" value={productForm.description} onChange={handleProductChange} required />
            </label>

            <div className="admin-flag-row">
              {[
                ["featured", "Featured on Home"],
                ["editorChoice", "Editor's Choice"],
                ["newArrival", "New Arrival"],
                ["limitedEdition", "Limited Edition"],
              ].map(([name, label]) => (
                <label key={name} className="admin-flag">
                  <input type="checkbox" name={name} checked={productForm[name]} onChange={handleProductChange} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <button type="submit" disabled={submitting || loading} className="btn-dark admin-submit">
              {submitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
          </form>

          <form onSubmit={handleCategorySubmit} className="account-card">
            <h2 className="account-card-title">Create Category</h2>
            <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
              New categories become tabs on the catalogue page.
            </p>

            <label className="review-field">
              <span>Category Name</span>
              <input name="name" value={categoryForm.name} onChange={handleCategoryChange} required />
            </label>
            <label className="review-field">
              <span>Category Image URL</span>
              <input name="imageUrl" value={categoryForm.imageUrl} onChange={handleCategoryChange} />
            </label>
            <label className="review-field">
              <span>Display Order</span>
              <input name="displayOrder" type="number" min="0" step="1" value={categoryForm.displayOrder} onChange={handleCategoryChange} />
            </label>

            <button type="submit" disabled={submitting || loading} className="btn-primary">
              Create Category
            </button>

            <h3 className="account-card-title" style={{ marginTop: "1.5rem", fontSize: "1.25rem" }}>
              Existing Categories
            </h3>
            <div className="admin-category-list">
              {categories.map((category) => (
                <div key={category.id} className="admin-category-chip">
                  <strong>{category.name}</strong>
                  <span className="order-meta">Order: {category.displayOrder ?? "—"}</span>
                </div>
              ))}
            </div>
          </form>
        </div>

        <form onSubmit={handleCollectionSubmit} className="account-card">
          <h2 className="account-card-title">
            {editingCollectionId ? "Edit Collection" : "Create Collection"}
          </h2>
          <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
            Group books into a themed collection visible on the Collections page.
          </p>

          <label className="review-field">
            <span>Collection Name</span>
            <input name="name" value={collectionForm.name} onChange={handleCollectionChange} required />
          </label>
          <label className="review-field">
            <span>Description</span>
            <textarea name="description" rows="3" value={collectionForm.description} onChange={handleCollectionChange} />
          </label>
          <label className="review-field">
            <span>Cover Image URL</span>
            <input name="imageUrl" value={collectionForm.imageUrl} onChange={handleCollectionChange} />
          </label>

          <p className="section-subtitle" style={{ margin: "1rem 0 0.5rem" }}>Assign Products</p>
          <div className="admin-product-list" style={{ maxHeight: 300, overflowY: "auto", gap: "0.5rem" }}>
            {sortedProducts.map((product) => (
              <label key={product.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={collectionForm.productIds.includes(product.id)}
                  onChange={() => handleCollectionProductToggle(product.id)}
                />
                <span style={{ fontSize: "0.875rem" }}>{product.name} <span className="order-meta">— {product.author}</span></span>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="submit" disabled={submitting || loading} className="btn-dark admin-submit">
              {submitting ? "Saving..." : editingCollectionId ? "Update Collection" : "Create Collection"}
            </button>
            {editingCollectionId && (
              <button type="button" onClick={resetCollectionForm} className="wishlist-secondary-btn">
                Cancel
              </button>
            )}
          </div>

          <h3 className="account-card-title" style={{ marginTop: "1.5rem", fontSize: "1.25rem" }}>
            Existing Collections
          </h3>
          {collections.length === 0 ? (
            <p className="section-subtitle">No collections yet.</p>
          ) : (
            <div className="admin-category-list">
              {collections.map((col) => (
                <div key={col.id} className="admin-category-chip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong>{col.name}</strong>
                    <span className="order-meta" style={{ marginLeft: "0.5rem" }}>{col.productCount} books</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" onClick={() => startEditCollection(col)} className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteCollection(col.id)} className="wishlist-secondary-btn" style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }} disabled={submitting}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="account-card">
          <div className="customer-page-head" style={{ borderBottom: "none", marginBottom: "0.5rem", paddingBottom: 0 }}>
            <h2 className="account-card-title" style={{ marginBottom: 0 }}>Deliveries</h2>
            <p className="section-subtitle">
              {deliveryStats.total === 0
                ? "No active deliveries."
                : `${deliveryStats.pending} pending · ${deliveryStats.completed} completed · ${deliveryStats.total} total`}
            </p>
          </div>

          {loading ? (
            <p className="section-subtitle">Loading deliveries...</p>
          ) : deliveries.length === 0 ? (
            <div className="customer-empty">
              <h3 className="customer-empty-title">No deliveries yet</h3>
              <p className="customer-empty-text">Completed customer orders will appear here with their shipping addresses.</p>
            </div>
          ) : (
            <div className="admin-delivery-table-wrap">
              <table className="admin-delivery-table">
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Completed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((row) => {
                    const status = normalizeOrderStatus(row.orderStatus);
                    const nextLabel = status === "processing"
                      ? "Mark In-Transit"
                      : status === "in-transit"
                        ? "Mark Delivered"
                        : null;

                    return (
                      <tr key={row.deliveryId}>
                        <td>#{row.deliveryId}</td>
                        <td>#{row.orderId}<div className="order-meta">{formatDate(row.createdAt)}</div></td>
                        <td>{row.customerName}<div className="order-meta">ID {row.customerId}</div></td>
                        <td>{row.productName}<div className="order-meta">ID {row.productId}</div></td>
                        <td>{row.quantity}</td>
                        <td>${Number(row.totalPrice).toFixed(2)}</td>
                        <td className="admin-delivery-address">{row.deliveryAddress || "—"}</td>
                        <td>
                          <span className={`order-status order-status--${status}`}>{status}</span>
                        </td>
                        <td>
                          {row.completed ? (
                            <span className="admin-delivery-pill admin-delivery-pill--done">Yes</span>
                          ) : (
                            <span className="admin-delivery-pill">No</span>
                          )}
                        </td>
                        <td>
                          {nextLabel ? (
                            <button
                              type="button"
                              className="wishlist-secondary-btn"
                              onClick={() => handleAdvanceDelivery(row.orderId)}
                              disabled={actingOrderId === row.orderId}
                            >
                              {actingOrderId === row.orderId ? "Updating..." : nextLabel}
                            </button>
                          ) : (
                            <span className="order-meta">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="account-card">
          <h2 className="account-card-title">Current Products</h2>
          <p className="section-subtitle" style={{ marginBottom: "1rem" }}>
            These rows come from the database.
          </p>

          {loading ? (
            <p className="section-subtitle">Loading products...</p>
          ) : sortedProducts.length === 0 ? (
            <p className="section-subtitle">No products found.</p>
          ) : (
            <div className="admin-product-list">
              {sortedProducts.map((product) => (
                <article key={product.id} className="admin-product-row">
                  <img
                    src={product.imageUrl || product.image || "https://via.placeholder.com/120x160?text=Book"}
                    alt={product.name}
                    className="admin-product-cover"
                  />
                  <div className="admin-product-info">
                    <span className="catalog-card-cat">{product.category}</span>
                    <h3 className="admin-product-title">{product.name}</h3>
                    <p className="order-meta">by {product.author}</p>
                    <p className="order-meta">Stock: {product.stock} · Price: ${Number(product.price).toFixed(2)}</p>
                    <p className="order-meta">
                      {product.featured ? "Featured · " : ""}
                      {product.editorChoice ? "Editor's Choice · " : ""}
                      {product.newArrival ? "New Arrival" : "Standard"}
                    </p>
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => startEdit(product)} className="btn-primary" type="button">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="wishlist-secondary-btn"
                      type="button"
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
