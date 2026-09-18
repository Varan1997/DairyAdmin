import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminNotifications } from "../context/AdminNotificationContext";
import { BellIcon } from "./icons";

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, permission, requestPermission } =
    useAdminNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => {
    setOpen((o) => {
      if (!o) markAllRead();
      return !o;
    });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-2 hover:text-ink"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 z-50 mt-2 w-80 max-w-[90vw] shadow-soft-lg">
            <div className="flex items-center justify-between border-b border-line p-3">
              <span className="text-sm font-semibold text-ink-muted">Order Notifications</span>
              {permission !== "granted" && permission !== "unsupported" && (
                <button
                  onClick={requestPermission}
                  className="text-xs font-medium text-brand-500 hover:underline"
                >
                  Enable browser alerts
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="p-4 text-center text-sm text-ink-faint">No notifications yet</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setOpen(false);
                    navigate("/orders");
                  }}
                  className="flex w-full flex-col gap-0.5 border-b border-line p-3 text-left transition hover:bg-surface-2"
                >
                  <span className="text-sm font-medium text-ink">
                    {n.customerName} placed an order
                  </span>
                  <span className="truncate text-xs text-ink-faint">{n.itemsSummary}</span>
                  <span className="flex items-center justify-between text-xs text-ink-faint">
                    <span>₹{n.totalAmount} · {n.paymentMethod}</span>
                    <span>{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
