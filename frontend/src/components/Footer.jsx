const EXPLORE_LINKS = ["New Releases", "Curated Libraries", "Browse Catalogue", "Editor's Choice", "Gift Services"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <span className="footer-logo">AURELIA</span>
          <span className="footer-logo-sub">EDITIONS</span>
          <p className="footer-tagline">
            Publishing the world's greatest literature in beautiful, definitive editions.
            Every volume is treated as an object of craft.
          </p>
        </div>

        <div>
          <div className="footer-col-title">Explore</div>
          <ul className="footer-links">
            {EXPLORE_LINKS.map((label) => (
              <li key={label}><a href="#">{label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© 2026 Aurelia Editions. All rights reserved.</span>
      </div>
    </footer>
  );
}
