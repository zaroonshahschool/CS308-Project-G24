import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toastContext";

const DEFAULT_DURATION = 4200;
const TOAST_LIMIT = 4;

const TOAST_LABELS = {
  success: "Success",
  error: "Error",
  warning: "Notice",
  info: "Info",
};

const TOAST_SIGNS = {
  success: "OK",
  error: "!",
  warning: "!",
  info: "i",
};

function createToastId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const type = toast.type || "info";
        return (
          <section key={toast.id} className={`toast-card toast-card--${type}`} role="status">
            <span className="toast-sign" aria-hidden="true">
              {TOAST_SIGNS[type] || TOAST_SIGNS.info}
            </span>
            <div className="toast-copy">
              <p className="toast-title">{toast.title || TOAST_LABELS[type] || TOAST_LABELS.info}</p>
              {toast.message ? <p className="toast-message">{toast.message}</p> : null}
            </div>
            <button
              className="toast-close"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
            >
              x
            </button>
          </section>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutsRef.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = DEFAULT_DURATION }) => {
      const id = createToastId();
      const nextToast = { id, type, title, message };

      setToasts((currentToasts) => [nextToast, ...currentToasts].slice(0, TOAST_LIMIT));

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => dismissToast(id), duration);
        timeoutsRef.current.set(id, timeoutId);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
      success: (message, options = {}) => showToast({ ...options, message, type: "success" }),
      error: (message, options = {}) => showToast({ ...options, message, type: "error" }),
      warning: (message, options = {}) => showToast({ ...options, message, type: "warning" }),
      info: (message, options = {}) => showToast({ ...options, message, type: "info" }),
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
