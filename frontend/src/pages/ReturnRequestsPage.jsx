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

function RejectReturnRequestModal({ request, reason, submitting, onChangeReason, onClose, onSubmit }) {
  if (!request) return null;

  return (
    <div className="return-modal-backdrop" role="presentation">
      <form className="return-modal" onSubmit={onSubmit}>
        <div className="return-modal-head">
          <div>
            <p className="order-meta">Order #{request.orderId}</p>
            <h2 className="account-card-title">Reject Return</h2>
          </div>
          <button className="toast-close" type="button" aria-label="Close rejection modal" onClick={onClose}>
            x
          </button>
        </div>

        <p className="order-item-name">{request.productName}</p>
        <p className="order-item-meta">{request.customerName}</p>

        <label className="return-modal-field">
          <span>Rejection reason</span>
          <textarea
            value={reason}
            onChange={(event) => onChangeReason(event.target.value)}
            placeholder="Explain why this return request is being rejected"
            maxLength={1000}
            required
          />
        </label>

        <div className="return-modal-actions">
          <button className="wishlist-secondary-btn" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={submitting || !reason.trim()}>
            {submitting ? "Rejecting..." : "Reject Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ReturnRequestsPage() {
  const toast = useToast();
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  function openRejectModal(request) {
    setError("");
    setRejectionReason("");
    setRejectModal(request);
  }

  function closeRejectModal() {
    if (actingId) return;
    setRejectModal(null);
    setRejectionReason("");
  }

  async function handleReject(event) {
    event.preventDefault();
    if (!rejectModal) return;

    const id = rejectModal.id;
    setError("");
    setActingId(id);

    try {
      const updatedRequest = await rejectReturnRequest(id, rejectionReason);
      setReturnRequests((requests) =>
        requests.map((request) => (request.id === id ? updatedRequest : request))
      );
      setRejectModal(null);
      setRejectionReason("");
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
      <RejectReturnRequestModal
        request={rejectModal}
        reason={rejectionReason}
        submitting={Boolean(actingId)}
        onChangeReason={setRejectionReason}
        onClose={closeRejectModal}
        onSubmit={handleReject}
      />

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
                    <p className="order-note return-request-reason">Customer reason: {request.reason}</p>
                  ) : null}

                  {status === "rejected" && request.rejectionReason ? (
                    <p className="order-note return-request-reason">Rejection reason: {request.rejectionReason}</p>
                  ) : null}

                  {pending ? (
                    <div className="order-card-footer return-request-actions">
                      <div />
                      <div className="order-card-actions">
                        <button
                          className="wishlist-secondary-btn"
                          type="button"
                          onClick={() => openRejectModal(request)}
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
