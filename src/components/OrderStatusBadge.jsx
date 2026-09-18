const styles = {
  placed: "bg-cream-200 text-brand-900/70",
  confirmed: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-gold-100 text-gold-700",
  delivered: "bg-brand-100 text-brand-700",
  cancelled: "bg-red-100 text-red-700",
};

const labels = {
  placed: "Placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-cream-200 text-brand-900/70"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
