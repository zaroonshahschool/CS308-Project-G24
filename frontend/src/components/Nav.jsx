export default function Nav() {
  const items = ["New Releases", "Limited Editions", "Catalogue", "Collections", "Gifts"];
  return (
    <nav className="nav">
      {items.map((item) => <a key={item} href="#">{item}</a>)}
    </nav>
  );
}