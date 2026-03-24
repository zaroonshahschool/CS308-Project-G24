// TODO: Replace BOOK_PLACEHOLDERS with real data fetched from DB
const BOOK_PLACEHOLDERS = [1, 2, 3, 4, 5];

export default function NotableSection() {
  return (
    <section className="section-notable">
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 80px" }}>
        <p className="section-tag">Just Arrived</p>
        <h2 className="section-title-center">New &amp; Notable Editions</h2>
      </div>

      <div className="books-grid">
        {BOOK_PLACEHOLDERS.map((n) => (
          <div key={n} className="book-card">
            {/* Cover placeholder — will be replaced with book.coverImage from DB */}
            <div className="book-cover-placeholder" />
            {/* Text placeholders — will render book.title, book.author, book.price */}
            <span className="text-ph title-ph" />
            <span className="text-ph author-ph" />
            <span className="text-ph price-ph-sm" />
          </div>
        ))}
      </div>

      <div className="notable-divider" />
    </section>
  );
}