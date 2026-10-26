import { categoryIcons } from "../data/constants";
import { formatDate, formatMoney } from "../utils/formatters";

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAddClick,
  emptyMessage = "No transactions recorded yet.",
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No transactions yet</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
          >
            <span>+ Add Transaction</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        const isSavings = tx.type === "savings";
        const icon =
          categoryIcons[tx.category] ||
          (isIncome ? "💼" : isSavings ? "🎯" : "🏷️");
        const displayTitle = tx.description || tx.name || tx.category;

        return (
          <div
            key={tx.id}
            className="group flex flex-col justify-between gap-3 p-3.5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5"
          >
            {/* Left: Icon, Category & Description */}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                  isIncome
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                    : isSavings
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                }`}
              >
                {icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {displayTitle}
                  </span>
                  {tx.description && tx.description !== tx.category && (
                    <span className="hidden rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 sm:inline">
                      {tx.category}
                    </span>
                  )}
                  {isSavings && (
                    <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                      Savings
                    </span>
                  )}
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatDate(tx.date)}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="capitalize">{tx.category}</span>
                </div>
              </div>
            </div>

            {/* Right: Amount & Actions */}
            <div className="flex items-center justify-between gap-4 self-end sm:self-center">
              <span
                className={`text-sm font-bold sm:text-base ${
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isSavings
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : isSavings ? "🎯 " : "-"}{formatMoney(tx.amount)}
              </span>

              {(onEdit || onDelete) && (
                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  {onEdit && (
                    <button
                      type="button"
                      title="Edit transaction"
                      onClick={() => onEdit(tx)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      title="Delete transaction"
                      onClick={() => onDelete(tx.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
