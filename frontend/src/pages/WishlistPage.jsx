import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchProducts } from "../services/catalogApi";

export default function WishlistPage({ onAddToCart, onToggleWishlist, stockByProduct, wishlistProductIds }) {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts();
        if (ignore) return;
        setProducts(data);
      } catch (err) {
        if (!ignore) {
          const message = err.message || "Failed to load wishlist products.";
          setError(message);
          setProducts([]);
          toast.error(message, { title: "Wishlist error" });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [toast]);

  const wishlistProducts = useMemo(
    () =>
      products
        .filter((product) => wishlistProductIds.includes(product.id))
        .map((product) => ({ ...product, stock: stockByProduct[product.id] ?? product.stock })),
    [products, stockByProduct, wishlistProductIds]
  );

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

        {error ? (
          <div className="customer-empty">
            <h2 className="customer-empty-title">Wishlist could not be loaded</h2>
            <p className="customer-empty-text">{error}</p>
          </div>
        ) : loading ? (
          <div className="customer-empty">
            <h2 className="customer-empty-title">Loading wishlist...</h2>
            <p className="customer-empty-text">Fetching saved books from the database.</p>
          </div>
        ) : wishlistProducts.length > 0 ? (
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
                    <button className="wishlist-secondary-btn" onClick={() => onToggleWishlist(product.id, product.name)}>
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
