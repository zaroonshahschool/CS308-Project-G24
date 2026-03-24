export default function Header() {
  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="announcement-bar">
        COMPLIMENTARY PREMIUM SHIPPING ON ALL INTERNATIONAL ORDERS OVER $300
      </div>

      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button className="currency-btn">
              USD $ <span style={{ fontSize: 10 }}>▾</span>
            </button>
          </div>

          <a href="#" className="logo">
            <span className="logo-wordmark">AURELIA</span>
            <span className="logo-sub">EDITIONS</span>
          </a>

          <div className="header-right">
            <button className="icon-btn" title="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="icon-btn" title="Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button className="icon-btn" title="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="icon-btn" title="Cart" style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-badge">0</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}