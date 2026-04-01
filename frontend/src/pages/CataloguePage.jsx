import { Link } from "react-router-dom";
import ProductCatalogSection from "../components/ProductCatalogSection";

export default function CataloguePage({ onAddToCart, reviewsByProduct }) {
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
      <ProductCatalogSection onAddToCart={onAddToCart} reviewsByProduct={reviewsByProduct} />
    </main>
  );
}
