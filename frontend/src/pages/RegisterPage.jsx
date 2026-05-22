import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/useToast";
import { apiFetch } from "../lib/api";
import { persistRegistrationHint } from "../lib/securityStorage";

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nextPath = searchParams.get("next");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      persistRegistrationHint(form.email);
      toast.success("Your account was created. Please sign in.", { title: "Registration complete" });
      navigate(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Registration failed.", { title: "Registration failed" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="auth-brand">Aurelia Editions</p>
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">Create a customer account for ordering, payment, and order history while keeping the storefront open to all visitors.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input name="password" type="password" minLength={8} maxLength={72} value={form.password} onChange={handleChange} required />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="auth-link-row">
          Already registered? <Link className="auth-link" to="/login">Login</Link>
        </p>
        <p className="auth-link-row">
          <Link className="auth-link" to="/">Continue browsing</Link>
        </p>
      </section>
    </main>
  );
}
