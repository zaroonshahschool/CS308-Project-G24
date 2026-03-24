const NAV_LINKS = [
  "Limited Editions",
  "Catalogue",
  "New Releases",
  "Collections",
  "Fiction",
  "Non-Fiction",
  "Gifts",
];

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        {NAV_LINKS.map((item) => (
          <a key={item} href="#">{item}</a>
        ))}
        <a href="#" style={{ marginLeft: "auto", color: "var(--text-mid)" }}>Admin</a>
        <a href="#" style={{ color: "var(--text-mid)" }}>Sign In</a>
      </div>
    </nav>
  );
}