export default function Footer() {
  const links = ["Contact", "Delivery", "Returns", "Terms", "Privacy"];
  return (
    <footer className="footer">
      <div className="footer-logo">AURELIA EDITIONS</div>
      <div className="footer-links">
        {links.map((l) => <a key={l} href="#">{l}</a>)}
      </div>
      <div className="footer-copy">© 2026 Aurelia Editions.</div>
    </footer>
  );
}