import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAdminNotifications } from "../context/AdminNotificationContext";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { permission, requestPermission } = useAdminNotifications();

  useEffect(() => {
    Promise.all([
      api.get("/products/admin"),
      api.get("/orders"),
      api.get("/users"),
      api.get("/subscriptions"),
    ]).then(([products, orders, users, subs]) => {
      const pending = orders.data.filter((o) =>
        ["placed", "confirmed", "out_for_delivery"].includes(o.orderStatus)
      ).length;
      setStats({
        products: products.data.length,
        orders: orders.data.length,
        pending,
        users: users.data.length,
        activeSubs: subs.data.filter((s) => s.status === "active").length,
      });
    });
  }, []);

  const cards = [
    { label: "Products", value: stats?.products, to: "/products", icon: "🥛", tint: "bg-brand-500/12 dark:bg-brand-500/20" },
    { label: "Total Orders", value: stats?.orders, to: "/orders", icon: "📦", tint: "bg-blue-500/12 dark:bg-blue-500/20" },
    { label: "Pending Orders", value: stats?.pending, to: "/orders", icon: "⏳", tint: "bg-gold-500/14 dark:bg-gold-500/22" },
    { label: "Users", value: stats?.users, to: "/users", icon: "👥", tint: "bg-purple-500/12 dark:bg-purple-500/20" },
    { label: "Active Subscriptions", value: stats?.activeSubs, to: "/subscriptions", icon: "🔁", tint: "bg-teal-500/12 dark:bg-teal-500/20" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold tracking-tight text-ink">Dashboard</h1>

      {permission === "default" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-300/50 bg-brand-500/8 p-4 dark:border-brand-400/25 dark:bg-brand-400/10">
          <p className="text-sm text-ink">
            Turn on browser notifications to get alerted the moment a customer places an order —
            even when this tab isn't in front.
          </p>
          <button onClick={requestPermission} className="btn btn-primary whitespace-nowrap">
            Enable Notifications
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="card flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${card.tint}`}>
              {card.icon}
            </span>
            <div>
              <p className="text-2xl font-bold text-ink">{card.value ?? "…"}</p>
              <p className="text-sm text-ink-faint">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
