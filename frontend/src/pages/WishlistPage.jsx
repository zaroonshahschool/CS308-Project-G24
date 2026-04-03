import { Link } from "react-router-dom";
import { products } from "../data/products";

export default function WishlistPage({ onAddToCart, onToggleWishlist, stockByProduct, wishlistProductIds }) {
  const wishlistProducts = products
    .filter((product) => wishlistProductIds.includes(product.id))
    .map((product) => ({ ...product, stock: stockByProduct[product.id] ?? product.stock }));

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">Back to Home</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <div>
            <p className="section-tag">Customer Tools</p>
            <h1 className="section-title">Wishlist</h1>
          </div>
          <p className="section-subtitle">Saved editions stay here so customers can revisit them later.</p>
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="wishlist-grid">
            {wishlistProducts.map((product) => (
              <article key={product.id} className="wishlist-card">
                <Link to={`/catalogue/${product.id}`} className="wishlist-image-link">
                  <img src={product.image} alt={product.name} className="wishlist-image" />
                </Link>
                <div className="wishlist-content">
                  <p className="catalog-card-cat">{product.category}</p>
                  <h2 className="catalog-card-title">
                    <Link to={`/catalogue/${product.id}`} className="catalog-title-link">{product.name}</Link>
                  </h2>
                  <p className="catalog-card-author">{product.author}</p>
                  <p className="wishlist-stock">{product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"}</p>
                  <div className="wishlist-actions">
                    <button className="btn-dark" disabled={product.stock === 0} onClick={() => onAddToCart(product)}>
                      {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                    </button>
                    <button className="wishlist-secondary-btn" onClick={() => onToggleWishlist(product.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="customer-empty">
            <h2 className="customer-empty-title">No saved editions yet</h2>
            <p className="customer-empty-text">Use the heart on a catalogue card to save a title to the customer wishlist.</p>
          </div>
        )}
      </section>
    </main>
  );
}
