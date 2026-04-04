import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Limited Editions", to: "#" },
  { label: "Catalogue", to: "/catalogue" },
  { label: "New Releases", to: "#" },
  { label: "Collections", to: "#" },
];

export default function Nav() {
  const { pathname } = useLocation();
  const token = window.localStorage.getItem("auth_token");

  function handleLogout() {
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("auth_role");
  }

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
        <Link
          to="/admin"
          style={{ marginLeft: "auto", color: pathname === "/admin" ? "var(--accent)" : "var(--text-mid)" }}
        >
          Admin
        </Link>
        {token ? (
          <Link to="/" style={{ color: "var(--text-mid)" }} onClick={handleLogout}>Sign Out</Link>
        ) : (
          <Link to="/login" style={{ color: "var(--text-mid)" }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}
