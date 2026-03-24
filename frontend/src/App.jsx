import "./styles/global.css";

import Header          from "./components/Header";
import Nav             from "./components/Nav";
import Hero            from "./components/Hero";
import LibrariesSection from "./components/LibrariesSection";
import NotableSection  from "./components/NotableSection";
import EditorsChoice   from "./components/EditorsChoice";
import Footer          from "./components/Footer";

// Value Props — static content, no dedicated component file needed
function ValueProps() {
  return (
    <section className="section-values">
      <div className="values-inner">
        <div className="value-item">
          <div className="value-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <h3 className="value-title">Exquisite Packaging</h3>
          <p className="value-desc">Every order is carefully wrapped in bespoke protective packaging.</p>
        </div>
        <div className="value-item">
          <div className="value-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <h3 className="value-title">Worldwide Delivery</h3>
          <p className="value-desc">Secure, trackable shipping to bibliophiles across the globe.</p>
        </div>
        <div className="value-item">
          <div className="value-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="value-title">The Aurelia Guarantee</h3>
          <p className="value-desc">Uncompromising quality in typography, illustration, and binding.</p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Nav />
      <Hero />
      <LibrariesSection />
      <NotableSection />
      <EditorsChoice />
      <ValueProps />
      <Footer />
    </>
  );
}