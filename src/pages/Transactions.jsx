import { useMemo, useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { expenseDefaults, incomeDefaults, savingsDefaults } from "../data/constants";
import { formatMoney, getAmount } from "../utils/formatters";

export default function Transactions({
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  customCategories,
}) {
  const [editing, setEditing] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all"); // 'all' | 'this_month' | 'last_month' | 'YYYY-MM'
  const [sortBy, setSortBy] = useState("date-desc");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Combine default & custom categories
  const allCategories = [
    ...expenseDefaults,
    ...incomeDefaults,
    ...savingsDefaults,
    ...(customCategories?.expense || []),
    ...(customCategories?.income || []),
    ...(customCategories?.savings || []),
  ].filter((item, index, self) => self.indexOf(item) === index);

  // Get list of distinct months present in the transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.date) {
        set.add(tx.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  // Filter & sort transactions
  const filtered = transactions
    .filter((tx) => {
      const query = search.toLowerCase().trim();
      if (!query) return true;
      const name = (tx.name || "").toLowerCase();
      const desc = (tx.description || "").toLowerCase();
      const cat = (tx.category || "").toLowerCase();
      const amountStr = String(tx.amount || "");
      return (
        name.includes(query) ||
        desc.includes(query) ||
        cat.includes(query) ||
        amountStr.includes(query)
      );
    })
    .filter((tx) => (typeFilter === "all" ? true : tx.type === typeFilter))
    .filter((tx) =>
      categoryFilter === "all" ? true : tx.category === categoryFilter
    )
    .filter((tx) => {
      if (monthFilter === "all") return true;
      if (monthFilter === "this_month") return tx.date?.startsWith(thisMonthKey);
      if (monthFilter === "last_month") return tx.date?.startsWith(lastMonthKey);
      return tx.date?.startsWith(monthFilter);
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === "amount-desc") {
        return getAmount(b.amount) - getAmount(a.amount);
      }
      if (sortBy === "amount-asc") {
        return getAmount(a.amount) - getAmount(b.amount);
      }
      return 0;
    });

  const totalFilteredExpenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const totalFilteredIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const totalFilteredSavings = filtered
    .filter((t) => t.type === "savings")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const netFiltered = totalFilteredIncome - totalFilteredExpenses;

  const handleEditSubmit = async (formData) => {
    if (editing) {
      await updateTransaction({ ...formData, id: editing.id });
      setEditing(null);
    }
  };

  const handleAddSubmit = async (formData) => {
    await addTransaction(formData);
    setShowAddModal(false);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const hasActiveFilters =
    search ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    monthFilter !== "all" ||
    sortBy !== "date-desc";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setMonthFilter("all");
    setSortBy("date-desc");
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Transactions History
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Search, filter by month, category, or type, and edit your records in Rs
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 self-start rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.99] sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by note, category..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All Months</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              {availableMonths.map((m) => {
                const [year, month] = m.split("-");
                const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All Types (Income, Expenses, Savings)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="savings">Savings Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-emerald-500"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Results summary bar with clear totals and reset filter button */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> of{" "}
              {transactions.length} records
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <span>
              Income: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{formatMoney(totalFilteredIncome)}</strong>
            </span>
            <span>
              Spent: <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatMoney(totalFilteredExpenses)}</strong>
            </span>
            <span>
              Savings: <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatMoney(totalFilteredSavings)}</strong>
            </span>
            <span>
              Net:{" "}
              <strong className={netFiltered >= 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                {netFiltered >= 0 ? "+" : ""}{formatMoney(netFiltered)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List (Mobile Scannable Cards) */}
      <TransactionList
        transactions={filtered}
        onEdit={(tx) => setEditing(tx)}
        onDelete={(id) => setDeleteConfirmId(id)}
        onAddClick={() => setShowAddModal(true)}
        emptyMessage={
          hasActiveFilters
            ? "No transactions match your current search or filters. Try adjusting your filters."
            : "No transactions recorded yet. Add an expense or income to begin."
        }
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="animate-pop w-full max-w-lg rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  New Transaction
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Record an expense or income in Rs
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <TransactionForm
              onSubmit={handleAddSubmit}
              onCancel={() => setShowAddModal(false)}
              availableCategories={customCategories}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="animate-pop w-full max-w-lg rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Transaction
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update transaction details</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <TransactionForm
              initial={editing}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(null)}
              availableCategories={customCategories}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="animate-pop w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Transaction?
            </h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to remove this record? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
