import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { approveComment, fetchPendingComments, rejectComment } from "../services/salesManagerApi";

export default function DashboardPage() {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = window.localStorage.getItem("auth_role");
  const isSalesManager = role === "SALES_MANAGER";

  useEffect(() => {
    if (!isSalesManager) {
      setLoading(false);
      return;
    }

    fetchPendingComments()
      .then(setPendingComments)
      .catch(() => setError("Failed to load pending comments."))
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
          <div className="account-card">
            <h2 className="account-card-title">Pending Comments</h2>

            {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

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
        )}
      </section>
    </main>
  );
}