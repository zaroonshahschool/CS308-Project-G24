import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProfile, updateAddress } from "../services/customerApi";

function canReturn(placedAt) {
  const purchaseDate = new Date(`${placedAt}T00:00:00`);
  const now = new Date();
  const daysSincePurchase = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
  return daysSincePurchase <= 30;
}

function SavedTick({ visible }) {
  if (!visible) return null;
  return (
    <span className="profile-saved-indicator" aria-label="Stored">
      <span className="profile-saved-check">✓</span>
      Stored
    </span>
  );
}

export default function AccountPage({ orders, onCancelOrder, onReturnOrderItem }) {
  const [profile, setProfile] = useState(null);
  const [addressForm, setAddressForm] = useState({ street: "", city: "", postalCode: "", country: "" });
  const [savedField, setSavedField] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setAddressForm({
          street: data.street || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
        });
      })
      .catch(() => setError("Failed to load profile."));
  }, []);

  useEffect(() => {
    if (!savedField) return undefined;
    const id = window.setTimeout(() => setSavedField(""), 2200);
    return () => window.clearTimeout(id);
  }, [savedField]);

  function handleAddressChange(event) {
    const { name, value } = event.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddressKeyDown(event, fieldName) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    try {
      await updateAddress(addressForm);
      setSavedField(fieldName);
    } catch {
      setError("Failed to update address.");
    }
  }

  async function handleSaveAddress() {
    try {
      await updateAddress(addressForm);
      setSavedField("address");
    } catch {
      setError("Failed to update address.");
    }
  }

  if (!profile) {
    return (
      <main className="customer-page">
        <div className="catalogue-breadcrumb">
          <Link to="/" className="breadcrumb-link">Back to Home</Link>
        </div>
        <section className="customer-shell">
          <p className="section-subtitle">{error || "Loading profile..."}</p>
        </section>
      </main>
    );
  }

  const ADDRESS_FIELDS = [
    { name: "street", label: "Street" },
    { name: "city", label: "City" },
    { name: "postalCode", label: "Postal Code" },
    { name: "country", label: "Country" },
  ];

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
          <p className="section-subtitle">Manage your home address and view your orders.</p>
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h2 className="account-card-title">Profile</h2>

            <div className="review-field review-field--readonly">
              <span>Name</span>
              <input type="text" value={profile.name} readOnly disabled />
            </div>

            <div className="review-field review-field--readonly">
              <span>Email Address</span>
              <input type="email" value={profile.email} readOnly disabled />
            </div>

            <div className="review-field review-field--readonly">
              <span>Tax Number</span>
              <input type="text" value={profile.taxNumber} readOnly disabled />
            </div>

            <h3 className="account-card-title" style={{ marginTop: "1.5rem" }}>Home Address</h3>

            {ADDRESS_FIELDS.map((field) => (
              <div key={field.name} className="review-field">
                <div className="profile-field-head">
                  <span>{field.label}</span>
                  <SavedTick visible={savedField === field.name} />
                </div>
                <input
                  name={field.name}
                  type="text"
                  value={addressForm[field.name]}
                  onChange={handleAddressChange}
                  onKeyDown={(e) => handleAddressKeyDown(e, field.name)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
              <button className="btn-primary" onClick={handleSaveAddress}>
                Save Address
              </button>
              <SavedTick visible={savedField === "address"} />
            </div>

            {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
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
