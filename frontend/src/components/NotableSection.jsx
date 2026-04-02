import { Link } from "react-router-dom";

const BOOK_PLACEHOLDERS = [1, 2, 3, 4, 5];

function formatPrice(price) {
  return typeof price === "number" ? `$${price.toFixed(2)}` : "";
}

export default function NotableSection({ books }) {
  return (
    <section className="section-notable">
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 80px" }}>
        <p className="section-tag">Just Arrived</p>
        <h2 className="section-title-center">New &amp; Notable Editions</h2>
      </div>

      <div className="books-grid">
        {books?.length
          ? books.map((book) => (
              <Link key={book.id} to="/catalogue" className="book-card">
                <img src={book.coverImage} alt={book.title} className="book-cover" />
                <span className="book-title">{book.title}</span>
                <span className="book-author">{book.author}</span>
                <span className="book-price">{formatPrice(book.price)}</span>
              </Link>
            ))
          : BOOK_PLACEHOLDERS.map((n) => (
              <div key={n} className="book-card">
                <div className="book-cover-placeholder" />
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
