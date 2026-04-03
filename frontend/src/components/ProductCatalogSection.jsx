import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CATEGORIES, products } from "../data/products";

const HASH_TO_CATEGORY = {
  "#fiction-filter": "Fiction",
  "#non-fiction-filter": "Non-Fiction",
};

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
];

function getCategoryButtonId(category) {
  return `${category.toLowerCase().replace(/\s+/g, "-")}-filter`;
}

function normalizeSearchValue(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getPopularityScore(reviews) {
  if (reviews.length === 0) return 0;

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return reviews.length * 20 + averageRating;
}

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

function ProductCard({ product, onAddToCart, onToggleWishlist, reviews, wishlistProductIds }) {
  const outOfStock = product.stock === 0;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;
  const inWishlist = wishlistProductIds.includes(product.id);

  return (
    <div className={`catalog-card${outOfStock ? " catalog-card--oos" : ""}`}>
      <Link to={`/catalogue/${product.id}`} className="catalog-cover-link" aria-label={`View details for ${product.name}`}>
        <div className="catalog-cover-wrap">
          <WishlistButton active={inWishlist} onClick={(event) => {
            event.preventDefault();
            onToggleWishlist(product.id);
          }} />
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
          {averageRating ? (
            <>
              <span className="catalog-rating-stars" aria-hidden="true">{"\u2605".repeat(Math.round(averageRating))}</span>
              <span className="catalog-rating-text">{averageRating.toFixed(1)} | {reviews.length} rating{reviews.length !== 1 ? "s" : ""}</span>
            </>
          ) : (
            <span className="catalog-rating-text">No ratings yet</span>
          )}
        </div>

        <div className="catalog-card-meta">
          <span className="catalog-card-price">${product.price.toFixed(2)}</span>
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

export default function ProductCatalogSection({
  onAddToCart,
  onToggleWishlist,
  reviewsByProduct = {},
  stockByProduct = {},
  wishlistProductIds = [],
}) {
  const { hash } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");

  const searchQuery = searchParams.get("search") ?? "";
  const sortOption = searchParams.get("sort") ?? "relevance";

  useEffect(() => {
    const nextCategory = HASH_TO_CATEGORY[hash];

    if (!nextCategory) return;

    setActiveCategory(nextCategory);

    requestAnimationFrame(() => {
      document.getElementById(getCategoryButtonId(nextCategory))?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    });
  }, [hash]);

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
    const normalizedQuery = normalizeSearchValue(searchQuery);

    let result =
      activeCategory === "All"
        ? products.map((product) => ({ ...product, stock: stockByProduct[product.id] ?? product.stock }))
        : products
            .filter((product) => product.category === activeCategory)
            .map((product) => ({ ...product, stock: stockByProduct[product.id] ?? product.stock }));

    if (normalizedQuery) {
      result = result.filter((product) => {
        const searchableText = normalizeSearchValue(
          `${product.name} ${product.author} ${product.category} ${product.description}`
        );

        return searchableText.includes(normalizedQuery);
      });
    }

    if (sortOption === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "popularity") {
      result.sort((a, b) => {
        const popularityA = getPopularityScore(reviewsByProduct[a.id] ?? []);
        const popularityB = getPopularityScore(reviewsByProduct[b.id] ?? []);
        return popularityB - popularityA;
      });
    }

    return result;
  }, [activeCategory, reviewsByProduct, searchQuery, sortOption, stockByProduct]);

  return (
    <section className="section-catalog">
      <div className="section-header">
        <div>
          <h2 className="section-title">The Collection</h2>
          <p className="section-subtitle">
            Search by title or description, then sort by price or popularity.
          </p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="catalog-control-label">Search</span>
          <input
            type="search"
            className="catalog-search-input"
            placeholder="Search editions by name or description"
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
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="catalog-results-summary">
        {visibleProducts.length} result{visibleProducts.length !== 1 ? "s" : ""}
        {searchQuery ? ` for "${searchQuery}"` : ""}
      </div>

      <div className="catalog-tabs-wrap">
        <div className="catalog-tabs">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              id={getCategoryButtonId(category)}
              className={`catalog-tab${activeCategory === category ? " catalog-tab--active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="catalog-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              reviews={reviewsByProduct[product.id] ?? []}
              wishlistProductIds={wishlistProductIds}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty-state">
          <h3 className="catalog-empty-title">No matching editions found</h3>
          <p className="catalog-empty-text">Try a different title keyword, broader description term, or another sort option.</p>
        </div>
      )}
    </section>
  );
}
