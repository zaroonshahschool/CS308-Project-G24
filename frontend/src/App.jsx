import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/global.css";

import Header        from "./components/Header";
import Nav           from "./components/Nav";
import Footer        from "./components/Footer";
import CartDrawer    from "./components/CartDrawer";
import HomePage      from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { initialReviewsByProduct } from "./data/reviews";

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [reviewsByProduct, setReviewsByProduct] = useState(() => {
    const storedReviews = window.localStorage.getItem("aurelia-reviews");
    return storedReviews ? JSON.parse(storedReviews) : initialReviewsByProduct;
  });

  useEffect(() => {
    window.localStorage.setItem("aurelia-reviews", JSON.stringify(reviewsByProduct));
  }, [reviewsByProduct]);

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id, delta) {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
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

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <Nav />

      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route
          path="/catalogue"
          element={<CataloguePage onAddToCart={addToCart} reviewsByProduct={reviewsByProduct} />}
        />
        <Route
          path="/catalogue/:productId"
          element={
            <ProductDetailPage
              onAddToCart={addToCart}
              reviewsByProduct={reviewsByProduct}
              onSubmitReview={submitReview}
            />
          }
        />
      </Routes>

      <Footer />

      <CartDrawer
        items={cartItems}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
      />
    </>
  );
}
