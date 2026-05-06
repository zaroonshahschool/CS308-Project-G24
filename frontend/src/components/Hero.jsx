import { Link } from "react-router-dom";

function formatPrice(price) {
  return typeof price === "number" ? `$${price.toFixed(2)}` : "";
}

export default function Hero({ hero }) {
  if (!hero) {
    return (
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">Masterpiece Edition</span>

            <span className="placeholder-bar hero-title-ph" />
            <span className="placeholder-bar hero-title-ph-2" />

            <div className="hero-desc-block">
              <span className="placeholder-bar hero-desc-ph" style={{ width: "100%" }} />
              <span className="placeholder-bar hero-desc-ph" style={{ width: "90%" }} />
              <span className="placeholder-bar hero-desc-ph" />
            </div>

            <div className="hero-cta-row">
              <Link to="/catalogue" className="btn-primary">Explore Edition</Link>
              <span className="placeholder-bar price-ph" />
            </div>
          </div>

          <div className="hero-book-wrap">
            <div className="hero-book">
              <span className="book-ph-line" />
              <span className="book-ph-line short" />
              <span className="book-ph-line" />
              <span className="book-ph-line short" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-badge">{hero.badge}</span>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-description">{hero.description}</p>

          <div className="hero-cta-row">
            <Link to={hero.ctaHref ?? "/catalogue"} className="btn-primary">
              {hero.ctaLabel ?? "Explore Edition"}
            </Link>
            {hero.price != null && <span className="hero-price">{formatPrice(hero.price)}</span>}
          </div>
        </div>

        <div className="hero-book-wrap">
          <div className="hero-book">
            <img src={hero.coverImage} alt={hero.title} className="hero-book-image" />
          </div>
        </div>
      </div>
    </section>
  );
}
