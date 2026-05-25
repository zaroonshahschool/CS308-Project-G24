export default function CatalogPrice({ product }) {
  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);
  const discountRate = Number(product.discountRate);
  const hasActiveDiscount = discountRate > 0 && originalPrice > price;

  return (
    <div className="catalog-card-pricing">
      <div className="catalog-card-price-row">
        <span className="catalog-card-price">${price.toFixed(2)}</span>
        {hasActiveDiscount ? (
          <span className="catalog-card-discount-badge">{discountRate.toFixed(0)}% off</span>
        ) : null}
      </div>
      {hasActiveDiscount ? (
        <span className="catalog-card-original-price">Was ${originalPrice.toFixed(2)}</span>
      ) : null}
    </div>
  );
}
