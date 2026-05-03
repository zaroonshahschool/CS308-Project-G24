import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { approveComment, fetchPendingComments, rejectComment } from "../services/salesManagerApi";

export default function CommentModerationPage() {
  const toast = useToast();
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetchPendingComments()
      .then(setPendingComments)
      .catch((err) => {
        const message = err.message || "Failed to load pending comments.";
        setError(message);
        toast.error(message, { title: "Load error" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleApprove(commentId) {
    setActingId(commentId);
    try {
      await approveComment(commentId);
      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
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
      setPendingComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.info("Comment rejected.", { title: "Moderation updated" });
    } catch {
      toast.error("Failed to reject comment.", { title: "Moderation error" });
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/dashboard" className="breadcrumb-link">← Back to Dashboard</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Comment Moderation</h1>
          <p className="section-subtitle">
            Review customer comments awaiting approval. Approved comments become visible on product pages.
          </p>
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        {loading && <p className="section-subtitle">Loading pending comments...</p>}
        {!loading && pendingComments.length === 0 && (
          <p className="section-subtitle">No pending comments — the queue is clear.</p>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {pendingComments.map((comment) => (
            <article key={comment.id} className="order-card">
              <div className="order-card-head">
                <div>
                  <p className="order-item-name">{comment.productName}</p>
                  <p className="order-meta">
                    by {comment.customerName} · {comment.createdAt?.slice(0, 10)}
                  </p>
                </div>
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
              </div>
              <p className="review-card-comment" style={{ marginTop: "0.75rem" }}>{comment.content}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
