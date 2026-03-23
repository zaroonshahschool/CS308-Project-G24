export default function NotableSection() {
  return (
    <section className="section-notable">
      <div className="books-grid">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="book-card">
            <div className="book-cover-placeholder" />
            <div className="text-placeholder" />
            <div className="text-placeholder-sub" />
          </div>
        ))}
      </div>
    </section>
  );
}