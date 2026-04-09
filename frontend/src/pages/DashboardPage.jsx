import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  advanceOrderStatus,
  approveComment,
  fetchOrders,
  fetchPendingComments,
  rejectComment,
} from "../services/salesManagerApi";

function normalizeOrderStatus(status) {
  return (status || "PROCESSING").toLowerCase().replace(/_/g, "-");
}

export default function DashboardPage() {
  const [pendingComments, setPendingComments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [actingOrderId, setActingOrderId] = useState(null);

  const role = window.localStorage.getItem("auth_role");
  const isSalesManager = role === "SALES_MANAGER";

  useEffect(() => {
    if (!isSalesManager) {
      setLoading(false);
      return;
    }

    Promise.all([fetchPendingComments(), fetchOrders()])
      .then(([comments, orderData]) => {
        setPendingComments(comments);
        setOrders(orderData);
      })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [isSalesManager]);

  async function handleApprove(commentId) {
    try {
      await approveComment(commentId);
      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError("Failed to approve comment.");
    }
  }

  async function handleReject(commentId) {
    try {
      await rejectComment(commentId);
      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError("Failed to reject comment.");
    }
  }

  async function handleAdvanceOrder(orderId) {
    setOrderError("");
    setActingOrderId(orderId);

    try {
      const updatedOrder = await advanceOrderStatus(orderId);
      setOrders((prev) =>
        prev.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order))
      );
    } catch (advanceError) {
      setOrderError(advanceError.message || "Failed to advance order status.");
    } finally {
      setActingOrderId(null);
    }
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">Back to Home</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Sales Manager Dashboard</h1>
          <p className="section-subtitle">Review and moderate customer comments before they become public.</p>
        </div>

        {!isSalesManager && (
          <p className="section-subtitle">You do not have permission to view this page.</p>
        )}

        {isSalesManager && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="account-card">
              <h2 className="account-card-title">Order Progression</h2>

              {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
              {orderError && <p style={{ color: "red", marginBottom: "1rem" }}>{orderError}</p>}

              {loading && <p className="section-subtitle">Loading...</p>}

              {!loading && orders.length === 0 && (
                <p className="section-subtitle">No orders found.</p>
              )}

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
              <h2 className="account-card-title">Pending Comments</h2>

              {loading && <p className="section-subtitle">Loading...</p>}

              {!loading && pendingComments.length === 0 && (
                <p className="section-subtitle">No pending comments.</p>
              )}

              {pendingComments.map((comment) => (
                <article key={comment.id} className="order-card" style={{ marginBottom: "1rem" }}>
                  <div className="order-card-head">
                    <div>
                      <p className="order-item-name">{comment.productName}</p>
                      <p className="order-meta">by {comment.customerName} · {comment.createdAt?.slice(0, 10)}</p>
                    </div>
                    <div className="order-item-actions" style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-primary" onClick={() => handleApprove(comment.id)}>
                        Approve
                      </button>
                      <button className="wishlist-secondary-btn" onClick={() => handleReject(comment.id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                  <p className="review-card-comment" style={{ marginTop: "0.75rem" }}>{comment.content}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
