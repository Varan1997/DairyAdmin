import { useEffect, useState } from "react";
import api from "../api/axios";
import { CloseIcon, PencilIcon, PlusIcon, TrashIcon } from "../components/icons";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  milkType: "cow",
  subscriptionAvailable: true,
  isActive: true,
  packSizes: [{ size: "500ml", price: "", stock: "" }],
};

const milkTypes = ["cow", "buffalo", "toned", "full-cream", "ghee", "other"];

const milkTypeDot = {
  cow: "bg-amber-400",
  buffalo: "bg-slate-400",
  toned: "bg-blue-400",
  "full-cream": "bg-gold-400",
  ghee: "bg-orange-400",
  other: "bg-purple-400",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/products/admin")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      image: product.image || "",
      milkType: product.milkType,
      subscriptionAvailable: product.subscriptionAvailable,
      isActive: product.isActive,
      packSizes: product.packSizes.map((p) => ({ _id: p._id, size: p.size, price: p.price, stock: p.stock })),
    });
    setEditingId(product._id);
    setShowForm(true);
    setError("");
  };

  const updatePackSize = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      packSizes: f.packSizes.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    }));
  };

  const addPackSize = () => {
    setForm((f) => ({ ...f, packSizes: [...f.packSizes, { size: "", price: "", stock: "" }] }));
  };

  const removePackSize = (idx) => {
    setForm((f) => ({ ...f, packSizes: f.packSizes.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || form.packSizes.length === 0) {
      setError("Name and at least one pack size are required");
      return;
    }
    if (form.packSizes.some((p) => !p.size || p.price === "")) {
      setError("Every pack size needs a size and price");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      packSizes: form.packSizes.map((p) => ({
        ...(p._id ? { _id: p._id } : {}),
        size: p.size,
        price: Number(p.price),
        stock: Number(p.stock) || 0,
      })),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const toggleActive = async (product) => {
    await api.put(`/products/${product._id}`, { isActive: !product.isActive });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">Products</h1>
          <p className="text-sm text-ink-faint">
            {loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <PlusIcon className="h-4 w-4" />
          New Product
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading...</p>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl dark:bg-brand-500/20">
            🥛
          </span>
          <p className="font-medium text-ink">No products yet</p>
          <p className="text-sm text-ink-faint">Add your first product to start selling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p._id}
              className="card flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 text-xl">
                    {p.image ? (
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "🥛"
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{p.name}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium capitalize text-ink-muted">
                      <span className={`h-1.5 w-1.5 rounded-full ${milkTypeDot[p.milkType] || "bg-ink-faint"}`} />
                      {p.milkType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(p)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                    p.isActive ? "bg-brand-100 text-brand-700" : "bg-cream-200 text-brand-900/60"
                  }`}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.packSizes.map((ps) => (
                  <span
                    key={ps._id}
                    className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-ink-muted"
                  >
                    {ps.size} · ₹{ps.price}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
                <button
                  onClick={() => openEdit(p)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-ink-muted transition hover:bg-surface-2 hover:text-brand-500"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-ink-muted transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="card flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">{editingId ? "Edit Product" : "New Product"}</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-surface-2 hover:text-ink"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-muted">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-muted">Milk Type</label>
                  <select
                    value={form.milkType}
                    onChange={(e) => setForm({ ...form, milkType: e.target.value })}
                    className="input"
                  >
                    {milkTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink-muted">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink-muted">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="input"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-ink-muted">Pack Sizes</label>
                  <button
                    type="button"
                    onClick={addPackSize}
                    className="flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add Size
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {form.packSizes.map((pack, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2">
                      <input
                        type="text"
                        placeholder="Size (e.g. 1L)"
                        value={pack.size}
                        onChange={(e) => updatePackSize(idx, "size", e.target.value)}
                        className="input w-24 !py-1.5"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        min="0"
                        value={pack.price}
                        onChange={(e) => updatePackSize(idx, "price", e.target.value)}
                        className="input w-24 !py-1.5"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={pack.stock}
                        onChange={(e) => updatePackSize(idx, "stock", e.target.value)}
                        className="input w-24 !py-1.5"
                      />
                      {form.packSizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackSize(idx)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Remove pack size"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 text-sm text-ink-muted">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.subscriptionAvailable}
                    onChange={(e) => setForm({ ...form, subscriptionAvailable: e.target.checked })}
                    className="accent-brand-600"
                  />
                  Available for subscription
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="accent-brand-600"
                  />
                  Active
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2 border-t border-line pt-4">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Saving..." : "Save Product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
