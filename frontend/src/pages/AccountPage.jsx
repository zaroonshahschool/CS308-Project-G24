import { useState } from "react";
import { Link } from "react-router-dom";

function canReturn(placedAt) {
  const purchaseDate = new Date(`${placedAt}T00:00:00`);
  const now = new Date();
  const daysSincePurchase = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
  return daysSincePurchase <= 30;
}

export default function AccountPage({ customer, orders, onCancelOrder, onReturnOrderItem, onUpdateCustomer }) {
  const [formState, setFormState] = useState(customer);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onUpdateCustomer(formState);
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
          <form className="account-card" onSubmit={handleSubmit}>
            <h2 className="account-card-title">Profile</h2>
            <div className="review-field">
              <span>Customer ID</span>
              <input name="id" value={formState.id} onChange={handleChange} />
            </div>
            <div className="review-field">
              <span>Name</span>
              <input name="name" value={formState.name} onChange={handleChange} />
            </div>
            <div className="review-field">
              <span>Tax ID</span>
              <input name="taxId" value={formState.taxId} onChange={handleChange} />
            </div>
            <div className="review-field">
              <span>Email Address</span>
              <input name="email" type="email" value={formState.email} onChange={handleChange} />
            </div>
            <div className="review-field">
              <span>Home Address</span>
              <textarea name="homeAddress" rows="4" value={formState.homeAddress} onChange={handleChange} />
            </div>
            <div className="review-field">
              <span>Password</span>
              <input name="password" value={formState.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-primary">Save Customer Info</button>
          </form>

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
