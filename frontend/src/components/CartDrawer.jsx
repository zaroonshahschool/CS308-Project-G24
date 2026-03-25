export default function CartDrawer({ items, isOpen, onClose, onRemove, onUpdateQty }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <div
        className={`cart-backdrop${isOpen ? " cart-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`cart-drawer${isOpen ? " cart-drawer--open" : ""}`} aria-label="Shopping cart">
        <div className="cart-drawer-header">
          <div>
            <h2 className="cart-drawer-title">Your Cart</h2>
            {itemCount > 0 && (
              <p className="cart-drawer-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            )}
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cart-items-scroll">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                style={{ color: "var(--border)", marginBottom: "20px" }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-sub">Add some titles to get started.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                </div>

                <div className="cart-item-details">
                  <p className="cart-item-cat">{item.category}</p>
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-author">{item.author}</p>

                  <div className="cart-item-bottom">
                    <div className="cart-qty-control">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>

                <button className="cart-item-remove" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-value">${total.toFixed(2)}</span>
            </div>
            <p className="cart-shipping-note">Shipping &amp; taxes calculated at checkout</p>
            <button className="cart-checkout-btn">Proceed to Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}