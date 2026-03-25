import { Routes, Route } from "react-router-dom";
import "./styles/global.css";

import Header       from "./components/Header";
import Nav          from "./components/Nav";
import Footer       from "./components/Footer";
import HomePage     from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";

export default function App() {
  return (
    <>
      <Header />
      <Nav />

      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/catalogue" element={<CataloguePage onAddToCart={() => {}} />} />
      </Routes>

      <Footer />
    </>
  );
}