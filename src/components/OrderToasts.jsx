import { useNavigate } from "react-router-dom";
import { useAdminNotifications } from "../context/AdminNotificationContext";

export default function OrderToasts() {
  const { toasts, dismissToast } = useAdminNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-16 z-50 flex w-80 max-w-[90vw] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in card cursor-pointer p-3 shadow-soft-lg"
          onClick={() => {
            dismissToast(t.id);
            navigate("/orders");
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-brand-500">🥛 New order placed!</p>
              <p className="mt-0.5 text-sm text-ink">{t.customerName}</p>
              <p className="truncate text-xs text-ink-faint">{t.itemsSummary}</p>
              <p className="mt-1 text-xs font-medium text-ink-muted">
                ₹{t.totalAmount} · {t.paymentMethod}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(t.id);
              }}
              className="text-ink-faint hover:text-ink"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
