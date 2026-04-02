import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import LibrariesSection from "../components/LibrariesSection";
import NotableSection from "../components/NotableSection";
import EditorsChoice from "../components/EditorsChoice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const FALLBACK_VALUE_PROPS = [
  {
    title: "Exquisite Packaging",
    description: "Every order is carefully wrapped in bespoke protective packaging.",
    icon: "package",
  },
  {
    title: "Worldwide Delivery",
    description: "Secure, trackable shipping to bibliophiles across the globe.",
    icon: "globe",
  },
  {
    title: "The Aurelia Guarantee",
    description: "Uncompromising quality in typography, illustration, and binding.",
    icon: "shield",
  },
];

function ValueIcon({ name }) {
  if (name === "globe") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function ValueProps({ items }) {
  const valueProps = items?.length ? items : FALLBACK_VALUE_PROPS;

  return (
    <section className="section-values">
      <div className="values-inner">
        {valueProps.map((item) => (
          <div key={item.title} className="value-item">
            <div className="value-icon">
              <ValueIcon name={item.icon} />
            </div>
            <h3 className="value-title">{item.title}</h3>
            <p className="value-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomePage() {
      try {
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/home`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setHomeData(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError("Homepage data could not be loaded from the backend.");
        }
      }
    }

    loadHomePage();
    return () => controller.abort();
  }, []);

  return (
    <>
      <Hero hero={homeData?.hero} />
      {error && <p className="home-status home-status--error">{error}</p>}
      <LibrariesSection libraries={homeData?.libraries} />
      <NotableSection books={homeData?.notableBooks} />
      <EditorsChoice selection={homeData?.editorsChoice} />
      <ValueProps items={homeData?.valueProps} />
    </>
  );
}
