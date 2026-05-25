import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchProducts } from "../services/catalogApi";
import {
  applyDiscount,
  fetchAnalytics,
  fetchInvoicePdfForManager,
  fetchInvoices,
  removeDiscount,
  setBasePrice,
} from "../services/salesManagerApi";

function normalizeOrderStatus(status) {
  return (status || "PROCESSING").toLowerCase().replace(/_/g, "-");
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function toCumulative(points) {
  let sumRevenue = 0, sumCost = 0, sumProfit = 0;
  return points.map((p) => {
    sumRevenue += Number(p.revenue);
    sumCost += Number(p.cost);
    sumProfit += Number(p.profit);
    return { ...p, revenue: sumRevenue, cost: sumCost, profit: sumProfit };
  });
}

function computeChartCoords(points, key, globalMin, globalMax, { width = 620, height = 240, padLeft = 24, padRight = 24, padTop = 24, padBottom = 24 } = {}) {
  if (!points || points.length === 0) return [];
  const span = Math.max(globalMax - globalMin, 1);
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  return points.map((point, index) => {
    const x = points.length === 1
      ? padLeft + plotW / 2
      : padLeft + (index * plotW) / (points.length - 1);
    const y = padTop + plotH - ((Number(point[key]) - globalMin) / span) * plotH;
    return { x, y };
  });
}

function getChartPoints(points, key, globalMin, globalMax, layout = {}) {
  return computeChartCoords(points, key, globalMin, globalMax, layout)
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");
}

export default function DashboardPage() {
  const toast = useToast();
  const [today] = useState(getToday);
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [discountRate, setDiscountRate] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [invoiceRange, setInvoiceRange] = useState({ from: today, to: today });
  const [analyticsRange, setAnalyticsRange] = useState({ from: today, to: today });
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [basePriceInputs, setBasePriceInputs] = useState({});
  const [savingPriceId, setSavingPriceId] = useState(null);
  const [removingDiscountId, setRemovingDiscountId] = useState(null);
  const [error, setError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [invoicesPage, setInvoicesPage] = useState(0);
  const [cumulativeChart, setCumulativeChart] = useState(false);

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
    if (!isSalesManager) return;

    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        const message = err.message || "Could not load products.";
        setError(message);
        toast.error(message, { title: "Dashboard load error" });
      });
  }, [isSalesManager, toast]);

  useEffect(() => {
    if (!isSalesManager) {
      return;
    }

    loadInvoices(today, today);
    loadAnalytics(today, today);
  }, [isSalesManager, loadAnalytics, loadInvoices, today]);

  const ITEMS_PER_PAGE = 5;

  const pagedInvoices = useMemo(() => {
    const start = invoicesPage * ITEMS_PER_PAGE;
    return invoices.slice(start, start + ITEMS_PER_PAGE);
  }, [invoices, invoicesPage]);

  const invoicesTotalPages = Math.max(1, Math.ceil(invoices.length / ITEMS_PER_PAGE));

  useEffect(() => { setInvoicesPage(0); }, [invoices]);

  async function handleSetBasePrice(productId, basePriceStr) {
    const basePrice = Number(basePriceStr);
    if (!basePrice || basePrice <= 0) return;
    setSavingPriceId(productId);
    try {
      await setBasePrice(productId, basePrice);
      const refreshedProducts = await fetchProducts();
      setProducts(refreshedProducts);
      setBasePriceInputs((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      toast.success("Base price updated.", { title: "Price updated" });
    } catch (priceError) {
      const message = priceError.message || "Failed to update base price.";
      toast.error(message, { title: "Price error" });
    } finally {
      setSavingPriceId(null);
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

  async function handleRemoveDiscount(productId) {
    setRemovingDiscountId(productId);
    setError("");

    try {
      await removeDiscount(productId);
      const refreshedProducts = await fetchProducts();
      setProducts(refreshedProducts);
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
      toast.success("Discount removed.", { title: "Discount updated" });
    } catch (discountError) {
      const message = discountError.message || "Failed to remove discount.";
      setError(message);
      toast.error(message, { title: "Discount error" });
    } finally {
      setRemovingDiscountId(null);
    }
  }

  async function handleRangeSubmit(event) {
    event.preventDefault();
    await loadInvoices(invoiceRange.from, invoiceRange.to);
  }

  async function handleAnalyticsRangeSubmit(event) {
    event.preventDefault();
    await loadAnalytics(analyticsRange.from, analyticsRange.to);
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

  async function handleDownloadInvoice(orderId) {
    setInvoiceError("");
    try {
      const invoiceBlob = await fetchInvoicePdfForManager(orderId);
      const invoiceUrl = window.URL.createObjectURL(invoiceBlob);
      const link = document.createElement("a");
      link.href = invoiceUrl;
      link.download = `invoice-order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => window.URL.revokeObjectURL(invoiceUrl), 10000);
      toast.info("Invoice download started.", { title: "Downloading" });
    } catch (downloadError) {
      const message = downloadError.message || "Invoice could not be downloaded.";
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
          <p className="section-subtitle">Manage discounts, invoices, financial analytics, order flow, and comment moderation.</p>
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

                <div style={{ display: "grid", gap: "0.75rem", maxHeight: 360, overflow: "auto" }}>
                  {products.map((product) => (
                    <div key={product.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem 0.9rem", borderRadius: 12, background: "rgba(0,0,0,0.03)", flexWrap: "wrap" }}>
                      <span style={{ flex: 1, minWidth: 140 }}>
                        <span style={{ fontWeight: 500 }}>{product.name}</span>
                        <br />
                        <small>
                          ${Number(product.price).toFixed(2)}
                          {product.discountRate > 0
                            ? ` · ${Number(product.discountRate).toFixed(0)}% off (base $${Number(product.originalPrice || product.price).toFixed(2)})`
                            : ""}
                        </small>
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Base price"
                          value={basePriceInputs[product.id] ?? ""}
                          onChange={(e) => setBasePriceInputs((prev) => ({ ...prev, [product.id]: e.target.value }))}
                          style={{ width: 100, padding: "0.35rem 0.55rem", borderRadius: 8, border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                        <button
                          type="button"
                          className="wishlist-secondary-btn"
                          onClick={() => handleSetBasePrice(product.id, basePriceInputs[product.id])}
                          disabled={!basePriceInputs[product.id] || savingPriceId === product.id}
                          style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                        >
                          {savingPriceId === product.id ? "..." : "Set Price"}
                        </button>
                        {product.discountRate > 0 ? (
                          <button
                            type="button"
                            className="wishlist-secondary-btn"
                            onClick={() => handleRemoveDiscount(product.id)}
                            disabled={removingDiscountId === product.id}
                            style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                          >
                            {removingDiscountId === product.id ? "..." : "Remove Discount"}
                          </button>
                        ) : null}
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                        <span style={{ fontSize: "0.8rem" }}>Discount</span>
                      </label>
                    </div>
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
                {pagedInvoices.map((invoice) => (
                  <article key={invoice.orderId} className="order-card">
                    <div className="order-card-head">
                      <div>
                        <p className="order-item-name">Invoice #{invoice.orderId}</p>
                        <p className="order-meta">
                          {invoice.customerName} · {invoice.createdAt?.slice(0, 10)} · ${Number(invoice.totalPrice).toFixed(2)}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="wishlist-secondary-btn" onClick={() => handleOpenInvoice(invoice.orderId)}>
                          Open PDF
                        </button>
                        <button className="wishlist-secondary-btn" onClick={() => handleDownloadInvoice(invoice.orderId)}>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {invoicesTotalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={invoicesPage === 0}
                    onClick={() => setInvoicesPage((p) => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span className="pagination-info">
                    Page {invoicesPage + 1} of {invoicesTotalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={invoicesPage >= invoicesTotalPages - 1}
                    onClick={() => setInvoicesPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Revenue and Profit</h2>
              <p className="section-subtitle">Revenue, cost, and profit are calculated over the selected date range.</p>

              <form onSubmit={handleAnalyticsRangeSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <input
                  type="date"
                  value={analyticsRange.from}
                  onChange={(e) => setAnalyticsRange((prev) => ({ ...prev, from: e.target.value }))}
                />
                <input
                  type="date"
                  value={analyticsRange.to}
                  onChange={(e) => setAnalyticsRange((prev) => ({ ...prev, to: e.target.value }))}
                />
                <button className="btn-primary" type="submit" disabled={loadingAnalytics}>
                  {loadingAnalytics ? "Loading..." : "Load Range"}
                </button>
              </form>

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

                  {(() => {
                    const chartPoints = cumulativeChart ? toCumulative(analytics.points) : analytics.points;
                    const allValues = chartPoints.flatMap((p) => [Number(p.revenue), Number(p.cost), Number(p.profit)]);
                    const globalMin = Math.min(0, ...allValues);
                    const globalMax = Math.max(1, ...allValues);

                    const W = 620, H = 260;
                    const padLeft = 62, padRight = 16, padTop = 16, padBottom = 44;
                    const plotW = W - padLeft - padRight;
                    const plotH = H - padTop - padBottom;
                    const layout = { width: W, height: H, padLeft, padRight, padTop, padBottom };
                    const span = Math.max(globalMax - globalMin, 1);

                    const Y_TICKS = 5;
                    const yTicks = Array.from({ length: Y_TICKS }, (_, i) => {
                      const val = globalMin + (i / (Y_TICKS - 1)) * span;
                      const y = padTop + plotH - ((val - globalMin) / span) * plotH;
                      return { val, y };
                    });

                    const formatMoney = (val) => {
                      const abs = Math.abs(val);
                      const sign = val < 0 ? "-" : "";
                      if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
                      return `${sign}$${Math.round(abs)}`;
                    };

                    const formatAxisDate = (dateStr) => {
                      if (!dateStr) return "";
                      const parts = String(dateStr).split("-");
                      return `${parts[1]}/${parts[2]}`;
                    };

                    const maxXLabels = 7;
                    const xStep = Math.max(1, Math.ceil(chartPoints.length / maxXLabels));

                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", borderRadius: 16, background: "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))" }}>
                        {/* Horizontal grid lines + Y labels */}
                        {yTicks.map(({ val, y }) => (
                          <g key={val}>
                            <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                            <text x={padLeft - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#9ca3af">
                              {formatMoney(val)}
                            </text>
                          </g>
                        ))}

                        {/* X axis baseline */}
                        <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#d1d5db" strokeWidth="1" />

                        {/* X axis date labels */}
                        {chartPoints.map((p, i) => {
                          if (i % xStep !== 0 && i !== chartPoints.length - 1) return null;
                          const x = chartPoints.length === 1
                            ? padLeft + plotW / 2
                            : padLeft + (i * plotW) / (chartPoints.length - 1);
                          return (
                            <text key={i} x={x} y={padTop + plotH + 14} textAnchor="middle" fontSize="10" fill="#9ca3af">
                              {formatAxisDate(p.date)}
                            </text>
                          );
                        })}

                        {/* Data lines */}
                        <polyline fill="none" stroke="#1d4ed8" strokeWidth="2.5" points={getChartPoints(chartPoints, "revenue", globalMin, globalMax, layout)} />
                        <polyline fill="none" stroke="#dc2626" strokeWidth="2.5" points={getChartPoints(chartPoints, "cost", globalMin, globalMax, layout)} />
                        <polyline fill="none" stroke="#15803d" strokeWidth="2.5" points={getChartPoints(chartPoints, "profit", globalMin, globalMax, layout)} />

                        {/* Data point circles */}
                        {computeChartCoords(chartPoints, "revenue", globalMin, globalMax, layout).map(({ x, y }, i) => (
                          <circle key={`rev-${i}`} cx={x} cy={y} r="3.5" fill="#1d4ed8" />
                        ))}
                        {computeChartCoords(chartPoints, "cost", globalMin, globalMax, layout).map(({ x, y }, i) => (
                          <circle key={`cost-${i}`} cx={x} cy={y} r="3.5" fill="#dc2626" />
                        ))}
                        {computeChartCoords(chartPoints, "profit", globalMin, globalMax, layout).map(({ x, y }, i) => (
                          <circle key={`profit-${i}`} cx={x} cy={y} r="3.5" fill="#15803d" />
                        ))}
                      </svg>
                    );
                  })()}

                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="order-meta">Blue: Revenue</span>
                    <span className="order-meta">Red: Cost</span>
                    <span className="order-meta">Green: Profit/Loss</span>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer" }} className="order-meta">
                      <input
                        type="checkbox"
                        checked={cumulativeChart}
                        onChange={(e) => setCumulativeChart(e.target.checked)}
                      />
                      Cumulative
                    </label>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="account-card">
              <h2 className="account-card-title">Return Requests</h2>
              <p className="section-subtitle">Review return request history and approve or reject pending refunds from a dedicated page.</p>
              <Link
                to="/dashboard/returns"
                style={{ display: "inline-block", marginTop: "1rem", textDecoration: "none" }}
              >
                <span className="btn-primary" style={{ display: "inline-block", padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}>
                  Open Return Requests →
                </span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
