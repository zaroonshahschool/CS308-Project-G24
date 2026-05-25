import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CatalogPrice from "../components/CatalogPrice";
import { useToast } from "../components/useToast";
import { fetchLimitedEditionProducts } from "../services/catalogApi";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

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

function ProductCard({ product, onAddToCart, onToggleWishlist, wishlistProductIds }) {
  const outOfStock = product.stock === 0;
  const averageRating = Number(product.averageRating ?? 0);
  const hasRating = Number.isFinite(averageRating) && averageRating > 0;
  const filledStarCount = Math.max(1, Math.min(5, Math.round(averageRating)));
  const inWishlist = wishlistProductIds.includes(product.id);

  return (
    <div className={`catalog-card${outOfStock ? " catalog-card--oos" : ""}`}>
      <Link
        to={`/catalogue/${product.id}`}
        className="catalog-cover-link"
        aria-label={`View details for ${product.name}`}
      >
        <div className="catalog-cover-wrap">
          <WishlistButton
            active={inWishlist}
            onClick={(event) => {
              event.preventDefault();
              onToggleWishlist(product.id, product.name);
            }}
          />
          <img
            src={product.image}
            alt={product.name}
            className="catalog-cover"
            loading="lazy"
          />
          {outOfStock && (
            <div className="catalog-oos-badge">
              <span>Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="catalog-card-info">
        <p className="catalog-card-cat">{product.category}</p>
        <h3 className="catalog-card-title">
          <Link to={`/catalogue/${product.id}`} className="catalog-title-link">
            {product.name}
          </Link>
        </h3>
        <p className="catalog-card-author">{product.author}</p>

        <div className="catalog-rating-row">
          {hasRating ? (
            <>
              <span className="catalog-rating-stars" aria-hidden="true">
                {"★".repeat(filledStarCount)}
              </span>
              <span className="catalog-rating-text">
                {averageRating.toFixed(1)} average rating
              </span>
            </>
          ) : (
            <span className="catalog-rating-text">No ratings yet</span>
          )}
        </div>

        <div className="catalog-card-meta">
          <CatalogPrice product={product} />
          {!outOfStock && (
            <span className="catalog-card-stock">{product.stock} in stock</span>
          )}
        </div>

        <button
          className="catalog-add-btn"
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function LimitedEditionsPage({
  onAddToCart,
  onToggleWishlist,
  stockByProduct = {},
  wishlistProductIds = [],
}) {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchQuery = searchParams.get("search") ?? "";
  const sortOption = searchParams.get("sort") ?? "relevance";

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLimitedEditionProducts(sortOption);
        if (!ignore) setProducts(data);
      } catch (err) {
        if (!ignore) {
          const message = err.message || "Failed to load limited editions.";
          setError(message);
          toast.error(message, { title: "Limited Editions error" });
          setProducts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProducts();
    return () => { ignore = true; };
  }, [sortOption, toast]);

  function updateSearchParams(nextValues) {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (!value || value === "relevance") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    setSearchParams(nextParams, { replace: true });
  }

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    let result = products.map((product) => ({
      ...product,
      stock: stockByProduct[product.id] ?? product.stock,
    }));
    if (normalizedQuery) {
      result = result.filter((product) => {
        const text = `${product.name} ${product.author} ${product.category} ${product.description}`
          .toLowerCase().replace(/[^a-z0-9]+/g, " ");
        return text.includes(normalizedQuery);
      });
    }
    return result;
  }, [products, searchQuery, stockByProduct]);

  return (
    <main>
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <section className="section-catalog">
        <div className="section-header">
          <div>
            <h2 className="section-title">Limited Editions</h2>
            <p className="section-subtitle">
              Exclusive and rare editions — available in limited quantities.
            </p>
          </div>
        </div>

        <div className="catalog-toolbar">
          <label className="catalog-search">
            <span className="catalog-control-label">Search</span>
            <input
              type="search"
              className="catalog-search-input"
              placeholder="Search limited editions by name or description"
              value={searchQuery}
              onChange={(event) => updateSearchParams({ search: event.target.value })}
            />
          </label>

          <label className="catalog-sort">
            <span className="catalog-control-label">Sort by</span>
            <select
              className="catalog-sort-select"
              value={sortOption}
              onChange={(event) => updateSearchParams({ sort: event.target.value })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="catalog-results-summary">
          {loading
            ? "Loading results..."
            : `${visibleProducts.length} result${visibleProducts.length !== 1 ? "s" : ""}${searchQuery ? ` for "${searchQuery}"` : ""}`}
        </div>

        {error ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">Could not load limited editions</h3>
            <p className="catalog-empty-text">{error}</p>
          </div>
        ) : loading ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">Loading limited editions...</h3>
            <p className="catalog-empty-text">Please wait while the books are fetched.</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="catalog-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                wishlistProductIds={wishlistProductIds}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">No limited editions found</h3>
            <p className="catalog-empty-text">
              {searchQuery
                ? "Try a different search term."
                : "No limited edition books have been added yet."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
