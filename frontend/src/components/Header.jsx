import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

export default function Header({ cartCount = 0, wishlistCount = 0, onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const inputRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
  }, [searchOpen]);

  function toggleSearch() {
    const currentSearch = new URLSearchParams(location.search).get("search") ?? "";
    setSearchTerm(currentSearch);
    setSearchOpen((prev) => !prev);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedSearch = searchTerm.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ""}`);
    setSearchOpen(false);
  }

  function handleAccountClick() {
    const role = window.localStorage.getItem("auth_role");

    if (role === "CUSTOMER") {
      navigate("/account");
      return;
    }

    navigate("/login?next=/account");
    toast.info("Sign in to view your account.", { title: "Login required" });
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-wordmark">AURELIA</span>
          <span className="logo-sub">EDITIONS</span>
        </Link>

        <div className="header-right">
          {searchOpen && (
            <form className="header-search-form" onSubmit={handleSearchSubmit}>
              <input
                ref={inputRef}
                type="search"
                className="header-search-input"
                placeholder="Search by title or description"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button type="submit" className="header-search-submit">Go</button>
            </form>
          )}

          <button className="icon-btn" title="Search" onClick={toggleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button className="icon-btn" title="Account" onClick={handleAccountClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <button className="icon-btn" title="Wishlist" onClick={() => navigate("/wishlist")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="cart-badge">{wishlistCount}</span>
            )}
          </button>
          <button
            className="icon-btn"
            title="Cart"
            style={{ position: "relative" }}
            onClick={onCartOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
