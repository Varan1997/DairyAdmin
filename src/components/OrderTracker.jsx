const steps = [
  { key: "placed", label: "Placed", icon: "🧾" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🚴" },
  { key: "delivered", label: "Delivered", icon: "📦" },
];

export default function OrderTracker({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400">
        <span className="text-lg" aria-hidden>
          ✕
        </span>
        <span className="font-medium">This order was cancelled</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition ${
                  done ? "bg-brand-600 text-white shadow-soft" : "bg-surface-2 text-ink-faint"
                }`}
              >
                {done ? "✓" : step.icon}
              </div>
              {!isLast && (
                <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? "bg-brand-600" : "bg-surface-2"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === steps.length - 1;
          return (
            <div
              key={step.key}
              className={`text-center text-[11px] font-medium leading-tight ${isLast ? "w-9" : "flex-1"} ${
                done ? "text-ink" : "text-ink-faint"
              }`}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
