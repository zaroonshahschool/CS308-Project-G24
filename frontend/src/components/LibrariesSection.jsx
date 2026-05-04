import { Link } from "react-router-dom";

const fallbackLibraries = [
  { name: "Science Fiction & Fantasy", icon: "⟡", cardClass: "library-card-1" },
  { name: "History & Antiquity",        icon: "⌂", cardClass: "library-card-2" },
  { name: "Classic Fiction",            icon: "◌", cardClass: "library-card-3" },
  { name: "Mystery & Crime",            icon: "✦", cardClass: "library-card-4" },
];

export default function LibrariesSection({ libraries }) {
  const items = libraries?.length ? libraries : fallbackLibraries;

  return (
    <section className="section-libraries">
      <div className="section-header">
        <div>
          <h2 className="section-title">Curated Libraries</h2>
          <p className="section-subtitle">Explore our meticulously crafted genres and thematic collections.</p>
        </div>
        <Link to="/catalogue" className="section-link">View All Collections</Link>
      </div>

      <div className="libraries-grid">
        {items.map((lib) => (
          <Link
            key={lib.name}
            to={lib.href ?? "/catalogue"}
            className={`library-card ${lib.coverImage ? "library-card--image" : lib.cardClass}`}
          >
            {lib.coverImage ? (
              <img src={lib.coverImage} alt={lib.name} className="library-card-image" loading="lazy" />
            ) : null}
            <div className="library-overlay" />
            <div className="library-card-content">
              <span className="library-icon">{lib.icon}</span>
              <div className="library-name">{lib.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
