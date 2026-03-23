import "./styles/global.css";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import LibrariesSection from "./components/LibrariesSection";
import NotableSection from "./components/NotableSection";
import EditorsChoice from "./components/EditorsChoice";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="app-wrapper">
      <Header />
      <Nav />
      <main>
        <Hero />
        <LibrariesSection />
        <NotableSection />
        <EditorsChoice />
      </main>
      <Footer />
    </div>
  );
}