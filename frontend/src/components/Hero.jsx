export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-badge">Masterpiece Edition</span>

          {/* Title placeholder — will render book.title from DB */}
          <span className="placeholder-bar hero-title-ph" />
          <span className="placeholder-bar hero-title-ph-2" />

          {/* Description placeholder — will render book.description from DB */}
          <div className="hero-desc-block">
            <span className="placeholder-bar hero-desc-ph" style={{ width: "100%" }} />
            <span className="placeholder-bar hero-desc-ph" style={{ width: "90%" }} />
            <span className="placeholder-bar hero-desc-ph" />
          </div>

          <div className="hero-cta-row">
            <a href="#" className="btn-primary">Explore Edition</a>
            {/* Price placeholder — will render book.price from DB */}
            <span className="placeholder-bar price-ph" />
          </div>
        </div>

        {/* Book cover placeholder — will render book.coverImage from DB */}
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