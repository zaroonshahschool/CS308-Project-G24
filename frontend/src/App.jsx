import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Nav from "./components/Nav";
import { initialCustomer, getInitialStockByProduct } from "./data/customer";
import AdminPage from "./pages/AdminPage";
import { initialReviewsByProduct } from "./data/reviews";
import AccountPage from "./pages/AccountPage";
import CataloguePage from "./pages/CataloguePage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import RegisterPage from "./pages/RegisterPage";
import WishlistPage from "./pages/WishlistPage";
import { fetchInvoicePdf, fetchOrders, placeOrder } from "./services/customerApi";

function getStoredArray(key) {
  const rawValue = window.localStorage.getItem(key);
  return rawValue ? JSON.parse(rawValue) : [];
}

function generateCustomerId() {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

function getStoredCustomer() {
  const rawValue = window.localStorage.getItem("customer_profile");

  if (!rawValue) {
    return initialCustomer;
  }

  try {
    return { ...initialCustomer, ...JSON.parse(rawValue) };
  } catch {
    return initialCustomer;
  }
}

function ProtectedRoute({ children }) {
  const token = window.localStorage.getItem("auth_token");
  const location = useLocation();

  if (token) {
    return children;
  }

  const next = `${location.pathname}${location.search}`;
  return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
}

function StoreLayout({ children, cartCount, wishlistCount, onCartOpen }) {
  return (
    <>
      <Header cartCount={cartCount} wishlistCount={wishlistCount} onCartOpen={onCartOpen} />
      <Nav />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState(() => getStoredArray("wishlist_product_ids"));
  const [reviewsByProduct, setReviewsByProduct] = useState(initialReviewsByProduct);
  const [customer, setCustomer] = useState(getStoredCustomer);
  const [orders, setOrders] = useState([]);
  const [stockByProduct, setStockByProduct] = useState(getInitialStockByProduct);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const authEmail = window.localStorage.getItem("auth_email");
    const registeredEmail = window.localStorage.getItem("last_registered_email");
    const storedCustomer = getStoredCustomer();
    const nextEmail = authEmail || registeredEmail || storedCustomer.email || "";

    setCustomer((currentCustomer) => {
      const nextCustomer = {
        ...storedCustomer,
        id: storedCustomer.id || currentCustomer.id || generateCustomerId(),
        email: nextEmail,
      };

      const currentSnapshot = JSON.stringify(currentCustomer);
      const nextSnapshot = JSON.stringify(nextCustomer);

      if (currentSnapshot === nextSnapshot) {
        return currentCustomer;
      }

      window.localStorage.setItem("customer_profile", JSON.stringify(nextCustomer));
      return nextCustomer;
    });
  }, [location.pathname]);

  useEffect(() => {
    let ignore = false;
    const token = window.localStorage.getItem("auth_token");

    if (!token) {
      setOrders([]);
      return undefined;
    }

    fetchOrders()
      .then((data) => {
        if (!ignore) {
          setOrders(data);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  function persistWishlist(nextWishlist) {
    setWishlistProductIds(nextWishlist);
    window.localStorage.setItem("wishlist_product_ids", JSON.stringify(nextWishlist));
  }

  function handleToggleWishlist(productId) {
    persistWishlist(
      wishlistProductIds.includes(productId)
        ? wishlistProductIds.filter((id) => id !== productId)
        : [...wishlistProductIds, productId]
    );
  }

  function handleAddToCart(product) {
    const availableStock = stockByProduct[product.id] ?? product.stock;

    if (availableStock <= 0) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + 1, availableStock) }
            : item
        );
      }

      return [...currentItems, { ...product, stock: availableStock, qty: 1 }];
    });

    setCartOpen(true);
  }

  function handleUpdateCartQty(productId, delta) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const availableStock = stockByProduct[item.id] ?? item.stock;
          const nextQty = Math.max(0, Math.min(item.qty + delta, availableStock));
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  }

  function handleRemoveFromCart(productId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  }

  function handleSubmitReview(productId, reviewInput) {
    const nextReview = {
      id: `${productId}-${Date.now()}`,
      reviewer: reviewInput.reviewer.trim(),
      rating: reviewInput.rating,
      comment: reviewInput.comment.trim(),
      status: reviewInput.comment.trim() ? "pending" : "approved",
      submittedAt: new Date().toISOString().slice(0, 10),
    };

    setReviewsByProduct((currentReviews) => ({
      ...currentReviews,
      [productId]: [...(currentReviews[productId] ?? []), nextReview],
    }));
  }

  function handleUpdateCustomer(nextCustomer) {
    window.localStorage.setItem("customer_profile", JSON.stringify(nextCustomer));
    setCustomer(nextCustomer);
  }

  function handleCancelOrder(orderId) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order
      )
    );
  }

  function handleReturnOrderItem(orderId, itemId) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, returnedAt: new Date().toISOString().slice(0, 10) } : item
        );

        return {
          ...order,
          status: "partially-returned",
          items: updatedItems,
        };
      })
    );
  }

  function finalizePlacedOrder(nextOrder) {
    if (cartItems.length === 0) {
      navigate("/catalogue");
      return null;
    }

    setStockByProduct((currentStock) => {
      const nextStock = { ...currentStock };

      cartItems.forEach((item) => {
        nextStock[item.id] = Math.max(0, (nextStock[item.id] ?? item.stock) - item.qty);
      });

      return nextStock;
    });
    setCartItems([]);
    setCartOpen(false);

    setOrders((currentOrders) => [
      nextOrder,
      ...currentOrders.filter((order) => order.backendOrderId !== nextOrder.backendOrderId),
    ]);

    return nextOrder;
  }

  function handleCheckout() {
    const token = window.localStorage.getItem("auth_token");

    if (!token) {
      navigate("/login?next=/checkout");
      setCartOpen(false);
      return;
    }

    setCartOpen(false);
    navigate("/checkout");
  }

  async function handleCheckoutSubmit(checkoutData) {
    const createdOrder = await placeOrder(cartItems, checkoutData.shippingAddress);
    const nextOrder = finalizePlacedOrder({
      ...createdOrder,
      shippingAddress: checkoutData.shippingAddress,
      paymentSummary: checkoutData.paymentDetails,
    });

    if (!nextOrder) {
      return;
    }

    navigate("/account", {
      state: {
        recentOrderId: nextOrder.id,
        recentInvoiceOrderId: nextOrder.backendOrderId,
      },
    });
  }

  async function handleViewInvoice(orderId) {
    const invoiceBlob = await fetchInvoicePdf(orderId);
    const invoiceUrl = window.URL.createObjectURL(invoiceBlob);
    const invoiceWindow = window.open(invoiceUrl, "_blank", "noopener,noreferrer");

    if (!invoiceWindow) {
      window.location.assign(invoiceUrl);
    }

    window.setTimeout(() => {
      window.URL.revokeObjectURL(invoiceUrl);
    }, 60000);
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
              <HomePage />
            </StoreLayout>
          }
        />
        <Route
          path="/catalogue"
          element={
            <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
              <CataloguePage
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                reviewsByProduct={reviewsByProduct}
                stockByProduct={stockByProduct}
                wishlistProductIds={wishlistProductIds}
              />
            </StoreLayout>
          }
        />
        <Route
          path="/catalogue/:productId"
          element={
            <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
              <ProductDetailPage
                onAddToCart={handleAddToCart}
                onSubmitReview={handleSubmitReview}
                onToggleWishlist={handleToggleWishlist}
                reviewsByProduct={reviewsByProduct}
                stockByProduct={stockByProduct}
                wishlistProductIds={wishlistProductIds}
              />
            </StoreLayout>
          }
        />
        <Route
          path="/wishlist"
          element={
            <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
              <WishlistPage
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                stockByProduct={stockByProduct}
                wishlistProductIds={wishlistProductIds}
              />
            </StoreLayout>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
                <AccountPage
                  orders={orders}
                  onCancelOrder={handleCancelOrder}
                  onReturnOrderItem={handleReturnOrderItem}
                  onViewInvoice={handleViewInvoice}
                />
              </StoreLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <StoreLayout cartCount={cartCount} wishlistCount={wishlistProductIds.length} onCartOpen={() => setCartOpen(true)}>
                <CheckoutPage cartItems={cartItems} onCheckoutSubmit={handleCheckoutSubmit} />
              </StoreLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CartDrawer
        items={cartItems}
        isOpen={cartOpen}
        onCheckout={handleCheckout}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemoveFromCart}
        onUpdateQty={handleUpdateCartQty}
      />
    </>
  );
}
