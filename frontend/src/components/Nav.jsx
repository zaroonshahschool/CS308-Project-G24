import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Limited Editions", to: "/limited-editions" },
  { label: "Catalogue", to: "/catalogue" },
  { label: "New Releases", to: "/catalogue?sort=new" },
  { label: "Collections", to: "/collections" },
];

export default function Nav() {
  const { pathname } = useLocation();
  const token = window.localStorage.getItem("auth_token");
  const role = window.localStorage.getItem("auth_role");
  const isProductManager = role === "PRODUCT_MANAGER";
  const isSalesManager = role === "SALES_MANAGER";

  function handleLogout() {
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("auth_role");
    window.localStorage.removeItem("auth_email");
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
        {isProductManager ? (
          <Link
            to="/product-manager"
            style={{
              marginLeft: "auto",
              color: pathname === "/product-manager" ? "var(--accent)" : "var(--text-mid)",
            }}
          >
            Product Manager
          </Link>
        ) : (
          <div style={{ marginLeft: "auto" }} />
        )}
        {isSalesManager ? (
          <Link
            to="/dashboard"
            style={{ color: pathname === "/dashboard" ? "var(--accent)" : "var(--text-mid)" }}
          >
            Sales Dashboard
          </Link>
        ) : null}
        {token ? (
          <Link to="/" style={{ color: "var(--text-mid)" }} onClick={handleLogout}>Sign Out</Link>
        ) : (
          <Link to="/login" style={{ color: "var(--text-mid)" }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}
