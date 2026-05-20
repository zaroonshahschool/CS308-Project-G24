import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { approveComment, fetchAllComments, rejectComment } from "../services/salesManagerApi";

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  color: "#b45309", bg: "#fef3c7" },
  APPROVED: { label: "Approved", color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      padding: "0.2rem 0.55rem",
      borderRadius: "9999px",
      color: cfg.color,
      background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  );
}

export default function CommentModerationPage() {
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchAllComments()
      .then(setComments)
      .catch((err) => {
        const message = err.message || "Failed to load comments.";
        setError(message);
        toast.error(message, { title: "Load error" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleApprove(commentId) {
    setActingId(commentId);
    try {
      await approveComment(commentId);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, status: "APPROVED" } : c));
      toast.success("Comment approved.", { title: "Moderation updated" });
    } catch {
      toast.error("Failed to approve comment.", { title: "Moderation error" });
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(commentId) {
    setActingId(commentId);
    try {
      await rejectComment(commentId);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, status: "REJECTED" } : c));
      toast.info("Comment rejected.", { title: "Moderation updated" });
    } catch {
      toast.error("Failed to reject comment.", { title: "Moderation error" });
    } finally {
      setActingId(null);
    }
  }

  const filtered = filter === "ALL" ? comments : comments.filter((c) => c.status === filter);

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/dashboard" className="breadcrumb-link">← Back to Dashboard</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Comment Moderation</h1>
          <p className="section-subtitle">
            Review and moderate customer comments. All statuses are retained for the audit trail.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={filter === s ? "btn-primary" : "wishlist-secondary-btn"}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
            >
              {s === "ALL" ? "All" : STATUS_CONFIG[s].label}
              {" "}({s === "ALL" ? comments.length : comments.filter((c) => c.status === s).length})
            </button>
          ))}
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        {loading && <p className="section-subtitle">Loading comments...</p>}
        {!loading && filtered.length === 0 && (
          <p className="section-subtitle">No comments match this filter.</p>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {filtered.map((comment) => (
            <article key={comment.id} className="order-card">
              <div className="order-card-head">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <p className="order-item-name" style={{ margin: 0 }}>{comment.productName}</p>
                    <StatusBadge status={comment.status} />
                    {comment.edited && (
                      <span style={{ fontSize: "0.7rem", color: "#6b7280", fontStyle: "italic" }}>edited</span>
                    )}
                  </div>
                  <p className="order-meta">
                    by {comment.customerName} · {comment.createdAt?.slice(0, 10)}
                    {comment.updatedAt && (
                      <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
                        (last edited {comment.updatedAt.slice(0, 10)})
                      </span>
                    )}
                  </p>
                </div>
                {comment.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleApprove(comment.id)}
                      disabled={actingId === comment.id}
                    >
                      {actingId === comment.id ? "..." : "Approve"}
                    </button>
                    <button
                      className="wishlist-secondary-btn"
                      onClick={() => handleReject(comment.id)}
                      disabled={actingId === comment.id}
                    >
                      {actingId === comment.id ? "..." : "Reject"}
                    </button>
                  </div>
                )}
                {comment.status === "APPROVED" && (
                  <button
                    className="wishlist-secondary-btn"
                    onClick={() => handleReject(comment.id)}
                    disabled={actingId === comment.id}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {actingId === comment.id ? "..." : "Revoke"}
                  </button>
                )}
                {comment.status === "REJECTED" && (
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(comment.id)}
                    disabled={actingId === comment.id}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {actingId === comment.id ? "..." : "Re-approve"}
                  </button>
                )}
              </div>
              <p className="review-card-comment" style={{ marginTop: "0.75rem" }}>{comment.content}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
