import { useState } from "react";
import { categoryIcons, expenseDefaults, incomeDefaults, savingsDefaults } from "../data/constants";

export default function TransactionForm({
  onSubmit,
  initial = null,
  onCancel,
  availableCategories,
}) {
  const expenseCats = [
    ...expenseDefaults,
    ...(availableCategories?.expense || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const incomeCats = [
    ...incomeDefaults,
    ...(availableCategories?.income || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const savingsCats = [
    ...savingsDefaults,
    ...(availableCategories?.savings || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const [type, setType] = useState(initial?.type || "expense"); // 'expense' | 'income' | 'savings'
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : ""
  );

  const getCatsForType = (t) => {
    if (t === "income") return incomeCats;
    if (t === "savings") return savingsCats;
    return expenseCats;
  };

  const initialCat = initial?.category || (initial?.type ? getCatsForType(initial.type)[0] : expenseCats[0]);
  const [category, setCategory] = useState(initialCat);
  const [date, setDate] = useState(
    initial?.date || new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(
    initial?.description || initial?.name || ""
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = getCatsForType(type);

  const handleTypeChange = (newType) => {
    setType(newType);
    const newCats = getCatsForType(newType);
    if (!newCats.includes(category)) {
      setCategory(newCats[0] || "Other");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: description.trim() || category,
        description: description.trim(),
        amount: numAmount,
        type,
        category,
        date: date || new Date().toISOString().slice(0, 10),
        recurring: false,
        repeat: "monthly",
      };

      await onSubmit(payload);

      if (!initial) {
        setAmount("");
        setDescription("");
      }
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const placeholderNote = {
    expense: "e.g. Lunch with friends, Petrol, Wifi bill",
    income: "e.g. Monthly salary, Client project",
    savings: "e.g. Emergency fund deposit, Vacation fund",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-2.5 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Type Toggle: 3 Buttons (Expense / Income / Savings) */}
      <div>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`rounded-md py-2 text-xs font-semibold transition ${
              type === "expense"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`rounded-md py-2 text-xs font-semibold transition ${
              type === "income"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("savings")}
            className={`rounded-md py-2 text-xs font-semibold transition ${
              type === "savings"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Savings
          </button>
        </div>
      </div>

      {/* Amount (NPR) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Amount (in Rs) <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1.5 flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-base font-bold text-slate-500 dark:text-slate-400">
            Rs
          </span>
          <input
            type="number"
            min="1"
            step="any"
            required
            autoFocus={!initial}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 pl-12 pr-3.5 text-lg font-bold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {type === "savings" ? "Savings Goal / Category" : "Category"} <span className="text-red-500">*</span>
        </label>
        <div className="mt-1.5">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {(categoryIcons[cat] ? `${categoryIcons[cat]} ` : "") + cat}
              </option>
            ))}
          </select>
        </div>

        {/* Quick select pills */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                category === cat
                  ? type === "savings"
                    ? "bg-blue-600 text-white font-semibold"
                    : type === "income"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "bg-slate-900 dark:bg-rose-600 text-white font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{categoryIcons[cat] || (type === "savings" ? "🎯" : "🏷️")}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Description / Note */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Note / Description <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={placeholderNote[type]}
          className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${
            type === "savings"
              ? "bg-blue-600 hover:bg-blue-700"
              : type === "expense"
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {submitting
            ? "Saving..."
            : initial
            ? "Save Changes"
            : type === "savings"
            ? "Add Savings"
            : type === "expense"
            ? "Add Expense"
            : "Add Income"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
