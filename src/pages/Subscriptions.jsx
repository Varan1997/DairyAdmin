import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { SearchIcon } from "../components/icons";

const statuses = ["active", "paused", "cancelled"];

const statusStyles = {
  active: "bg-brand-100 text-brand-700",
  paused: "bg-gold-100 text-gold-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};

const initials = (label) =>
  (label || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/subscriptions")
      .then((res) => setSubs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const active = subs.filter((s) => s.status === "active").length;
    const paused = subs.filter((s) => s.status === "paused").length;
    const cancelled = subs.filter((s) => s.status === "cancelled").length;
    const mrr = subs
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.price * s.quantity, 0);
    return { total: subs.length, active, paused, cancelled, mrr };
  }, [subs]);

  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subs.filter((s) => {
      if (filter && s.status !== filter) return false;
      if (!q) return true;
      return (
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.phone?.toLowerCase().includes(q) ||
        s.product?.name?.toLowerCase().includes(q)
      );
    });
  }, [subs, filter, search]);

  const statCards = [
    { label: "Total Subscriptions", value: stats.total, icon: "🔁", tint: "bg-blue-500/12 dark:bg-blue-500/20" },
    { label: "Active", value: stats.active, icon: "✅", tint: "bg-brand-500/12 dark:bg-brand-500/20" },
    { label: "Paused", value: stats.paused, icon: "⏸️", tint: "bg-gold-500/14 dark:bg-gold-500/22" },
    {
      label: "Daily Value (Active)",
      value: `₹${stats.mrr.toLocaleString("en-IN")}`,
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Subscriptions</h1>
        <p className="text-sm text-ink-faint">
          {loading ? "Loading…" : `${filteredSubs.length} subscription${filteredSubs.length === 1 ? "" : "s"}`}
        </p>
      </div>

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
            placeholder="Search name, phone or product"
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
                <div className="h-6 w-16 rounded-full bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSubs.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl dark:bg-brand-500/20">
            🔁
          </span>
          <p className="font-medium text-ink">No subscriptions found</p>
          <p className="text-sm text-ink-faint">
            {search || filter ? "Try a different search or filter." : "Subscriptions will show up here once customers subscribe."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubs.map((s) => (
            <div
              key={s._id}
              className="card flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-glow">
                    {initials(s.user?.name || s.user?.phone)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{s.user?.name || s.user?.phone}</p>
                    <p className="truncate text-xs text-ink-faint">{s.user?.phone}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusStyles[s.status] || "bg-surface-2 text-ink-muted"
                  }`}
                >
                  {statusLabels[s.status] || s.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted">
                  {s.product?.name} ({s.packSize})
                </span>
                <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted">
                  × {s.quantity} / day
                </span>
                <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted">
                  {s.paymentMethod}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-ink-faint">
                <span>Started {new Date(s.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="font-semibold text-ink">₹{s.price * s.quantity}/day</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
