import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchCollectionById } from "../services/collectionsApi";

function WishlistButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`wishlist-toggle${active ? " wishlist-toggle--active" : ""}`}
      onClick={onClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function ProductCard({ product, onAddToCart, onToggleWishlist, wishlistProductIds, stockByProduct }) {
  const stock = stockByProduct[product.id] ?? product.stock;
  const outOfStock = stock === 0;
  const averageRating = Number(product.averageRating ?? 0);
  const hasRating = Number.isFinite(averageRating) && averageRating > 0;
  const filledStarCount = Math.max(1, Math.min(5, Math.round(averageRating)));
  const inWishlist = wishlistProductIds.includes(product.id);

  return (
    <div className={`catalog-card${outOfStock ? " catalog-card--oos" : ""}`}>
      <Link to={`/catalogue/${product.id}`} className="catalog-cover-link" aria-label={`View details for ${product.name}`}>
        <div className="catalog-cover-wrap">
          <WishlistButton
            active={inWishlist}
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id, product.name); }}
          />
          <img src={product.image} alt={product.name} className="catalog-cover" loading="lazy" />
          {outOfStock && <div className="catalog-oos-badge"><span>Out of Stock</span></div>}
        </div>
      </Link>
      <div className="catalog-card-info">
        <p className="catalog-card-cat">{product.category}</p>
        <h3 className="catalog-card-title">
          <Link to={`/catalogue/${product.id}`} className="catalog-title-link">{product.name}</Link>
        </h3>
        <p className="catalog-card-author">{product.author}</p>
        <div className="catalog-rating-row">
          {hasRating ? (
            <>
              <span className="catalog-rating-stars" aria-hidden="true">{"★".repeat(filledStarCount)}</span>
              <span className="catalog-rating-text">{averageRating.toFixed(1)} average rating</span>
            </>
          ) : (
            <span className="catalog-rating-text">No ratings yet</span>
          )}
        </div>
        <div className="catalog-card-meta">
          <span className="catalog-card-price">${product.price.toFixed(2)}</span>
          {!outOfStock && <span className="catalog-card-stock">{stock} in stock</span>}
        </div>
        <button
          className="catalog-add-btn"
          disabled={outOfStock}
          onClick={() => onAddToCart({ ...product, stock })}
          aria-label={`Add ${product.name} to cart`}
        >
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function CollectionDetailPage({ onAddToCart, onToggleWishlist, stockByProduct = {}, wishlistProductIds = [] }) {
  const { id } = useParams();
  const toast = useToast();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchCollectionById(id);
        if (!ignore) setCollection(data);
      } catch (err) {
        if (!ignore) toast.error(err.message || "Failed to load collection.", { title: "Collection error" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [id, toast]);

  return (
    <main>
      <div className="catalogue-breadcrumb">
        <Link to="/collections" className="breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Collections
        </Link>
      </div>

      <section className="section-catalog">
        {loading ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">Loading collection...</h3>
          </div>
        ) : !collection ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">Collection not found</h3>
          </div>
        ) : (
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title">{collection.name}</h2>
                {collection.description && (
                  <p className="section-subtitle">{collection.description}</p>
                )}
              </div>
            </div>

            <div className="catalog-results-summary">
              {collection.products.length} {collection.products.length === 1 ? "book" : "books"} in this collection
            </div>

            {collection.products.length === 0 ? (
              <div className="catalog-empty-state">
                <h3 className="catalog-empty-title">No books in this collection yet</h3>
              </div>
            ) : (
              <div className="catalog-grid">
                {collection.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    wishlistProductIds={wishlistProductIds}
                    stockByProduct={stockByProduct}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
