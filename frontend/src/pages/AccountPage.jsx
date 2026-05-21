import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchProfile, updateAddress } from "../services/customerApi";
import DeliveryStatusStepper from "../components/DeliveryStatusStepper";

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
      <span className="profile-saved-check">✔</span>
      Stored
    </span>
  );
}

function getReturnRequestStatusLabel(status) {
  const normalizedStatus = (status || "").toLowerCase();

  if (normalizedStatus === "approved") return "Return approved";
  if (normalizedStatus === "rejected") return "Return rejected";
  return "Waiting for review";
}

function ReturnRequestModal({ item, order, reason, submitting, onChangeReason, onClose, onSubmit }) {
  if (!item || !order) return null;

  return (
    <div className="return-modal-backdrop" role="presentation">
      <form className="return-modal" onSubmit={onSubmit}>
        <div className="return-modal-head">
          <div>
            <p className="order-meta">Order {order.id}</p>
            <h2 className="account-card-title">Request Return</h2>
          </div>
          <button className="toast-close" type="button" aria-label="Close return request modal" onClick={onClose}>
            x
          </button>
        </div>

        <p className="order-item-name">{item.name}</p>
        <p className="order-item-meta">Qty {item.qty} · ${item.price.toFixed(2)} each</p>

        <label className="return-modal-field">
          <span>Reason</span>
          <textarea
            value={reason}
            onChange={(event) => onChangeReason(event.target.value)}
            placeholder="Tell us why you want to return this item"
            maxLength={1000}
            required
          />
        </label>

        <div className="return-modal-actions">
          <button className="wishlist-secondary-btn" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={submitting || !reason.trim()}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AccountPage({ orders, returnRequests = [], onCancelOrder, onRequestReturn, onViewInvoice }) {
  const location = useLocation();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [addressForm, setAddressForm] = useState({ street: "", city: "", postalCode: "", country: "" });
  const [savedField, setSavedField] = useState("");
  const [error, setError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [orderActionError, setOrderActionError] = useState("");
  const [actingOrderKey, setActingOrderKey] = useState("");
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("");

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
        .catch(() => {
          setError("Failed to load profile.");
          toast.error("Failed to load profile.", { title: "Account error" });
        });
  }, [toast]);

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
      toast.success("Address saved.", { title: "Profile updated" });
    } catch {
      setError("Failed to update address.");
      toast.error("Failed to update address.", { title: "Profile error" });
    }
  }

  async function handleSaveAddress() {
    try {
      await updateAddress(addressForm);
      setSavedField("address");
      toast.success("Address saved.", { title: "Profile updated" });
    } catch {
      setError("Failed to update address.");
      toast.error("Failed to update address.", { title: "Profile error" });
    }
  }

  async function handleViewInvoiceClick(order) {
    if (!order.backendOrderId) return;
    setInvoiceError("");
    setDownloadingOrderId(order.id);
    try {
      await onViewInvoice(order.backendOrderId);
      toast.info("Invoice opened in a new tab.", { title: "Invoice ready" });
    } catch (invoiceDownloadError) {
      setInvoiceError(invoiceDownloadError.message || "Invoice could not be opened.");
      toast.error(invoiceDownloadError.message || "Invoice could not be opened.", { title: "Invoice error" });
    } finally {
      setDownloadingOrderId(null);
    }
  }

  async function handleCancelOrderClick(order) {
    setOrderActionError("");
    setActingOrderKey(`cancel-${order.id}`);
    try {
      await onCancelOrder(order.backendOrderId);
    } catch (actionError) {
      setOrderActionError(actionError.message || "Order could not be cancelled.");
      toast.error(actionError.message || "Order could not be cancelled.", { title: "Order error" });
    } finally {
      setActingOrderKey("");
    }
  }

  function openReturnRequestModal(order, item) {
    setOrderActionError("");
    setReturnReason("");
    setReturnModal({ order, item });
  }

  function closeReturnRequestModal() {
    if (actingOrderKey) return;
    setReturnModal(null);
    setReturnReason("");
  }

  async function handleSubmitReturnRequest(event) {
    event.preventDefault();
    if (!returnModal) return;

    const { order, item } = returnModal;
    const itemKey = item.id;

    setOrderActionError("");
    setActingOrderKey(`return-${itemKey}`);
    try {
      await onRequestReturn(order.backendOrderId, item.productId, returnReason);
      setReturnModal(null);
      setReturnReason("");
    } catch (actionError) {
      setOrderActionError(actionError.message || "Return request could not be submitted.");
      toast.error(actionError.message || "Return request could not be submitted.", { title: "Return error" });
    } finally {
      setActingOrderKey("");
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

  function getReturnRequestForItem(order, item) {
    return returnRequests.find((request) =>
      request.orderId === order.backendOrderId && request.productId === item.productId
    );
  }

  return (
      <main className="customer-page">
        <ReturnRequestModal
          item={returnModal?.item}
          order={returnModal?.order}
          reason={returnReason}
          submitting={Boolean(actingOrderKey)}
          onChangeReason={setReturnReason}
          onClose={closeReturnRequestModal}
          onSubmit={handleSubmitReturnRequest}
        />

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
              {location.state?.recentOrderId ? (
                  <div className="order-success-banner">
                    <div>
                      <p className="order-item-name">Order {location.state.recentOrderId} was placed successfully.</p>
                      <p className="order-meta">Your invoice PDF has been emailed to you. Click "View Invoice PDF" below to open it.</p>
                    </div>
                  </div>
              ) : null}

              {invoiceError ? <p className="checkout-error">{invoiceError}</p> : null}
              {orderActionError ? <p className="checkout-error">{orderActionError}</p> : null}

              <div className="order-list">
                {orders.length > 0 ? (
                    orders.map((order) => (
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

                          <DeliveryStatusStepper status={order.status} />

                          <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item-row">
                                  {(() => {
                                    const returnRequest = getReturnRequestForItem(order, item);
                                    const returnRequestStatus = returnRequest?.status?.toLowerCase();

                                    return (
                                      <>
                                  <div>
                                    <p className="order-item-name">{item.name}</p>
                                    <p className="order-item-meta">Qty {item.qty} · ${item.price.toFixed(2)} each</p>
                                  </div>
                                  <div className="order-item-actions">
                                    {item.returnedAt ? (
                                        <span className="order-note">Returned on {item.returnedAt}</span>
                                    ) : returnRequest ? (
                                        <span className={`return-request-chip return-request-chip--${returnRequestStatus}`}>
                                          {getReturnRequestStatusLabel(returnRequest.status)}
                                        </span>
                                    ) : (order.status === "delivered" || order.status === "partially-returned") && canReturn(order.placedAt) ? (
                                        <button
                                            className="wishlist-secondary-btn"
                                            onClick={() => openReturnRequestModal(order, item)}
                                            disabled={actingOrderKey === `return-${item.id}`}
                                        >
                                          {actingOrderKey === `return-${item.id}` ? "Submitting..." : "Request Return"}
                                        </button>
                                    ) : null}
                                  </div>
                                      </>
                                    );
                                  })()}
                                </div>
                            ))}
                          </div>

                          <div className="order-card-footer">
                            <p className="order-total">Total ${order.total.toFixed(2)}</p>
                            <div className="order-card-actions">
                              {order.backendOrderId ? (
                                  <button
                                      className="wishlist-secondary-btn"
                                      type="button"
                                      onClick={() => handleViewInvoiceClick(order)}
                                      disabled={downloadingOrderId === order.id}
                                  >
                                    {downloadingOrderId === order.id ? "Opening Invoice..." : "View Invoice PDF"}
                                  </button>
                              ) : null}
                              {order.status === "processing" && order.allowCancellation !== false ? (
                                  <button
                                      className="wishlist-secondary-btn"
                                      onClick={() => handleCancelOrderClick(order)}
                                      disabled={actingOrderKey === `cancel-${order.id}`}
                                  >
                                    {actingOrderKey === `cancel-${order.id}` ? "Cancelling..." : "Cancel Order"}
                                  </button>
                              ) : null}
                            </div>
                          </div>
                        </article>
                    ))
                ) : (
                    <div className="customer-empty">
                      <h3 className="customer-empty-title">No orders yet</h3>
                      <p className="customer-empty-text">Your completed orders will appear here with invoice PDFs.</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
