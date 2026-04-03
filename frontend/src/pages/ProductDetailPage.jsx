import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById, products } from "../data/products";

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
          <p className="review-card-name">{review.reviewer}</p>
          <p className="review-card-date">{review.submittedAt}</p>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      <p className="review-card-comment">{review.comment}</p>
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
  onSubmitReview,
  onToggleWishlist,
  reviewsByProduct,
  stockByProduct,
  wishlistProductIds,
}) {
  const { productId } = useParams();
  const baseProduct = getProductById(productId);
  const product = baseProduct
    ? { ...baseProduct, stock: stockByProduct[baseProduct.id] ?? baseProduct.stock }
    : null;
  const [formState, setFormState] = useState({
    reviewer: "",
    rating: 5,
    comment: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const productReviews = reviewsByProduct[Number(productId)] ?? [];
  const approvedReviews = useMemo(
    () => productReviews.filter((review) => review.status === "approved"),
    [productReviews]
  );
  const averageRating = productReviews.length
    ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
    : 0;
  const relatedProducts = products
    .filter((candidate) => candidate.category === product?.category && candidate.id !== product?.id)
    .slice(0, 3)
    .map((candidate) => ({ ...candidate, stock: stockByProduct[candidate.id] ?? candidate.stock }));
  const inWishlist = product ? wishlistProductIds.includes(product.id) : false;

  if (!product) {
    return (
      <main className="product-detail-page">
        <div className="catalogue-breadcrumb">
          <Link to="/catalogue" className="breadcrumb-link">Back to Catalogue</Link>
        </div>
        <section className="product-missing">
          <h1 className="section-title">Edition not found</h1>
          <p className="section-subtitle">The title you requested could not be located in the current catalogue.</p>
        </section>
      </main>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmitReview(product.id, formState);
    setFormState({
      reviewer: "",
      rating: 5,
      comment: "",
    });
    setIsSubmitted(true);
  }

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
            <RatingStars rating={Math.round(averageRating || 0)} />
            <span className="product-detail-rating-text">
              {productReviews.length
                ? `${averageRating.toFixed(1)} average from ${productReviews.length} rating${productReviews.length !== 1 ? "s" : ""}`
                : "No ratings yet"}
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
            <div>
              <dt>Model</dt>
              <dd>{product.model}</dd>
            </div>
            <div>
              <dt>Serial Number</dt>
              <dd>{product.serialNumber}</dd>
            </div>
            <div>
              <dt>Warranty Status</dt>
              <dd>{product.warrantyStatus}</dd>
            </div>
            <div>
              <dt>Distributor</dt>
              <dd>{product.distributor}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="product-detail-reviews">
        <div className="product-detail-section-head">
          <div>
            <p className="section-tag">Requirement 5</p>
            <h2 className="section-title">Ratings & Comments</h2>
          </div>
          <p className="section-subtitle">Ratings are counted immediately. Comments remain hidden until manager approval.</p>
        </div>

        <div className="product-review-layout">
          <div className="review-list">
            {approvedReviews.length > 0 ? (
              approvedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="review-empty">
                <p className="review-empty-title">No approved comments yet</p>
                <p className="review-empty-text">Be the first reader to leave a rating for this edition.</p>
              </div>
            )}
          </div>

          <form className="review-form" onSubmit={handleSubmit}>
            <h3 className="review-form-title">Leave your rating</h3>
            <label className="review-field">
              <span>Your name</span>
              <input
                type="text"
                name="reviewer"
                value={formState.reviewer}
                onChange={handleChange}
                required
              />
            </label>

            <label className="review-field">
              <span>Rating</span>
              <select name="rating" value={formState.rating} onChange={handleChange}>
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </label>

            <label className="review-field">
              <span>Comment</span>
              <textarea
                name="comment"
                value={formState.comment}
                onChange={handleChange}
                rows="5"
                placeholder="Share what stood out about this edition."
              />
            </label>

            <button type="submit" className="btn-primary">Submit Rating</button>
            {isSubmitted && (
              <p className="review-form-note">
                Your rating was saved. If you included a comment, it is now pending manager approval before becoming public.
              </p>
            )}
          </form>
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
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} to={`/catalogue/${relatedProduct.id}`} className="related-product-card">
                <img src={relatedProduct.image} alt={relatedProduct.name} className="related-product-image" />
                <p className="catalog-card-cat">{relatedProduct.category}</p>
                <h3 className="catalog-card-title">{relatedProduct.name}</h3>
                <p className="catalog-card-author">{relatedProduct.author}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
