import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { deleteRating, fetchAllRatings } from "../services/adminApi";

function StarBadge({ score }) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 600, fontSize: "0.85rem" }}
      aria-label={`${score} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < score ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
      <span style={{ marginLeft: "0.25rem", color: "#6b7280" }}>{score}/5</span>
    </span>
  );
}

export default function RatingModerationPage() {
  const toast = useToast();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAllRatings()
      .then(setRatings)
      .catch((err) => {
        const message = err.message || "Failed to load ratings.";
        setError(message);
        toast.error(message, { title: "Load error" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleDelete(ratingId) {
    setDeletingId(ratingId);
    try {
      await deleteRating(ratingId);
      setRatings((prev) => prev.filter((r) => r.id !== ratingId));
      toast.info("Rating removed.", { title: "Rating deleted" });
    } catch (err) {
      toast.error(err.message || "Failed to delete rating.", { title: "Delete error" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/product-manager" className="breadcrumb-link">← Back to Product Manager</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Rating Moderation</h1>
          <p className="section-subtitle">
            View all product ratings submitted by customers. Remove a rating if it violates store policy.
          </p>
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        {loading && <p className="section-subtitle">Loading ratings...</p>}
        {!loading && ratings.length === 0 && (
          <p className="section-subtitle">No ratings have been submitted yet.</p>
        )}

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {ratings.map((rating) => (
            <article key={rating.id} className="order-card">
              <div className="order-card-head">
                <div>
                  <p className="order-item-name">{rating.productName}</p>
                  <p className="order-meta">
                    {rating.customerName} · {rating.userEmail} · {rating.createdAt?.slice(0, 10)}
                  </p>
                  <div style={{ marginTop: "0.35rem" }}>
                    <StarBadge score={rating.score} />
                  </div>
                </div>
                <button
                  className="wishlist-secondary-btn"
                  onClick={() => handleDelete(rating.id)}
                  disabled={deletingId === rating.id}
                  style={{ alignSelf: "flex-start" }}
                >
                  {deletingId === rating.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
