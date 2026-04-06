import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductById, fetchProducts } from "../services/catalogApi";
import { fetchApprovedComments, rateProduct, submitComment } from "../services/reviewApi";

function RatingStars({ rating }) {
  return (
    <span className="detail-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? "detail-star detail-star--filled" : "detail-star"}>
          {"\u2605"}
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-card-head">
        <div>
          <p className="review-card-name">{review.customerName}</p>
          <p className="review-card-date">{review.createdAt?.slice(0, 10)}</p>
        </div>
      </div>
      <p className="review-card-comment">{review.content}</p>
    </article>
  );
}

function WishlistButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`wishlist-toggle wishlist-toggle--detail${active ? " wishlist-toggle--active" : ""}`}
      onClick={onClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

export default function ProductDetailPage({
  onAddToCart,
  onToggleWishlist,
  stockByProduct,
  wishlistProductIds,
}) {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [approvedComments, setApprovedComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [ratingScore, setRatingScore] = useState(5);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingError, setRatingError] = useState("");

  const [commentContent, setCommentContent] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  const isLoggedIn = !!window.localStorage.getItem("auth_token");

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const dbProduct = await fetchProductById(productId);
        if (ignore) return;

        setProduct({ ...dbProduct, stock: stockByProduct[dbProduct.id] ?? dbProduct.stock });

        const categoryProducts = await fetchProducts(dbProduct.category);
        if (ignore) return;

        setRelatedProducts(
          categoryProducts
            .filter((p) => p.id !== dbProduct.id)
            .slice(0, 3)
            .map((p) => ({ ...p, stock: stockByProduct[p.id] ?? p.stock }))
        );
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load product.");
          setProduct(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProduct();
    return () => { ignore = true; };
  }, [productId, stockByProduct]);

  useEffect(() => {
    fetchApprovedComments(productId)
      .then(setApprovedComments)
      .catch(() => {});
  }, [productId]);

  async function handleRatingSubmit(event) {
    event.preventDefault();
    setRatingMessage("");
    setRatingError("");
    try {
      const result = await rateProduct(productId, ratingScore);
      setAverageRating(result.averageRating);
      setRatingMessage("Your rating has been saved.");
    } catch (err) {
      setRatingError(err.message || "Failed to submit rating.");
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    setCommentMessage("");
    setCommentError("");
    try {
      await submitComment(productId, commentContent);
      setCommentContent("");
      setCommentMessage("Your comment is pending manager approval.");
    } catch (err) {
      setCommentError(err.message || "Failed to submit comment.");
    }
  }

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="catalogue-breadcrumb">
          <Link to="/catalogue" className="breadcrumb-link">Back to Catalogue</Link>
        </div>
        <section className="product-missing">
          <h1 className="section-title">Loading edition...</h1>
          <p className="section-subtitle">Fetching this book from the database.</p>
        </section>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="catalogue-breadcrumb">
          <Link to="/catalogue" className="breadcrumb-link">Back to Catalogue</Link>
        </div>
        <section className="product-missing">
          <h1 className="section-title">Edition not found</h1>
          <p className="section-subtitle">{error || "The title you requested could not be located."}</p>
        </section>
      </main>
    );
  }

  const inWishlist = wishlistProductIds.includes(product.id);

  return (
    <main className="product-detail-page">
      <div className="catalogue-breadcrumb">
        <Link to="/catalogue" className="breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Catalogue
        </Link>
      </div>

      <section className="product-detail-hero">
        <div className="product-detail-media">
          <img src={product.image} alt={product.name} className="product-detail-image" />
        </div>

        <div className="product-detail-copy">
          <div className="product-detail-headline">
            <div>
              <p className="product-detail-kicker">{product.category}</p>
              <h1 className="product-detail-title">{product.name}</h1>
              <p className="product-detail-author">by {product.author}</p>
            </div>
            <WishlistButton active={inWishlist} onClick={() => onToggleWishlist(product.id)} />
          </div>

          <div className="product-detail-rating-summary">
            <RatingStars rating={Math.round(averageRating)} />
            <span className="product-detail-rating-text">
              {averageRating > 0 ? `${averageRating.toFixed(1)} average rating` : "No ratings yet"}
            </span>
          </div>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-purchase">
            <div>
              <p className="product-detail-price">${product.price.toFixed(2)}</p>
              <p className="product-detail-stock">
                {product.stock > 0 ? `${product.stock} copies currently in stock` : "Currently out of stock"}
              </p>
            </div>
            <button
              className="btn-dark"
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Unavailable" : "Add to Cart"}
            </button>
          </div>

          <dl className="product-detail-specs">
            <div><dt>Model</dt><dd>{product.model || "—"}</dd></div>
            <div><dt>Serial Number</dt><dd>{product.serialNumber || "—"}</dd></div>
            <div><dt>Warranty Status</dt><dd>{product.warrantyStatus || "—"}</dd></div>
            <div><dt>Distributor</dt><dd>{product.distributor || "—"}</dd></div>
          </dl>
        </div>
      </section>

      <section className="product-detail-reviews">
        <div className="product-detail-section-head">
          <div>
            <h2 className="section-title">Ratings & Comments</h2>
          </div>
          <p className="section-subtitle">Ratings are counted immediately. Comments are visible after manager approval.</p>
        </div>

        <div className="product-review-layout">
          <div className="review-list">
            {approvedComments.length > 0 ? (
              approvedComments.map((comment) => <ReviewCard key={comment.id} review={comment} />)
            ) : (
              <div className="review-empty">
                <p className="review-empty-title">No approved comments yet</p>
                <p className="review-empty-text">Be the first to leave a comment for this edition.</p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {isLoggedIn ? (
              <>
                <form className="review-form" onSubmit={handleRatingSubmit}>
                  <h3 className="review-form-title">Rate this product</h3>
                  <label className="review-field">
                    <span>Your Rating</span>
                    <select value={ratingScore} onChange={(e) => setRatingScore(Number(e.target.value))}>
                      <option value={5}>5 stars</option>
                      <option value={4}>4 stars</option>
                      <option value={3}>3 stars</option>
                      <option value={2}>2 stars</option>
                      <option value={1}>1 star</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary">Submit Rating</button>
                  {ratingMessage && <p className="review-form-note">{ratingMessage}</p>}
                  {ratingError && <p style={{ color: "red" }}>{ratingError}</p>}
                </form>

                <form className="review-form" onSubmit={handleCommentSubmit}>
                  <h3 className="review-form-title">Leave a comment</h3>
                  <label className="review-field">
                    <span>Comment</span>
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      rows="5"
                      placeholder="Share your thoughts about this edition."
                      required
                    />
                  </label>
                  <button type="submit" className="btn-primary">Submit Comment</button>
                  {commentMessage && <p className="review-form-note">{commentMessage}</p>}
                  {commentError && <p style={{ color: "red" }}>{commentError}</p>}
                </form>
              </>
            ) : (
              <div className="review-form">
                <p className="review-empty-title">Login required</p>
                <p className="review-empty-text">You must be logged in to rate or comment on products.</p>
                <Link to="/login" className="btn-primary" style={{ display: "inline-block", marginTop: "0.75rem" }}>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="product-detail-section-head">
            <div>
              <p className="section-tag">Continue Browsing</p>
              <h2 className="section-title">More in {product.category}</h2>
            </div>
          </div>
          <div className="related-products-grid">
            {relatedProducts.map((related) => (
              <Link key={related.id} to={`/catalogue/${related.id}`} className="related-product-card">
                <img src={related.image} alt={related.name} className="related-product-image" />
                <p className="catalog-card-cat">{related.category}</p>
                <h3 className="catalog-card-title">{related.name}</h3>
                <p className="catalog-card-author">{related.author}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}