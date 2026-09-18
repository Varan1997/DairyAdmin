import { useEffect, useMemo, useState } from "react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderTracker from "../components/OrderTracker";
import LocationMap from "../components/LocationMap";
import OrdersCalendar from "../components/OrdersCalendar";
import api from "../api/axios";
import { CalendarIcon, PinIcon, SearchIcon } from "../components/icons";

const statuses = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"];

const statusLabels = {
  placed: "Placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const paymentStatusTint = {
  paid: "text-brand-600 dark:text-brand-400",
  pending: "text-gold-600 dark:text-gold-400",
  failed: "text-red-500",
};

const initials = (label) =>
  (label || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const dateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDateKey = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/orders", { params: filter ? { status: filter } : {} })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (id, orderStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { orderStatus });
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = orders.filter((o) =>
      ["placed", "confirmed", "out_for_delivery"].includes(o.orderStatus)
    ).length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const revenue = orders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { total: orders.length, pending, delivered, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (selectedDate && dateKey(o.createdAt) !== selectedDate) return false;
      if (!q) return true;
      return (
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.phone?.toLowerCase().includes(q)
      );
    });
  }, [orders, search, selectedDate]);

  const statCards = [
    { label: "Total Orders", value: stats.total, icon: "📦", tint: "bg-blue-500/12 dark:bg-blue-500/20" },
    { label: "Pending", value: stats.pending, icon: "⏳", tint: "bg-gold-500/14 dark:bg-gold-500/22" },
    { label: "Delivered", value: stats.delivered, icon: "✅", tint: "bg-brand-500/12 dark:bg-brand-500/20" },
    {
      label: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: "💰",
      tint: "bg-purple-500/12 dark:bg-purple-500/20",
    },
  ];

  const pillClass = (value) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
      filter === value
        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
        : "bg-surface-2 text-ink-muted hover:bg-surface-hover"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">Orders</h1>
          <p className="text-sm text-ink-faint">
            {loading ? "Loading…" : `${filteredOrders.length} order${filteredOrders.length === 1 ? "" : "s"}`}
            {selectedDate && !loading && <> · {formatDateKey(selectedDate)}</>}
          </p>
        </div>
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            showCalendar ? "bg-surface-2 text-ink" : "text-ink-muted hover:bg-surface-2"
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
          {showCalendar ? "Hide calendar" : "Show calendar"}
        </button>
      </div>

      {showCalendar && (
        <OrdersCalendar orders={orders} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}

      {selectedDate && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-300/50 bg-brand-500/8 px-3.5 py-2.5 text-sm dark:border-brand-400/25 dark:bg-brand-400/10">
          <CalendarIcon className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
          <span className="text-ink">
            Showing orders from <strong>{formatDateKey(selectedDate)}</strong> only
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="ml-auto shrink-0 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="card flex items-center gap-3 p-3.5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${c.tint}`}>
              {c.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-ink">{loading ? "…" : c.value}</p>
              <p className="truncate text-xs text-ink-faint">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, name or phone"
            className="input !pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("")} className={pillClass("")}>
            All
          </button>
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={pillClass(s)}>
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-surface-2" />
                  <div className="h-3 w-1/4 rounded bg-surface-2" />
                </div>
                <div className="h-6 w-20 rounded-full bg-surface-2" />
              </div>
              <div className="mt-4 h-3 w-2/3 rounded bg-surface-2" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl dark:bg-brand-500/20">
            📦
          </span>
          <p className="font-medium text-ink">No orders found</p>
          <p className="text-sm text-ink-faint">
            {search
              ? "Try a different search term."
              : selectedDate
              ? "No orders were placed on this day."
              : "Orders will show up here once customers start ordering."}
          </p>
          {(search || selectedDate) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedDate(null);
              }}
              className="btn btn-secondary mt-1"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="card overflow-hidden transition hover:shadow-soft-lg">
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-glow">
                    {initials(order.user?.name || order.user?.phone)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{order.user?.name || order.user?.phone}</p>
                      <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-faint">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {timeAgo(order.createdAt)} · {order.orderType === "subscription" ? "Subscription" : "One-time"} ·{" "}
                      {order.paymentMethod}{" "}
                      <span className={`font-medium ${paymentStatusTint[order.paymentStatus] || ""}`}>
                        ({order.paymentStatus})
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-lg font-bold text-ink">₹{order.totalAmount}</p>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {order.items.map((item, idx) => (
                  <span key={idx} className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted">
                    {item.productName} ({item.packSize}) × {item.quantity}
                  </span>
                ))}
              </div>

              <div className="flex items-start gap-2 border-t border-line px-4 py-3 text-xs text-ink-faint">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}, {order.deliveryAddress.city} -{" "}
                  {order.deliveryAddress.pincode} · via {order.deliveryPartner}
                  {order.deliveryAddress.location && (
                    <>
                      {" · "}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.location.lat},${order.deliveryAddress.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-500 hover:underline"
                      >
                        View on map
                      </a>
                      {order.deliveryAddress.location.accuracy && (
                        <span> (±{order.deliveryAddress.location.accuracy}m)</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/50 px-4 py-3">
                <select
                  value={order.orderStatus}
                  disabled={updatingId === order._id}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="input w-auto !py-1.5"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  className="btn btn-outline !px-3 !py-1.5 text-xs"
                >
                  {expandedId === order._id ? "Hide tracking" : "Track order"}
                </button>
              </div>

              {expandedId === order._id && (
                <div className="flex flex-col gap-3 border-t border-line p-4">
                  <OrderTracker status={order.orderStatus} />
                  {order.deliveryAddress.location && (
                    <LocationMap
                      lat={order.deliveryAddress.location.lat}
                      lng={order.deliveryAddress.location.lng}
                      height={200}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
