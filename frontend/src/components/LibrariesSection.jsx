const libraries = [
  { name: "Science Fiction & Fantasy", icon: "⟡", cardClass: "library-card-1" },
  { name: "History & Antiquity",        icon: "⌂", cardClass: "library-card-2" },
  { name: "Classic Fiction",            icon: "◌", cardClass: "library-card-3" },
  { name: "Mystery & Crime",            icon: "✦", cardClass: "library-card-4" },
];

export default function LibrariesSection() {
  return (
    <section className="section-libraries">
      <div className="section-header">
        <div>
          <h2 className="section-title">Curated Libraries</h2>
          <p className="section-subtitle">Explore our meticulously crafted genres and thematic collections.</p>
        </div>
        <a href="#" className="section-link">View All Collections</a>
      </div>

      <div className="libraries-grid">
        {libraries.map((lib) => (
          <div key={lib.name} className={`library-card ${lib.cardClass}`}>
            <div className="library-overlay" />
            <div className="library-card-content">
              <span className="library-icon">{lib.icon}</span>
              <div className="library-name">{lib.name}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}