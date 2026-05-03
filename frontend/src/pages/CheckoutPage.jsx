import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import { fetchProfile, updateAddress } from "../services/customerApi";

const ENABLE_LUHN_VALIDATION = import.meta.env.VITE_ENABLE_LUHN_VALIDATION === "true";

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function getLastFour(cardNumber) {
  return cardNumber.replace(/\D/g, "").slice(-4);
}

function passesLuhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isValidCardNumber(cardNumber) {
  const hasSupportedLength = cardNumber.length >= 13 && cardNumber.length <= 19;

  if (!hasSupportedLength) {
    return false;
  }

  if (!ENABLE_LUHN_VALIDATION) {
    return true;
  }

  return passesLuhnCheck(cardNumber);
}

function isValidFutureExpiry(monthValue, yearValue) {
  const month = Number(monthValue);
  const year = Number(yearValue);

  if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export default function CheckoutPage({ cartItems, onCheckoutSubmit }) {
  const toast = useToast();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [payment, setPayment] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [profileError, setProfileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      subtotal,
      shipping: 0,
      total: subtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.qty, 0),
    };
  }, [cartItems]);

  useEffect(() => {
    let active = true;

    fetchProfile()
      .then((data) => {
        if (!active) {
          return;
        }

        setAddress({
          street: data.street || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
        });
        setPayment((currentPayment) => ({
          ...currentPayment,
          cardholderName: data.name || currentPayment.cardholderName,
        }));
      })
      .catch(() => {
        if (active) {
          const message = "We could not preload your saved address. You can still complete checkout manually.";
          setProfileError(message);
          toast.warning(message, { title: "Address not loaded" });
        }
      });

    return () => {
      active = false;
    };
  }, [toast]);

  function handleAddressChange(event) {
    const { name, value } = event.target;
    setAddress((currentAddress) => ({ ...currentAddress, [name]: value }));
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target;

    setPayment((currentPayment) => {
      if (name === "cardNumber") {
        return { ...currentPayment, cardNumber: formatCardNumber(value) };
      }

      if (name === "expiry") {
        return { ...currentPayment, expiry: formatExpiry(value) };
      }

      if (name === "cvv") {
        return { ...currentPayment, cvv: value.replace(/\D/g, "").slice(0, 4) };
      }

      return { ...currentPayment, [name]: value };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (cartItems.length === 0) {
      const message = "Your cart is empty.";
      setSubmitError(message);
      toast.warning(message, { title: "Checkout" });
      return;
    }

    const rawCardNumber = payment.cardNumber.replace(/\D/g, "");
    const [expiryMonth, expiryYear] = payment.expiry.split("/");

    if (!isValidCardNumber(rawCardNumber)) {
      const message =
        ENABLE_LUHN_VALIDATION
          ? "Enter a valid card number with 13 to 19 digits."
          : "Enter a card number with 13 to 19 digits.";
      setSubmitError(message);
      toast.warning(message, { title: "Payment details" });
      return;
    }

    if (!expiryMonth || !expiryYear || expiryYear.length !== 2 || !isValidFutureExpiry(expiryMonth, expiryYear)) {
      const message = "Enter a valid card expiry date in MM/YY format.";
      setSubmitError(message);
      toast.warning(message, { title: "Payment details" });
      return;
    }

    if (!/^\d{3,4}$/.test(payment.cvv)) {
      const message = "Enter a valid 3 or 4 digit card security code.";
      setSubmitError(message);
      toast.warning(message, { title: "Payment details" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await updateAddress(address).catch(() => {});

      await onCheckoutSubmit({
        shippingAddress: address,
        paymentDetails: {
          cardholderName: payment.cardholderName.trim(),
          paymentMethod: "credit-card",
          cardLast4: getLastFour(payment.cardNumber),
        },
      });
    } catch (error) {
      const message = error.message || "Checkout failed. Please try again.";
      setSubmitError(message);
      toast.error(message, { title: "Checkout failed" });
      setSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="catalogue-breadcrumb">
          <Link to="/catalogue" className="breadcrumb-link">Continue Shopping</Link>
        </div>
        <section className="customer-shell">
          <div className="customer-empty">
            <h1 className="customer-empty-title">Your cart is empty</h1>
            <p className="customer-empty-text">Add a book before moving to checkout.</p>
            <Link className="btn-primary checkout-empty-cta" to="/catalogue">Browse Catalogue</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="catalogue-breadcrumb">
        <Link to="/catalogue" className="breadcrumb-link">Back to Catalogue</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <div>
            <h1 className="section-title">Checkout</h1>
          </div>
          <p className="section-subtitle">Enter your shipping and payment details before placing the order.</p>
        </div>

        <div className="checkout-layout">
          <form className="account-card checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-section">
              <h2 className="account-card-title">Shipping Address</h2>

              <div className="review-field">
                <span>Street</span>
                <input name="street" type="text" value={address.street} onChange={handleAddressChange} required />
              </div>

              <div className="checkout-inline-fields">
                <label className="review-field">
                  <span>City</span>
                  <input name="city" type="text" value={address.city} onChange={handleAddressChange} required />
                </label>

                <label className="review-field">
                  <span>Postal Code</span>
                  <input name="postalCode" type="text" value={address.postalCode} onChange={handleAddressChange} required />
                </label>
              </div>

              <div className="review-field">
                <span>Country</span>
                <input name="country" type="text" value={address.country} onChange={handleAddressChange} required />
              </div>
            </div>

            <div className="checkout-section">
              <h2 className="account-card-title">Payment Details</h2>

              <div className="review-field">
                <span>Name on Card</span>
                <input
                  name="cardholderName"
                  type="text"
                  value={payment.cardholderName}
                  onChange={handlePaymentChange}
                  autoComplete="cc-name"
                  required
                />
              </div>

              <div className="review-field">
                <span>Card Number</span>
                <input
                  name="cardNumber"
                  type="text"
                  inputMode="numeric"
                  value={payment.cardNumber}
                  onChange={handlePaymentChange}
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="checkout-inline-fields">
                <label className="review-field">
                  <span>Expiry</span>
                  <input
                    name="expiry"
                    type="text"
                    inputMode="numeric"
                    value={payment.expiry}
                    onChange={handlePaymentChange}
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    required
                  />
                </label>

                <label className="review-field">
                  <span>CVV</span>
                  <input
                    name="cvv"
                    type="password"
                    inputMode="numeric"
                    value={payment.cvv}
                    onChange={handlePaymentChange}
                    autoComplete="cc-csc"
                    placeholder="123"
                    required
                  />
                </label>
              </div>
            </div>

            {profileError ? <p className="checkout-note">{profileError}</p> : null}
            {submitError ? <p className="checkout-error">{submitError}</p> : null}

            <button className="btn-dark checkout-submit" type="submit" disabled={submitting}>
              {submitting ? "Placing Order..." : "Pay and Place Order"}
            </button>
          </form>

          <aside className="account-card checkout-summary">
            <h2 className="account-card-title">Order Summary</h2>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-summary-item-copy">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-meta">Qty {item.qty} · ${item.price.toFixed(2)} each</p>
                  </div>
                  <span className="checkout-summary-line-price">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-totals">
              <div className="checkout-summary-row">
                <span className="order-meta">Items ({orderSummary.itemCount})</span>
                <span className="order-item-name">${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span className="order-meta">Shipping</span>
                <span className="order-item-name">Free</span>
              </div>
              <div className="checkout-summary-row checkout-summary-row--total">
                <span className="order-meta">Total</span>
                <span className="order-total">${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>

            <p className="checkout-note">Payment details are only used to confirm this checkout flow and are not stored in full.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
