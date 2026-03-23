import { libraries } from "../data/libraries";
export default function LibrariesSection() {
  return (
    <section className="section-libraries">
      <div className="libraries-grid">
        {libraries.map((lib) => (
          <a key={lib.name} href="#" className="library-card" style={{ backgroundImage: `url(${lib.image})` }}>
            <div className="library-name">{lib.name}</div>
          </a>
        ))}
      </div>
    </section>
  );
}