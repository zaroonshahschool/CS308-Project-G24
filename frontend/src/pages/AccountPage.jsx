import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PROFILE_FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Press Enter to store your name" },
  { name: "taxId", label: "Tax ID", type: "text", placeholder: "Press Enter to store tax ID" },
  { name: "homeAddress", label: "Home Address", type: "textarea", placeholder: "Press Enter to store home address" },
  { name: "password", label: "Password", type: "text", placeholder: "Press Enter to store password" },
];

function canReturn(placedAt) {
  const purchaseDate = new Date(`${placedAt}T00:00:00`);
  const now = new Date();
  const daysSincePurchase = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
  return daysSincePurchase <= 30;
}

function SavedTick({ visible }) {
  if (!visible) {
    return null;
  }

  return (
    <span className="profile-saved-indicator" aria-label="Stored">
      <span className="profile-saved-check">✓</span>
      Stored
    </span>
  );
}

export default function AccountPage({ customer, orders, onCancelOrder, onReturnOrderItem, onUpdateCustomer }) {
  const [formState, setFormState] = useState(customer);
  const [savedField, setSavedField] = useState("");

  useEffect(() => {
    setFormState(customer);
  }, [customer]);

  useEffect(() => {
    if (!savedField) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSavedField(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [savedField]);

  const visibleFields = useMemo(() => PROFILE_FIELDS, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function saveField(fieldName) {
    const nextCustomer = { ...formState };
    onUpdateCustomer(nextCustomer);
    setSavedField(fieldName);
  }

  function handleFieldKeyDown(event, fieldName) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    saveField(fieldName);
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/" className="breadcrumb-link">Back to Home</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <div>
            <h1 className="section-title">Customer Account</h1>
          </div>
          <p className="section-subtitle">Customers can manage their profile, place orders, cancel processing orders, and request returns.</p>
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h2 className="account-card-title">Profile</h2>

            <div className="review-field review-field--readonly">
              <span>Customer ID</span>
              <input
                name="id"
                type="text"
                value={formState.id}
                readOnly
                disabled
              />
            </div>

            <div className="review-field review-field--readonly">
              <span>Email Address</span>
              <input
                name="email"
                type="email"
                value={formState.email}
                readOnly
                disabled
              />
            </div>

            {visibleFields.map((field) => (
              <div key={field.name} className="review-field">
                <div className="profile-field-head">
                  <span>{field.label}</span>
                  <SavedTick visible={savedField === field.name} />
                </div>

                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    rows="4"
                    value={formState[field.name]}
                    onChange={handleChange}
                    onKeyDown={(event) => handleFieldKeyDown(event, field.name)}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    value={formState[field.name]}
                    onChange={handleChange}
                    onKeyDown={(event) => handleFieldKeyDown(event, field.name)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="account-card">
            <h2 className="account-card-title">Order History</h2>
            <div className="order-list">
              {orders.map((order) => (
                <article key={order.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <p className="order-id">{order.id}</p>
                      <p className="order-meta">Placed on {order.placedAt}</p>
                    </div>
                    <div className={`order-status order-status--${order.status.replace(/\s+/g, "-")}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-item-row">
                        <div>
                          <p className="order-item-name">{item.name}</p>
                          <p className="order-item-meta">Qty {item.qty} · ${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="order-item-actions">
                          {item.returnedAt ? (
                            <span className="order-note">Returned on {item.returnedAt}</span>
                          ) : order.status === "delivered" && canReturn(order.placedAt) ? (
                            <button className="wishlist-secondary-btn" onClick={() => onReturnOrderItem(order.id, item.id)}>
                              Return Item
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <p className="order-total">Total ${order.total.toFixed(2)}</p>
                    {order.status === "processing" && (
                      <button className="wishlist-secondary-btn" onClick={() => onCancelOrder(order.id)}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
