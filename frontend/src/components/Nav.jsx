import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Limited Editions",  to: "#" },
  { label: "Catalogue",         to: "/catalogue" },
  { label: "New Releases",      to: "#" },
  { label: "Collections",       to: "#" },
];

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <nav className="nav">
      <div className="nav-inner">
        {NAV_LINKS.map(({ label, to }) =>
          to.startsWith("/") ? (
            <Link
              key={label}
              to={to}
              className={pathname === to.split("#")[0] ? "nav-link--active" : ""}
            >
              {label}
            </Link>
          ) : (
            <a key={label} href={to}>{label}</a>
          )
        )}
        <a href="#" style={{ marginLeft: "auto", color: "var(--text-mid)" }}>Admin</a>
        <a href="#" style={{ color: "var(--text-mid)" }}>Sign In</a>
      </div>
    </nav>
  );
}
