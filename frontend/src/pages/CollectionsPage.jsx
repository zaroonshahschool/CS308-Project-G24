import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchCollections } from "../services/collectionsApi";

export default function CollectionsPage() {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchCollections();
        if (!ignore) setCollections(data);
      } catch (err) {
        if (!ignore) toast.error(err.message || "Failed to load collections.", { title: "Collections error" });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [toast]);

  return (
    <main>
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <section className="section-catalog">
        <div className="section-header">
          <div>
            <h2 className="section-title">Collections</h2>
            <p className="section-subtitle">Curated selections of books around a common theme.</p>
          </div>
        </div>

        {loading ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">Loading collections...</h3>
          </div>
        ) : collections.length === 0 ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">No collections yet</h3>
            <p className="catalog-empty-text">Check back soon — curated collections are coming.</p>
          </div>
        ) : (
          <div className="libraries-grid">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/collections/${col.id}`}
                className={`library-card ${col.imageUrl ? "library-card--image" : "library-card-1"}`}
              >
                {col.imageUrl && (
                  <img src={col.imageUrl} alt={col.name} className="library-card-image" loading="lazy" />
                )}
                <div className="library-overlay" />
                <div className="library-card-content">
                  <div className="library-name">{col.name}</div>
                  <p style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.25rem" }}>
                    {col.productCount} {col.productCount === 1 ? "book" : "books"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
