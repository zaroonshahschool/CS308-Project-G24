import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const role = window.localStorage.getItem("auth_role") ?? "UNKNOWN";
  const token = window.localStorage.getItem("auth_token") ?? "";
  const [statusMessage, setStatusMessage] = useState("Loading protected access...");
  const [error, setError] = useState("");

  useEffect(() => {
    let endpoint = "/api/customer/dashboard";

    if (role === "PRODUCT_MANAGER") {
      endpoint = "/api/product-manager/products";
    } else if (role === "SALES_MANAGER") {
      endpoint = "/api/sales-manager/sales";
    }

    apiFetch(endpoint)
      .then((data) => setStatusMessage(data.message ?? "Protected request succeeded."))
      .catch((err) => setError(err.message));
  }, [role]);

  function handleLogout() {
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("auth_role");
    navigate("/login");
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <p className="dashboard-kicker">Authenticated Session</p>
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-text">Logged in as: <strong>{role}</strong></p>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <p className="dashboard-label">Role</p>
            <p className="dashboard-value">{role}</p>
          </div>
          <div className="dashboard-panel">
            <p className="dashboard-label">Token Stored</p>
            <p className="dashboard-value">{token ? "Yes" : "No"}</p>
          </div>
          <div className="dashboard-panel">
            <p className="dashboard-label">Protected Endpoint</p>
            <p className="dashboard-value">{statusMessage}</p>
          </div>
          <div className="dashboard-panel">
            <p className="dashboard-label">Security</p>
            <p className="dashboard-value">JWT in Authorization header</p>
          </div>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <div className="dashboard-actions">
          <button className="dashboard-button" onClick={handleLogout}>Logout</button>
          <button className="dashboard-button dashboard-button--secondary" onClick={() => navigate("/register")}>Create Another User</button>
        </div>
      </section>
    </main>
  );
}
