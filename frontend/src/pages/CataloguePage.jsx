import ProductCatalogSection from "../components/ProductCatalogSection";

export default function CataloguePage({ onAddToCart }) {
  return (
    <main>
      <ProductCatalogSection onAddToCart={onAddToCart} />
    </main>
  );
}