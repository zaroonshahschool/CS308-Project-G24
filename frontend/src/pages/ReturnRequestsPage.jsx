import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/useToast";
import {
  approveReturnRequest,
  fetchReturnRequests,
  rejectReturnRequest,
} from "../services/salesManagerApi";

function normalizeStatus(status) {
  return (status || "PENDING").toLowerCase();
}

function getStatusLabel(status) {
  return status === "pending" ? "waiting" : status;
}

function formatDate(value) {
  return value ? value.slice(0, 10) : "-";
}

export default function ReturnRequestsPage() {
  const toast = useToast();
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchReturnRequests()
      .then((data) => {
        if (!ignore) {
          setReturnRequests(data);
        }
      })
      .catch((loadError) => {
        if (!ignore) {
          const message = loadError.message || "Return requests could not be loaded.";
          setError(message);
          toast.error(message, { title: "Return requests" });
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [toast]);

  async function handleApprove(id) {
    setError("");
    setActingId(id);

    try {
      const updatedRequest = await approveReturnRequest(id);
      setReturnRequests((requests) =>
        requests.map((request) => (request.id === id ? updatedRequest : request))
      );
      toast.success(`Refund amount: $${Number(updatedRequest.refundAmount || 0).toFixed(2)}.`, {
        title: "Return approved",
      });
    } catch (approveError) {
      const message = approveError.message || "Failed to approve return request.";
      setError(message);
      toast.error(message, { title: "Return error" });
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id) {
    setError("");
    setActingId(id);

    try {
      const updatedRequest = await rejectReturnRequest(id);
      setReturnRequests((requests) =>
        requests.map((request) => (request.id === id ? updatedRequest : request))
      );
      toast.info("Return request rejected.", { title: "Return updated" });
    } catch (rejectError) {
      const message = rejectError.message || "Failed to reject return request.";
      setError(message);
      toast.error(message, { title: "Return error" });
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="customer-page">
      <div className="catalogue-breadcrumb">
        <Link to="/dashboard" className="breadcrumb-link">Back to Dashboard</Link>
      </div>

      <section className="customer-shell">
        <div className="customer-page-head">
          <h1 className="section-title">Return Requests</h1>
          <p className="section-subtitle">Review pending requests and keep an audit trail of approved and rejected returns.</p>
        </div>

        <div className="account-card">
          {error ? <p className="checkout-error">{error}</p> : null}
          {loading ? <p className="section-subtitle">Loading return requests...</p> : null}
          {!loading && returnRequests.length === 0 ? (
            <p className="section-subtitle">No return requests found.</p>
          ) : null}

          <div className="return-request-list">
            {returnRequests.map((request) => {
              const status = normalizeStatus(request.status);
              const pending = status === "pending";

              return (
                <article key={request.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <p className="order-item-name">{request.productName}</p>
                      <p className="order-meta">
                        Order #{request.orderId} · {request.customerName} · ordered {formatDate(request.orderDate)}
                      </p>
                      <p className="order-item-meta">
                        Requested {formatDate(request.requestedAt)}
                        {request.resolvedAt ? ` · Resolved ${formatDate(request.resolvedAt)}` : ""}
                        {` · Refund $${Number(request.refundAmount || 0).toFixed(2)}`}
                      </p>
                    </div>
                    <div className={`order-status order-status--${status}`}>
                      {getStatusLabel(status)}
                    </div>
                  </div>

                  {request.reason ? (
                    <p className="order-note return-request-reason">{request.reason}</p>
                  ) : null}

                  {pending ? (
                    <div className="order-card-footer return-request-actions">
                      <div />
                      <div className="order-card-actions">
                        <button
                          className="wishlist-secondary-btn"
                          type="button"
                          onClick={() => handleReject(request.id)}
                          disabled={actingId === request.id}
                        >
                          Reject
                        </button>
                        <button
                          className="btn-primary"
                          type="button"
                          onClick={() => handleApprove(request.id)}
                          disabled={actingId === request.id}
                        >
                          {actingId === request.id ? "Updating..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
