import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchProducts } from "../services/catalogApi";
import {
  advanceOrderStatus,
  applyDiscount,
  fetchAnalytics,
  fetchInvoicePdfForManager,
  fetchInvoices,
  fetchOrders,
} from "../services/salesManagerApi";

function normalizeOrderStatus(status) {
  return (status || "PROCESSING").toLowerCase().replace(/_/g, "-");
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getChartPoints(points, key, width = 620, height = 240, padding = 24) {
  if (!points || points.length === 0) {
    return "";
  }

  const values = points.map((point) => Number(point[key]));
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const span = Math.max(maxValue - minValue, 1);

  return points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
      const y = height - padding - ((Number(point[key]) - minValue) / span) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function DashboardPage() {
  const toast = useToast();
  const [today] = useState(getToday);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [discountRate, setDiscountRate] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [invoiceRange, setInvoiceRange] = useState({ from: today, to: today });
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [actingOrderId, setActingOrderId] = useState(null);

  const role = window.localStorage.getItem("auth_role");
  const isSalesManager = role === "SALES_MANAGER";

  const loadInvoices = useCallback(async function loadInvoices(from, to) {
    setLoadingInvoices(true);

    try {
      const data = await fetchInvoices(from, to);
      setInvoices(data);
    } catch (invoiceLoadError) {
      const message = invoiceLoadError.message || "Failed to load invoices.";
      setError(message);
      toast.error(message, { title: "Invoice error" });
    } finally {
      setLoadingInvoices(false);
    }
  }, [toast]);

  const loadAnalytics = useCallback(async function loadAnalytics(from, to) {
    setLoadingAnalytics(true);

    try {
      const data = await fetchAnalytics(from, to);
      setAnalytics(data);
    } catch (analyticsLoadError) {
      const message = analyticsLoadError.message || "Failed to load analytics.";
      setError(message);
      toast.error(message, { title: "Analytics error" });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isSalesManager) {
      setLoading(false);
      return;
    }

    const sections = [
      { key: "orders", loader: fetchOrders, apply: setOrders, fallback: [] },
      { key: "products", loader: fetchProducts, apply: setProducts, fallback: [] },
    ];

    Promise.allSettled(sections.map((section) => section.loader()))
      .then((results) => {
        const failures = [];
        results.forEach((result, index) => {
          const section = sections[index];
          if (result.status === "fulfilled") {
            section.apply(result.value);
          } else {
            section.apply(section.fallback);
            failures.push(`${section.key} (${result.reason?.message || "unknown error"})`);
          }
        });

        if (failures.length > 0) {
          const message = `Could not load: ${failures.join(", ")}`;
          setError(message);
          toast.error(message, { title: "Dashboard load error" });
        }
      })
      .finally(() => setLoading(false));
  }, [isSalesManager, toast]);

  useEffect(() => {
    if (!isSalesManager) {
      return;
    }

    loadInvoices(today, today);
    loadAnalytics(today, today);
  }, [isSalesManager, loadAnalytics, loadInvoices, today]);

  async function handleAdvanceOrder(orderId) {
    setOrderError("");
    setActingOrderId(orderId);

    try {
      const updatedOrder = await advanceOrderStatus(orderId);
      setOrders((prev) =>
        prev.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order))
      );
      toast.success(`Order #${orderId} moved to ${normalizeOrderStatus(updatedOrder.status)}.`, {
        title: "Order updated",
      });
    } catch (advanceError) {
      const message = advanceError.message || "Failed to advance order status.";
      setOrderError(message);
      toast.error(message, { title: "Order error" });
    } finally {
      setActingOrderId(null);
    }
  }

  async function handleApplyDiscount(event) {
    event.preventDefault();
    setSavingDiscount(true);
    setDiscountMessage("");
    setError("");

    try {
      const results = await applyDiscount(Number(discountRate), selectedProductIds);
      const refreshedProducts = await fetchProducts();
      const totalNotifications = results.reduce((sum, item) => sum + item.notifiedUsers, 0);
      setProducts(refreshedProducts);
      setDiscountMessage(`${results.length} product(s) discounted. ${totalNotifications} wishlist notifications sent.`);
      toast.success(`${results.length} product(s) discounted. ${totalNotifications} wishlist notifications sent.`, {
        title: "Discount applied",
      });
      setSelectedProductIds([]);
      setDiscountRate("");
    } catch (discountError) {
      const message = discountError.message || "Failed to apply discount.";
      setError(message);
      toast.error(message, { title: "Discount error" });
    } finally {
      setSavingDiscount(false);
    }
  }

  async function handleRangeSubmit(event) {
    event.preventDefault();
    await Promise.all([
      loadInvoices(invoiceRange.from, invoiceRange.to),
      loadAnalytics(invoiceRange.from, invoiceRange.to),
    ]);
  }

  async function handleOpenInvoice(orderId) {
    setInvoiceError("");

    try {
      const invoiceBlob = await fetchInvoicePdfForManager(orderId);
      const invoiceUrl = window.URL.createObjectURL(invoiceBlob);
      const invoiceWindow = window.open(invoiceUrl, "_blank", "noopener,noreferrer");

      if (!invoiceWindow) {
        window.location.assign(invoiceUrl);
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(invoiceUrl);
      }, 60000);
      toast.info("Invoice opened in a new tab.", { title: "Invoice ready" });
    } catch (openError) {
      const message = openError.message || "Invoice could not be opened.";
      setInvoiceError(message);
      toast.error(message, { title: "Invoice error" });
    }
  }

  function toggleProductSelection(productId) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">Back to Home</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Sales Manager Dashboard</h1>
          <p className="section-subtitle">Manage discounts, invoices, financial analytics, order flow, and rating moderation.</p>
        </div>

        {!isSalesManager && (
          <p className="section-subtitle">You do not have permission to view this page.</p>
        )}

        {isSalesManager && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="account-card">
              <h2 className="account-card-title">Discount Management</h2>
              <p className="section-subtitle">Apply a discount to selected products and notify customers who have them in their wishlists.</p>

              {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

              <form onSubmit={handleApplyDiscount} style={{ display: "grid", gap: "1rem" }}>
                <label style={{ display: "grid", gap: "0.4rem" }}>
                  <span>Discount Rate (%)</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="0.01"
                    value={discountRate}
                    onChange={(event) => setDiscountRate(event.target.value)}
                    style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)" }}
                    required
                  />
                </label>

                <div style={{ display: "grid", gap: "0.75rem", maxHeight: 280, overflow: "auto" }}>
                  {products.map((product) => (
                    <label key={product.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", padding: "0.75rem 0.9rem", borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
                      <span>
                        {product.name} · ${Number(product.price).toFixed(2)}
                        {product.discountRate > 0 ? ` · ${product.discountRate}% off` : ""}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                    </label>
                  ))}
                </div>

                {discountMessage ? <p style={{ color: "#216f48", margin: 0 }}>{discountMessage}</p> : null}

                <button className="btn-primary" type="submit" disabled={savingDiscount || selectedProductIds.length === 0}>
                  {savingDiscount ? "Applying..." : "Apply Discount"}
                </button>
              </form>
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Invoices</h2>
              <p className="section-subtitle">View invoices in a date range, then open any PDF to print or save it.</p>

              <form onSubmit={handleRangeSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <input
                  type="date"
                  value={invoiceRange.from}
                  onChange={(event) => setInvoiceRange((prev) => ({ ...prev, from: event.target.value }))}
                />
                <input
                  type="date"
                  value={invoiceRange.to}
                  onChange={(event) => setInvoiceRange((prev) => ({ ...prev, to: event.target.value }))}
                />
                <button className="btn-primary" type="submit" disabled={loadingInvoices || loadingAnalytics}>
                  {loadingInvoices || loadingAnalytics ? "Loading..." : "Load Range"}
                </button>
              </form>

              {invoiceError ? <p style={{ color: "red" }}>{invoiceError}</p> : null}
              {!loadingInvoices && invoices.length === 0 ? <p className="section-subtitle">No invoices found in this range.</p> : null}

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {invoices.map((invoice) => (
                  <article key={invoice.orderId} className="order-card">
                    <div className="order-card-head">
                      <div>
                        <p className="order-item-name">Invoice #{invoice.orderId}</p>
                        <p className="order-meta">
                          {invoice.customerName} · {invoice.createdAt?.slice(0, 10)} · ${Number(invoice.totalPrice).toFixed(2)}
                        </p>
                      </div>
                      <button className="wishlist-secondary-btn" onClick={() => handleOpenInvoice(invoice.orderId)}>
                        Open PDF
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Revenue and Profit</h2>
              <p className="section-subtitle">Revenue, cost, and profit are calculated over the selected date range.</p>

              {loadingAnalytics ? <p className="section-subtitle">Loading analytics...</p> : null}

              {analytics ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                    <div style={{ padding: "1rem", borderRadius: 16, background: "rgba(0,0,0,0.03)" }}>
                      <p className="order-meta">Revenue</p>
                      <p className="order-item-name">${Number(analytics.totalRevenue).toFixed(2)}</p>
                    </div>
                    <div style={{ padding: "1rem", borderRadius: 16, background: "rgba(0,0,0,0.03)" }}>
                      <p className="order-meta">Cost</p>
                      <p className="order-item-name">${Number(analytics.totalCost).toFixed(2)}</p>
                    </div>
                    <div style={{ padding: "1rem", borderRadius: 16, background: "rgba(0,0,0,0.03)" }}>
                      <p className="order-meta">Profit / Loss</p>
                      <p className="order-item-name">${Number(analytics.totalProfit).toFixed(2)}</p>
                    </div>
                  </div>

                  <svg viewBox="0 0 620 240" style={{ width: "100%", height: "auto", borderRadius: 16, background: "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))" }}>
                    <polyline fill="none" stroke="#1d4ed8" strokeWidth="3" points={getChartPoints(analytics.points, "revenue")} />
                    <polyline fill="none" stroke="#dc2626" strokeWidth="3" points={getChartPoints(analytics.points, "cost")} />
                    <polyline fill="none" stroke="#15803d" strokeWidth="3" points={getChartPoints(analytics.points, "profit")} />
                  </svg>

                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span className="order-meta">Blue: Revenue</span>
                    <span className="order-meta">Red: Cost</span>
                    <span className="order-meta">Green: Profit/Loss</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Order Progression</h2>

              {orderError && <p style={{ color: "red", marginBottom: "1rem" }}>{orderError}</p>}
              {loading && <p className="section-subtitle">Loading...</p>}
              {!loading && orders.length === 0 && <p className="section-subtitle">No orders found.</p>}

              {orders.map((order) => {
                const status = normalizeOrderStatus(order.status);
                const canAdvance = status === "processing" || status === "in-transit";
                const nextLabel = status === "processing"
                  ? "Move to In-Transit"
                  : status === "in-transit"
                    ? "Mark as Delivered"
                    : null;

                return (
                  <article key={order.orderId} className="order-card" style={{ marginBottom: "1rem" }}>
                    <div className="order-card-head">
                      <div>
                        <p className="order-item-name">Order #{order.orderId}</p>
                        <p className="order-meta">
                          {order.userName} · {order.createdAt?.slice(0, 10)} · ${Number(order.totalPrice).toFixed(2)}
                        </p>
                      </div>
                      <div className={`order-status order-status--${status}`}>
                        {status}
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={`${order.orderId}-${item.productId}`} className="order-item-row">
                          <div>
                            <p className="order-item-name">{item.productName}</p>
                            <p className="order-item-meta">Qty {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {canAdvance ? (
                      <div className="order-card-footer">
                        <div className="order-card-actions">
                          <button
                            className="btn-primary"
                            onClick={() => handleAdvanceOrder(order.orderId)}
                            disabled={actingOrderId === order.orderId}
                          >
                            {actingOrderId === order.orderId ? "Updating..." : nextLabel}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Moderation</h2>
              <p className="section-subtitle">Review and action customer-submitted content from dedicated moderation panels.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                <Link
                  to="/dashboard/ratings"
                  style={{ display: "block", padding: "1.25rem", borderRadius: 16, background: "rgba(0,0,0,0.03)", textDecoration: "none", color: "inherit" }}
                >
                  <p className="order-item-name" style={{ marginBottom: "0.35rem" }}>Rating Moderation</p>
                  <p className="order-meta">View all submitted star ratings and remove any that violate store policy.</p>
                  <p className="btn-primary" style={{ display: "inline-block", marginTop: "0.75rem", padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                    Open →
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
