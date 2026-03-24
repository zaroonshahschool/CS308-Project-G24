export default function NotableSection() {
  return (
    <section className="section-notable">
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <p className="section-tag">Just Arrived</p>
        <h2 className="section-title-center">New & Notable Editions</h2>
      </div>
      <div className="books-grid">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="book-card">
            <div className="book-cover-placeholder" style={{ width: '100%', aspectRatio: '2/3', background: '#f0ece6', marginBottom: '16px' }} />
            <span className="text-ph" style={{ height: '16px', width: '80%', background: '#e8e3dc', display: 'block', margin: '0 auto 8px' }} />
            <span className="text-ph" style={{ height: '12px', width: '50%', background: '#e8e3dc', display: 'block', margin: '0 auto' }} />
          </div>
        ))}
      </div>
    </section>
  );
}