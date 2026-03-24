export default function EditorsChoice() {
  return (
    <section className="section-editors">
      <div className="editors-inner">

        {/* Left — book cover placeholder */}
        <div className="editors-visual">
          <div className="editors-books">
            <div className="editors-book-back" />
            <div className="editors-book-front">
              {/* Will render book.coverImage from DB */}
              <span className="ed-book-ph-line" />
              <span className="ed-book-ph-line short" />
              <span className="ed-book-ph-line" />
              <span className="ed-book-ph-line short" />
            </div>
          </div>
        </div>

        {/* Right — text placeholder */}
        <div className="editors-content">
          <div className="editors-tag">
            <span>✦</span> Editor's Choice
          </div>

          {/* Will render book.title from DB */}
          <span className="content-ph title-lg" />
          <span className="content-ph title-lg-2" />

          {/* Will render book.description from DB */}
          <span className="content-ph desc" />
          <span className="content-ph desc" />
          <span className="content-ph desc-short" />

          {/* Will render book.features from DB */}
          <div className="editors-features-ph">
            <span className="content-ph feature" />
            <span className="content-ph feature" style={{ width: "50%" }} />
            <span className="content-ph feature" style={{ width: "70%" }} />
          </div>

          {/* Will render book.price from DB */}
          <a href="#" className="btn-dark">View Details — —</a>
        </div>

      </div>
    </section>
  );
}