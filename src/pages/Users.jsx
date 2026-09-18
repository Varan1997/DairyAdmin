import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { SearchIcon } from "../components/icons";

const initials = (label) =>
  (label || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

const avatarTints = [
  "from-brand-500 to-brand-700",
  "from-blue-500 to-blue-700",
  "from-gold-400 to-gold-600",
  "from-purple-500 to-purple-700",
  "from-teal-500 to-teal-700",
];

const avatarTint = (id) => avatarTints[[...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0) % avatarTints.length];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleActive = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/users/${id}/toggle-active`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const active = users.filter((u) => u.isActive).length;
    const blocked = users.length - active;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = users.filter((u) => new Date(u.createdAt).getTime() >= weekAgo).length;
    return { total: users.length, active, blocked, newThisWeek };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "active" && !u.isActive) return false;
      if (filter === "blocked" && u.isActive) return false;
      if (!q) return true;
      return u.name?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
    });
  }, [users, search, filter]);

  const statCards = [
    { label: "Total Users", value: stats.total, icon: "👥", tint: "bg-blue-500/12 dark:bg-blue-500/20" },
    { label: "Active", value: stats.active, icon: "✅", tint: "bg-brand-500/12 dark:bg-brand-500/20" },
    { label: "Blocked", value: stats.blocked, icon: "🚫", tint: "bg-red-500/12 dark:bg-red-500/20" },
    { label: "New This Week", value: stats.newThisWeek, icon: "✨", tint: "bg-purple-500/12 dark:bg-purple-500/20" },
  ];

  const pillClass = (value) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      filter === value
        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
        : "bg-surface-2 text-ink-muted hover:bg-surface-hover"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Users</h1>
        <p className="text-sm text-ink-faint">
          {loading ? "Loading…" : `${filteredUsers.length} user${filteredUsers.length === 1 ? "" : "s"}`}
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
            placeholder="Search name or phone"
            className="input !pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("")} className={pillClass("")}>
            All
          </button>
          <button onClick={() => setFilter("active")} className={pillClass("active")}>
            Active
          </button>
          <button onClick={() => setFilter("blocked")} className={pillClass("blocked")}>
            Blocked
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 border-t border-line p-4 first:border-t-0">
              <div className="h-10 w-10 shrink-0 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/4 rounded bg-surface-2" />
                <div className="h-3 w-1/6 rounded bg-surface-2" />
              </div>
              <div className="h-6 w-16 rounded-full bg-surface-2" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl dark:bg-brand-500/20">
            👥
          </span>
          <p className="font-medium text-ink">No users found</p>
          <p className="text-sm text-ink-faint">
            {search || filter ? "Try a different search or filter." : "Users will show up here once customers register."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left text-ink-muted">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Addresses</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-t border-line text-ink-muted transition hover:bg-surface-2/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarTint(
                          u._id
                        )}`}
                      >
                        {initials(u.name || u.phone)}
                      </span>
                      <span className="font-medium text-ink">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted">
                      {u.addresses?.length || 0}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.isActive ? "bg-brand-100 text-brand-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      disabled={busyId === u._id}
                      onClick={() => toggleActive(u._id)}
                      className={`text-sm font-medium hover:underline disabled:opacity-60 ${
                        u.isActive ? "text-red-500" : "text-brand-500"
                      }`}
                    >
                      {u.isActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
