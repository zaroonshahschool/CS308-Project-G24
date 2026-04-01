import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { products, CATEGORIES } from "../data/products";

const HASH_TO_CATEGORY = {
  "#fiction-filter": "Fiction",
  "#non-fiction-filter": "Non-Fiction",
};

function getCategoryButtonId(category) {
  return `${category.toLowerCase().replace(/\s+/g, "-")}-filter`;
}

function ProductCard({ product, onAddToCart, reviews }) {
  const outOfStock = product.stock === 0;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return (
    <div className={`catalog-card${outOfStock ? " catalog-card--oos" : ""}`}>
      <Link to={`/catalogue/${product.id}`} className="catalog-cover-link" aria-label={`View details for ${product.name}`}>
        <div className="catalog-cover-wrap">
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

export default function ProductCatalogSection({ onAddToCart, reviewsByProduct = {} }) {
  const { hash } = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");

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

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <section className="section-catalog">
      <div className="section-header">
        <div>
          <h2 className="section-title">The Collection</h2>
          <p className="section-subtitle">
            Exceptional titles, thoughtfully selected
          </p>
        </div>
        <a href="#" className="section-link">View all</a>
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

      <div className="catalog-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            reviews={reviewsByProduct[product.id] ?? []}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}
