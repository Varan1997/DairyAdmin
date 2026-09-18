import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { PinIcon, PlusIcon, SearchIcon, TrashIcon } from "../components/icons";

export default function ServiceableAreas() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPincode, setNewPincode] = useState("");
  const [newCity, setNewCity] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/serviceability")
      .then((res) => setPincodes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{6}$/.test(newPincode)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    setAdding(true);
    try {
      await api.post("/serviceability", { pincode: newPincode, city: newCity });
      setNewPincode("");
      setNewCity("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add pincode");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (p) => {
    setBusyId(p._id);
    try {
      await api.put(`/serviceability/${p._id}`, { isActive: !p.isActive });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this pincode from the serviceable list?")) return;
    setBusyId(id);
    try {
      await api.delete(`/serviceability/${id}`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const active = pincodes.filter((p) => p.isActive).length;
    return { total: pincodes.length, active, disabled: pincodes.length - active };
  }, [pincodes]);

  const filteredPincodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pincodes.filter((p) => {
      if (filter === "active" && !p.isActive) return false;
      if (filter === "disabled" && p.isActive) return false;
      if (!q) return true;
      return p.pincode.includes(q) || p.city?.toLowerCase().includes(q);
    });
  }, [pincodes, search, filter]);

  const statCards = [
    { label: "Total Pincodes", value: stats.total, icon: "📍", tint: "bg-blue-500/12 dark:bg-blue-500/20" },
    { label: "Serviceable", value: stats.active, icon: "✅", tint: "bg-brand-500/12 dark:bg-brand-500/20" },
    { label: "Disabled", value: stats.disabled, icon: "🚫", tint: "bg-red-500/12 dark:bg-red-500/20" },
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
        <h1 className="text-xl font-bold tracking-tight text-ink">Serviceable Areas</h1>
        <p className="text-sm text-ink-faint">
          Only pincodes listed here allow registration, addresses, orders and subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

      <form onSubmit={handleAdd} className="card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400">
            <PinIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="text-sm font-semibold text-ink">Add a serviceable pincode</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">Pincode</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="560001"
              className="input w-32"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-muted">City / Area</label>
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Bengaluru"
              className="input w-48"
            />
          </div>
          <button type="submit" disabled={adding} className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding..." : "Add Pincode"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <div className="card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pincode or city"
            className="input !pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("")} className={pillClass("")}>
            All
          </button>
          <button onClick={() => setFilter("active")} className={pillClass("active")}>
            Serviceable
          </button>
          <button onClick={() => setFilter("disabled")} className={pillClass("disabled")}>
            Disabled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 border-t border-line p-4 first:border-t-0">
              <div className="h-9 w-16 rounded-lg bg-surface-2" />
              <div className="h-3.5 w-1/4 rounded bg-surface-2" />
              <div className="ml-auto h-6 w-24 rounded-full bg-surface-2" />
            </div>
          ))}
        </div>
      ) : filteredPincodes.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl dark:bg-brand-500/20">
            📍
          </span>
          <p className="font-medium text-ink">No pincodes found</p>
          <p className="text-sm text-ink-faint">
            {search || filter
              ? "Try a different search or filter."
              : "Add one above, otherwise no one can register or order."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-surface-2 text-left text-ink-muted">
              <tr>
                <th className="p-3">Pincode</th>
                <th className="p-3">City / Area</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPincodes.map((p) => (
                <tr key={p._id} className="border-t border-line text-ink-muted transition hover:bg-surface-2/60">
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 font-mono font-semibold text-ink">
                      <PinIcon className="h-3.5 w-3.5 text-ink-faint" />
                      {p.pincode}
                    </span>
                  </td>
                  <td className="p-3 text-ink-faint">{p.city || "—"}</td>
                  <td className="p-3">
                    <button
                      disabled={busyId === p._id}
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                        p.isActive ? "bg-brand-100 text-brand-700" : "bg-cream-200 text-brand-900/60"
                      }`}
                    >
                      {p.isActive ? "Serviceable" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      disabled={busyId === p._id}
                      onClick={() => handleDelete(p._id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:underline disabled:opacity-60"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete
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
