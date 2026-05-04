import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Nav from "./components/Nav";
import { useToast } from "./components/useToast";
import { initialCustomer } from "./data/customer";
import AdminPage from "./pages/AdminPage";
import { initialReviewsByProduct } from "./data/reviews";
import AccountPage from "./pages/AccountPage";
import CataloguePage from "./pages/CataloguePage";
import CheckoutPage from "./pages/CheckoutPage";
import CommentModerationPage from "./pages/CommentModerationPage";
import DashboardPage from "./pages/DashboardPage";
import RatingModerationPage from "./pages/RatingModerationPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import RegisterPage from "./pages/RegisterPage";
import WishlistPage from "./pages/WishlistPage";
import { fetchCartItems, syncCartItems } from "./services/cartApi";
import { fetchProductById } from "./services/catalogApi";
import { cancelOrder, fetchInvoicePdf, fetchOrders, placeOrder, returnOrderItem } from "./services/customerApi";
import { addWishlistProduct, fetchWishlistProductIds, removeWishlistProduct } from "./services/wishlistApi";

const GUEST_CART_STORAGE_KEY = "guest_cart_items";

function getStoredArray(key) {
  try {
    const rawValue = window.localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function isCustomerCartSession() {
  const token = window.localStorage.getItem("auth_token");
  const role = window.localStorage.getItem("auth_role");
  return Boolean(token && role === "CUSTOMER");
}

function getAvailableStock(item) {
  const stock = Number(item?.stock ?? 0);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
}

function normalizeCartItem(item) {
  if (!item || item.id == null) {
    return null;
  }

  const quantity = Math.floor(Number(item.qty ?? item.quantity ?? 0));
  const stock = item.stock == null ? quantity : getAvailableStock(item);

  if (!Number.isFinite(quantity) || quantity < 1 || stock < 1) {
    return null;
  }

  return {
    ...item,
    id: Number(item.id),
    price: Number(item.price) || 0,
    stock,
    qty: Math.min(quantity, stock),
  };
}

function normalizeCartItems(items) {
  return items.map(normalizeCartItem).filter(Boolean);
}

function mergeCartItems(...itemGroups) {
  const itemsById = new Map();

  itemGroups.flat().forEach((item) => {
    const normalizedItem = normalizeCartItem(item);

    if (!normalizedItem) {
      return;
    }

    const existingItem = itemsById.get(normalizedItem.id);

    if (!existingItem) {
      itemsById.set(normalizedItem.id, normalizedItem);
      return;
    }

    itemsById.set(normalizedItem.id, {
      ...normalizedItem,
      ...existingItem,
      qty: Math.min(existingItem.qty + normalizedItem.qty, existingItem.stock),
    });
  });

  return Array.from(itemsById.values());
}

function saveGuestCartItems(items) {
  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
}

async function refreshGuestCartItems(items) {
  const refreshedItems = await Promise.all(
    normalizeCartItems(items).map(async (item) => {
      try {
        const product = await fetchProductById(item.id);
        return normalizeCartItem({ ...product, qty: item.qty });
      } catch {
        return item;
      }
    })
  );

  return refreshedItems.filter(Boolean);
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

function RoleProtectedRoute({ allowedRoles, children }) {
  const token = window.localStorage.getItem("auth_token");
  const role = window.localStorage.getItem("auth_role");
  const location = useLocation();

  if (!token) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
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
  const toast = useToast();
  const cartSyncSequence = useRef(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState(() => getStoredArray("wishlist_product_ids"));
  const [reviewsByProduct, setReviewsByProduct] = useState(initialReviewsByProduct);
  const [orders, setOrders] = useState([]);
  const [stockByProduct, setStockByProduct] = useState({});

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      const guestItems = normalizeCartItems(getStoredArray(GUEST_CART_STORAGE_KEY));

      if (isCustomerCartSession()) {
        try {
          const serverItems = await fetchCartItems();
          const nextItems = guestItems.length > 0
            ? await syncCartItems(mergeCartItems(serverItems, guestItems))
            : serverItems;

          if (!ignore) {
            setCartSnapshot(nextItems);
            window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          }
        } catch (err) {
          if (!ignore) {
            setCartSnapshot(guestItems);
            saveGuestCartItems(guestItems);
            toast.error(err.message || "Your saved cart could not be loaded.", { title: "Cart sync" });
          }
        }

        return;
      }

      try {
        const refreshedItems = await refreshGuestCartItems(guestItems);

        if (!ignore) {
          setCartSnapshot(refreshedItems);
          saveGuestCartItems(refreshedItems);
        }
      } catch {
        if (!ignore) {
          setCartSnapshot(guestItems);
          saveGuestCartItems(guestItems);
        }
      }
    }

    loadCart();

    return () => {
      ignore = true;
      cartSyncSequence.current += 1;
    };
  }, [location.pathname]);

  useEffect(() => {
    const authEmail = window.localStorage.getItem("auth_email");
    const registeredEmail = window.localStorage.getItem("last_registered_email");
    const storedCustomer = getStoredCustomer();
    const nextEmail = authEmail || registeredEmail || storedCustomer.email || "";

    const nextCustomer = {
      ...storedCustomer,
      id: storedCustomer.id || generateCustomerId(),
      email: nextEmail,
    };

    if (JSON.stringify(storedCustomer) !== JSON.stringify(nextCustomer)) {
      window.localStorage.setItem("customer_profile", JSON.stringify(nextCustomer));
    }
  }, [location.pathname]);

  useEffect(() => {
    let ignore = false;
    const token = window.localStorage.getItem("auth_token");

    if (!token) {
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

  useEffect(() => {
    let ignore = false;
    const token = window.localStorage.getItem("auth_token");
    const role = window.localStorage.getItem("auth_role");

    if (!token || role !== "CUSTOMER") {
      return undefined;
    }

    fetchWishlistProductIds()
      .then((ids) => {
        if (!ignore) {
          setWishlistProductIds(ids);
          window.localStorage.setItem("wishlist_product_ids", JSON.stringify(ids));
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  function setCartSnapshot(nextItems) {
    const normalizedItems = normalizeCartItems(nextItems);

    setCartItems(normalizedItems);
    setStockByProduct(Object.fromEntries(normalizedItems.map((item) => [item.id, item.stock])));

    return normalizedItems;
  }

  async function persistCartSnapshot(nextItems) {
    const normalizedItems = setCartSnapshot(nextItems);

    if (!isCustomerCartSession()) {
      saveGuestCartItems(normalizedItems);
      return normalizedItems;
    }

    const syncId = cartSyncSequence.current + 1;
    cartSyncSequence.current = syncId;

    try {
      const syncedItems = await syncCartItems(normalizedItems);

      if (syncId === cartSyncSequence.current) {
        setCartSnapshot(syncedItems);
        window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      }

      return syncedItems;
    } catch (err) {
      if (syncId === cartSyncSequence.current) {
        toast.error(err.message || "Your cart could not be saved.", { title: "Cart sync" });
      }

      return normalizedItems;
    }
  }

  function clearCartSnapshotAfterOrder() {
    setCartSnapshot([]);

    if (!isCustomerCartSession()) {
      saveGuestCartItems([]);
    } else {
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    }
  }

  async function reloadCustomerCart() {
    if (!isCustomerCartSession()) {
      return [];
    }

    const latestItems = await fetchCartItems();
    setCartSnapshot(latestItems);
    return latestItems;
  }

  function persistWishlist(nextWishlist) {
    setWishlistProductIds(nextWishlist);
    window.localStorage.setItem("wishlist_product_ids", JSON.stringify(nextWishlist));
  }

  async function handleToggleWishlist(productId, productName = "Product") {
    const token = window.localStorage.getItem("auth_token");
    const role = window.localStorage.getItem("auth_role");
    const isRemoving = wishlistProductIds.includes(productId);

    try {
      if (!token || role !== "CUSTOMER") {
        persistWishlist(
          isRemoving
            ? wishlistProductIds.filter((id) => id !== productId)
            : [...wishlistProductIds, productId]
        );
      } else {
        const nextWishlist = isRemoving
          ? await removeWishlistProduct(productId)
          : await addWishlistProduct(productId);

        persistWishlist(nextWishlist);
      }

      toast.success(
        `${productName} ${isRemoving ? "removed from" : "added to"} your wishlist.`,
        { title: "Wishlist updated" }
      );
    } catch (err) {
      toast.error(err.message || "Wishlist could not be updated.", { title: "Wishlist error" });
    }
  }

  function handleAddToCart(product) {
    const availableStock = getAvailableStock(product);
    const productName = product.name || "This item";

    if (availableStock <= 0) {
      toast.warning(`${productName} is out of stock.`, { title: "Cart notice" });
      return;
    }

    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem?.qty >= availableStock) {
      toast.warning(`Only ${availableStock} ${availableStock === 1 ? "copy is" : "copies are"} available.`, {
        title: "Stock limit reached",
      });
      return;
    }

    const nextItems = existingItem
      ? cartItems.map((item) =>
        item.id === product.id
          ? { ...item, stock: availableStock, qty: Math.min(item.qty + 1, availableStock) }
          : item
      )
      : [...cartItems, { ...product, stock: availableStock, qty: 1 }];

    persistCartSnapshot(nextItems);

    toast.success(`${productName} added to your cart.`, { title: "Cart updated" });
  }

  function handleUpdateCartQty(productId, delta) {
    let limitedItem = null;

    const nextItems = cartItems
      .map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const availableStock = getAvailableStock(item);

        if (delta > 0 && item.qty >= availableStock) {
          limitedItem = item;
        }

        const nextQty = Math.max(0, Math.min(item.qty + delta, availableStock));
        return { ...item, qty: nextQty };
      })
      .filter((item) => item.qty > 0);

    persistCartSnapshot(nextItems);

    if (limitedItem) {
      toast.warning(`Only ${limitedItem.stock} ${limitedItem.stock === 1 ? "copy is" : "copies are"} available.`, {
        title: "Stock limit reached",
      });
    }
  }

  function handleRemoveFromCart(productId) {
    const removedItem = cartItems.find((item) => item.id === productId);
    persistCartSnapshot(cartItems.filter((item) => item.id !== productId));

    if (removedItem) {
      toast.info(`${removedItem.name} removed from your cart.`, { title: "Cart updated" });
    }
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

  async function handleCancelOrder(orderId) {
    const updatedOrder = await cancelOrder(orderId);
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.backendOrderId === updatedOrder.backendOrderId ? updatedOrder : order
      )
    );
    toast.success(`Order #${orderId} cancelled.`, { title: "Order updated" });
  }

  async function handleReturnOrderItem(orderId, productId) {
    const updatedOrder = await returnOrderItem(orderId, productId);
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.backendOrderId === updatedOrder.backendOrderId ? updatedOrder : order
      )
    );
    toast.success("Return request completed.", { title: "Order updated" });
  }

  function finalizePlacedOrder(nextOrder) {
    if (cartItems.length === 0) {
      toast.info("Your cart is empty. Pick a title to begin checkout.", { title: "Checkout" });
      navigate("/catalogue");
      return null;
    }

    clearCartSnapshotAfterOrder();
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
      toast.info("Sign in to continue checkout.", { title: "Login required" });
      return;
    }

    setCartOpen(false);
    navigate("/checkout");
  }

  async function handleCheckoutSubmit(checkoutData) {
    let createdOrder;

    try {
      createdOrder = await placeOrder(cartItems, checkoutData.shippingAddress);
    } catch (error) {
      await reloadCustomerCart().catch(() => {});
      throw error;
    }

    const nextOrder = finalizePlacedOrder({
      ...createdOrder,
      shippingAddress: checkoutData.shippingAddress,
      paymentSummary: checkoutData.paymentDetails,
    });

    if (!nextOrder) {
      return;
    }

    navigate("/account", {
      state: { recentOrderId: nextOrder.id },
    });
    toast.success("Your order was placed successfully. Your invoice has been emailed to you.", { title: "Order confirmed" });
  }

  async function handleViewInvoice(orderId) {
    const invoiceBlob = await fetchInvoicePdf(orderId);
    const invoiceUrl = window.URL.createObjectURL(invoiceBlob);
    const invoiceWindow = window.open(invoiceUrl, "_blank");

    if (!invoiceWindow) {
      toast.warning("Please allow pop-ups to view your invoice.", { title: "Invoice" });
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
        <Route path="/admin" element={<Navigate to="/product-manager" replace />} />
        <Route
          path="/product-manager"
          element={
            <RoleProtectedRoute allowedRoles={["PRODUCT_MANAGER"]}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />
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
            <RoleProtectedRoute allowedRoles={["SALES_MANAGER"]}>
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/comments"
          element={
            <RoleProtectedRoute allowedRoles={["SALES_MANAGER"]}>
              <CommentModerationPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ratings"
          element={
            <RoleProtectedRoute allowedRoles={["SALES_MANAGER"]}>
              <RatingModerationPage />
            </RoleProtectedRoute>
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
