import { Link } from "react-router-dom";

function formatPrice(price) {
  return typeof price === "number" ? `$${price.toFixed(2)}` : "";
}

export default function EditorsChoice({ selection }) {
  if (!selection) {
    return (
      <section className="section-editors">
        <div className="editors-inner">
          <div className="editors-visual">
            <div className="editors-books">
              <div className="editors-book-back" />
              <div className="editors-book-front">
                <span className="ed-book-ph-line" />
                <span className="ed-book-ph-line short" />
                <span className="ed-book-ph-line" />
                <span className="ed-book-ph-line short" />
              </div>
            </div>
          </div>

          <div className="editors-content">
            <div className="editors-tag">
              <span>✦</span> Editor's Choice
            </div>

            <span className="content-ph title-lg" />
            <span className="content-ph title-lg-2" />
            <span className="content-ph desc" />
            <span className="content-ph desc" />
            <span className="content-ph desc-short" />

            <div className="editors-features-ph">
              <span className="content-ph feature" />
              <span className="content-ph feature" style={{ width: "50%" }} />
              <span className="content-ph feature" style={{ width: "70%" }} />
            </div>

            <span className="btn-dark">View Details</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-editors">
      <div className="editors-inner">
        <div className="editors-visual">
          <div className="editors-books">
            <div className="editors-book-back" />
            <div className="editors-book-front">
              <img src={selection.coverImage} alt={selection.title} className="editors-book-image" />
            </div>
          </div>
        </div>

        <div className="editors-content">
          <div className="editors-tag">
            <span>✦</span> Editor's Choice
          </div>

          <h2 className="editors-title">{selection.title}</h2>
          <p className="editors-description">{selection.description}</p>

          <div className="editors-features">
            {selection.features?.map((feature) => (
              <span key={feature} className="editors-feature">{feature}</span>
            ))}
          </div>

          <div className="editors-footer">
            {selection.price != null && <span className="editors-price">{formatPrice(selection.price)}</span>}
            <Link to={selection.detailsHref ?? "/catalogue"} className="btn-dark">View Details</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
