import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./styles/global.css";

import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import { initialReviewsByProduct } from "./data/reviews";
import { getInitialOrders, getInitialStockByProduct, initialCustomer } from "./data/customer";

export default function App() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewsByProduct, setReviewsByProduct] = useState(() => {
    const storedReviews = window.localStorage.getItem("aurelia-reviews");
    return storedReviews ? JSON.parse(storedReviews) : initialReviewsByProduct;
  });
  const [wishlistProductIds, setWishlistProductIds] = useState(() => {
    const storedWishlist = window.localStorage.getItem("aurelia-wishlist");
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });
  const [customer, setCustomer] = useState(() => {
    const storedCustomer = window.localStorage.getItem("aurelia-customer");
    return storedCustomer ? JSON.parse(storedCustomer) : initialCustomer;
  });
  const [orders, setOrders] = useState(() => {
    const storedOrders = window.localStorage.getItem("aurelia-orders");
    return storedOrders ? JSON.parse(storedOrders) : getInitialOrders();
  });
  const [stockByProduct, setStockByProduct] = useState(() => {
    const storedStock = window.localStorage.getItem("aurelia-stock");
    return storedStock ? JSON.parse(storedStock) : getInitialStockByProduct();
  });

  useEffect(() => {
    window.localStorage.setItem("aurelia-reviews", JSON.stringify(reviewsByProduct));
  }, [reviewsByProduct]);

  useEffect(() => {
    window.localStorage.setItem("aurelia-wishlist", JSON.stringify(wishlistProductIds));
  }, [wishlistProductIds]);

  useEffect(() => {
    window.localStorage.setItem("aurelia-customer", JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    window.localStorage.setItem("aurelia-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    window.localStorage.setItem("aurelia-stock", JSON.stringify(stockByProduct));
  }, [stockByProduct]);

  function addToCart(product) {
    const availableStock = stockByProduct[product.id] ?? product.stock;

    if (availableStock === 0) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.qty >= availableStock) {
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prev, { ...product, stock: availableStock, qty: 1 }];
    });

    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateQty(id, delta) {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;

          const availableStock = stockByProduct[item.id] ?? item.stock;
          const nextQty = Math.max(0, Math.min(item.qty + delta, availableStock));

          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0)
    );
  }

  function submitReview(productId, reviewInput) {
    const newReview = {
      id: `${productId}-${Date.now()}`,
      ...reviewInput,
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };

    setReviewsByProduct((prev) => ({
      ...prev,
      [productId]: [...(prev[productId] ?? []), newReview],
    }));
  }

  function toggleWishlist(productId) {
    setWishlistProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function placeOrder() {
    if (cartItems.length === 0) return;

    const newOrder = {
      id: `ORD-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
      placedAt: new Date().toISOString().slice(0, 10),
      status: "processing",
      total: cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      items: cartItems.map((item) => ({
        id: `${item.id}-${Date.now()}`,
        productId: item.id,
        name: item.name,
        author: item.author,
        category: item.category,
        image: item.image,
        price: item.price,
        qty: item.qty,
        returnedAt: null,
      })),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setStockByProduct((prev) => {
      const next = { ...prev };
      cartItems.forEach((item) => {
        next[item.id] = Math.max(0, (next[item.id] ?? item.stock) - item.qty);
      });
      return next;
    });
    setCartItems([]);
    setCartOpen(false);
    navigate("/account");
  }

  function cancelOrder(orderId) {
    const order = orders.find((entry) => entry.id === orderId);
    if (!order || order.status !== "processing") return;

    setOrders((prev) =>
      prev.map((entry) =>
        entry.id === orderId
          ? { ...entry, status: "cancelled", cancelledAt: new Date().toISOString().slice(0, 10) }
          : entry
      )
    );

    setStockByProduct((prev) => {
      const next = { ...prev };
      order.items.forEach((item) => {
        next[item.productId] = (next[item.productId] ?? 0) + item.qty;
      });
      return next;
    });
  }

  function returnOrderItem(orderId, itemId) {
    const order = orders.find((entry) => entry.id === orderId);
    const item = order?.items.find((entry) => entry.id === itemId);

    if (!order || !item || order.status === "cancelled" || item.returnedAt) return;

    const returnedAt = new Date().toISOString().slice(0, 10);

    setOrders((prev) =>
      prev.map((entry) => {
        if (entry.id !== orderId) return entry;

        const nextItems = entry.items.map((orderItem) =>
          orderItem.id === itemId ? { ...orderItem, returnedAt } : orderItem
        );
        const allReturned = nextItems.every((orderItem) => Boolean(orderItem.returnedAt));

        return {
          ...entry,
          items: nextItems,
          status: allReturned ? "returned" : "partially returned",
        };
      })
    );

    setStockByProduct((prev) => ({
      ...prev,
      [item.productId]: (prev[item.productId] ?? 0) + item.qty,
    }));
  }

  function updateCustomer(nextCustomer) {
    setCustomer(nextCustomer);
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistProductIds.length}
        onCartOpen={() => setCartOpen(true)}
      />
      <Nav />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/catalogue"
          element={
            <CataloguePage
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              reviewsByProduct={reviewsByProduct}
              stockByProduct={stockByProduct}
              wishlistProductIds={wishlistProductIds}
            />
          }
        />
        <Route
          path="/catalogue/:productId"
          element={
            <ProductDetailPage
              onAddToCart={addToCart}
              onSubmitReview={submitReview}
              onToggleWishlist={toggleWishlist}
              reviewsByProduct={reviewsByProduct}
              stockByProduct={stockByProduct}
              wishlistProductIds={wishlistProductIds}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              stockByProduct={stockByProduct}
              wishlistProductIds={wishlistProductIds}
            />
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/account"
          element={
            <AccountPage
              customer={customer}
              orders={orders}
              onCancelOrder={cancelOrder}
              onReturnOrderItem={returnOrderItem}
              onUpdateCustomer={updateCustomer}
            />
          }
        />
      </Routes>

      <Footer />

      <CartDrawer
        items={cartItems}
        isOpen={cartOpen}
        onCheckout={placeOrder}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
      />
    </>
  );
}