import { useState } from "react";
import { products, CATEGORIES } from "../data/products";

function ProductCard({ product, onAddToCart }) {
  const outOfStock = product.stock === 0;

  return (
    <div className={`catalog-card${outOfStock ? " catalog-card--oos" : ""}`}>
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

      <div className="catalog-card-info">
        <p className="catalog-card-cat">{product.category}</p>
        <h3 className="catalog-card-title">{product.name}</h3>
        <p className="catalog-card-author">{product.author}</p>

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

export default function ProductCatalogSection({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="section-catalog">
      <div className="section-header">
        <div>
          <h2 className="section-title">The Collection</h2>
          <p className="section-subtitle">
            Exceptional titles, thoughtfully selected
          </p>
        </div>
        <a href="#" className="section-link">View all →</a>
      </div>

      <div className="catalog-tabs-wrap">
        <div className="catalog-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`catalog-tab${activeCategory === cat ? " catalog-tab--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
}