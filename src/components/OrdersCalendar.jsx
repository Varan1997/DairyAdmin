import { useMemo, useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const bucketClasses = [
  // 0 orders
  "bg-surface-2 text-ink-faint",
  // low
  "bg-blue-200 text-blue-800 dark:bg-blue-500/30 dark:text-blue-200",
  // medium
  "bg-teal-300 text-teal-900 dark:bg-teal-500/40 dark:text-teal-100",
  // high
  "bg-gold-400 text-white dark:bg-gold-500/80",
  // very high
  "bg-red-400 text-white dark:bg-red-500/80",
];

const bucketFor = (count, max) => {
  if (!count) return 0;
  if (max <= 1) return count > 0 ? 4 : 0;
  const ratio = count / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
};

export default function OrdersCalendar({ orders, selectedDate, onSelectDate }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const countsByDay = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = toKey(d);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [orders]);

  const { cells, maxCount, monthTotal } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = firstDay.getDay();

    const list = [];
    for (let i = 0; i < leadingBlanks; i++) list.push(null);

    let max = 0;
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = toKey(date);
      const count = countsByDay.get(key) || 0;
      max = Math.max(max, count);
      total += count;
      list.push({ key, day, count, date });
    }
    while (list.length % 7 !== 0) list.push(null);

    return { cells: list, maxCount: max, monthTotal: total };
  }, [cursor, countsByDay]);

  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const todayKey = toKey(new Date());

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-500/5 text-brand-600 dark:text-brand-400">
            <CalendarIcon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{monthLabel}</p>
            <p className="text-xs text-ink-faint">{monthTotal} order{monthTotal === 1 ? "" : "s"} this month</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface-2"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-2"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-2"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {weekdays.map((w) => (
          <div key={w} className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            {w}
          </div>
        ))}

        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} />;
          const isSelected = selectedDate === cell.key;
          const isToday = cell.key === todayKey;
          const bucket = bucketFor(cell.count, maxCount);

          return (
            <button
              key={cell.key}
              onClick={() => onSelectDate(isSelected ? null : cell.key)}
              className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-soft ${bucketClasses[bucket]} ${
                isSelected ? "ring-2 ring-brand-600 ring-offset-1 ring-offset-surface" : ""
              } ${isToday && !isSelected ? "ring-1 ring-inset ring-brand-400" : ""}`}
            >
              <span>{cell.day}</span>
              {cell.count > 0 && <span className="text-[9px] font-bold opacity-90">{cell.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
          <span>Less</span>
          {bucketClasses.map((c, i) => (
            <span key={i} className={`h-3 w-3 rounded ${c.split(" ")[0]}`} />
          ))}
          <span>More</span>
        </div>
        {selectedDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-xs font-semibold text-brand-500 hover:underline"
          >
            Clear selected day
          </button>
        )}
      </div>
    </div>
  );
}
