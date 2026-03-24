import { useState } from "react";

const EXPLORE_LINKS = ["New Releases", "Curated Libraries", "Browse Catalogue", "Editor's Choice", "Gift Services"];
const SUPPORT_LINKS = ["Customer Service", "Delivery & Returns", "FAQs", "Contact Aurelia", "Design Reference"];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div>
          <span className="footer-logo">AURELIA</span>
          <span className="footer-logo-sub">EDITIONS</span>
          <p className="footer-tagline">
            Publishing the world's greatest literature in beautiful, definitive editions.
            Every volume is treated as an object of craft.
          </p>
          <div className="footer-socials">
            {["IG", "𝕏", "FB", "YT"].map((s) => (
              <a key={s} href="#" className="footer-social">{s}</a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="footer-col-title">Explore</div>
          <ul className="footer-links">
            {EXPLORE_LINKS.map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <div className="footer-col-title">Support</div>
          <ul className="footer-links">
            {SUPPORT_LINKS.map((l) => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <div className="footer-col-title">The Reading Room Newsletter</div>
          <p className="footer-newsletter-desc">
            Subscribe for new edition announcements, private offers, and notes from the Aurelia editorial desk.
          </p>
          <div className="newsletter-form">
            <input
              type="email"
              className="newsletter-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-subscribe">Subscribe →</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© 2026 Aurelia Editions. All rights reserved.</span>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}