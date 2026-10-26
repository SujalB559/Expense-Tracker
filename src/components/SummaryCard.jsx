export default function SummaryCard({
  label,
  value,
  subtext,
  icon,
  tone = "neutral",
}) {
  const toneMap = {
    emerald: {
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
      border: "border-slate-200 dark:border-slate-800",
      value: "text-emerald-600 dark:text-emerald-400 font-bold",
    },
    rose: {
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
      border: "border-slate-200 dark:border-slate-800",
      value: "text-rose-600 dark:text-rose-400 font-bold",
    },
    blue: {
      badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
      border: "border-slate-200 dark:border-slate-800",
      value: "text-blue-600 dark:text-blue-400 font-bold",
    },
    amber: {
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
      border: "border-slate-200 dark:border-slate-800",
      value: "text-amber-600 dark:text-amber-400 font-bold",
    },
    neutral: {
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-800",
      value: "text-slate-900 dark:text-white font-bold",
    },
  };

  const style = toneMap[tone] || toneMap.neutral;

  return (
    <div
      className={`rounded-xl border ${style.border} bg-white dark:bg-slate-900 p-4 shadow-xs transition sm:p-5`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${style.badge}`}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-xl font-bold tracking-tight sm:text-2xl ${style.value}`}>
          {value}
        </div>
        {subtext && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
