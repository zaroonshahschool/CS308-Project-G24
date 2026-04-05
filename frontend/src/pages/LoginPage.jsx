import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

function generateCustomerId() {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nextPath = searchParams.get("next") || "/account";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const existingProfile = (() => {
        try {
          const rawValue = window.localStorage.getItem("customer_profile");
          return rawValue ? JSON.parse(rawValue) : null;
        } catch {
          return null;
        }
      })();

      const nextProfile = {
        id: existingProfile?.id || generateCustomerId(),
        name: data.name || existingProfile?.name || "",
        taxId: existingProfile?.taxId || "",
        email: data.email || form.email.trim().toLowerCase(),
        homeAddress: existingProfile?.homeAddress || "",
        password: form.password,
      };

      window.localStorage.setItem("auth_token", data.token);
      window.localStorage.setItem("auth_role", data.role);
      window.localStorage.setItem("auth_email", nextProfile.email);
      window.localStorage.setItem("customer_profile", JSON.stringify(nextProfile));
      navigate(nextPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="auth-brand">Aurelia Editions</p>
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Customers can browse freely. Sign in is only required for protected actions like placing an order, payment, and account access.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-link-row">
          Need an account? <Link className="auth-link" to="/register">Register</Link>
        </p>
        <p className="auth-link-row">
          <Link className="auth-link" to="/">Continue browsing</Link>
        </p>
      </section>
    </main>
  );
}
