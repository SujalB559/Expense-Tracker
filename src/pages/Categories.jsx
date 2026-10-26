import { useState } from "react";
import {
  categoryIcons,
  expenseDefaults,
  incomeDefaults,
  savingsDefaults,
} from "../data/constants";
import { formatMoney } from "../utils/formatters";

export default function Categories({
  customCategories,
  setCustomCategories,
  categoryLimits,
  setCategoryLimits,
}) {
  const [activeTab, setActiveTab] = useState("expense"); // 'expense' | 'income' | 'savings'
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [error, setError] = useState("");
  const [editingLimitCategory, setEditingLimitCategory] = useState(null);
  const [tempLimitVal, setTempLimitVal] = useState("");

  const expenseList = [
    ...expenseDefaults,
    ...(customCategories?.expense || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const incomeList = [
    ...incomeDefaults,
    ...(customCategories?.income || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const savingsList = [
    ...savingsDefaults,
    ...(customCategories?.savings || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const currentList =
    activeTab === "expense"
      ? expenseList
      : activeTab === "income"
      ? incomeList
      : savingsList;

  const isDefaultCategory = (name) => {
    if (activeTab === "expense") return expenseDefaults.includes(name);
    if (activeTab === "income") return incomeDefaults.includes(name);
    return savingsDefaults.includes(name);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    if (currentList.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setError("A category with this name already exists.");
      return;
    }

    setError("");
    setCustomCategories((prev) => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), name],
    }));

    if (activeTab === "expense" && newLimit && Number(newLimit) > 0) {
      setCategoryLimits((prev) => ({
        ...prev,
        [name]: Number(newLimit),
      }));
    }

    setNewName("");
    setNewLimit("");
  };

  const handleRemoveCategory = (name) => {
    if (isDefaultCategory(name)) return;
    if (window.confirm(`Delete custom category "${name}"?`)) {
      setCustomCategories((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter((item) => item !== name),
      }));
    }
  };

  const saveCategoryLimit = (catName) => {
    const val = tempLimitVal.trim();
    setCategoryLimits((prev) => ({
      ...prev,
      [catName]: val === "" ? null : Number(val),
    }));
    setEditingLimitCategory(null);
  };

  const tabLabels = {
    expense: "Expense",
    income: "Income",
    savings: "Savings",
  };

  const placeholderText = {
    expense: "e.g. Pet Care, Internet, Gym",
    income: "e.g. Side Project, Bonus, Dividends",
    savings: "e.g. House Down Payment, Vacation, Gold",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Categories
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Organize your expenses, income, and savings with custom categories and monthly limits
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("expense")}
          className={`whitespace-nowrap border-b-2 px-5 py-2.5 text-xs font-semibold transition ${
            activeTab === "expense"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Expense Categories ({expenseList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          className={`whitespace-nowrap border-b-2 px-5 py-2.5 text-xs font-semibold transition ${
            activeTab === "income"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Income Categories ({incomeList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("savings")}
          className={`whitespace-nowrap border-b-2 px-5 py-2.5 text-xs font-semibold transition ${
            activeTab === "savings"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Savings Categories ({savingsList.length})
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Categories Grid */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {currentList.map((category) => {
              const icon =
                categoryIcons[category] ||
                (activeTab === "income"
                  ? "💼"
                  : activeTab === "savings"
                  ? "🎯"
                  : "🏷️");
              const isDefault = isDefaultCategory(category);
              const limit = categoryLimits[category];
              const isEditingLimit = editingLimitCategory === category;

              return (
                <div
                  key={category}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-xl">
                        {icon}
                      </span>
                      <div>
                        <strong className="block text-sm font-semibold text-slate-900 dark:text-white">
                          {category}
                        </strong>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                          {isDefault ? "Default" : "Custom category"}
                        </span>
                      </div>
                    </div>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        title="Delete custom category"
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Monthly Limit Section for Expense Categories */}
                  {activeTab === "expense" && (
                    <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      {isEditingLimit ? (
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-2 top-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                              Rs
                            </span>
                            <input
                              type="number"
                              min="0"
                              autoFocus
                              value={tempLimitVal}
                              onChange={(e) => setTempLimitVal(e.target.value)}
                              placeholder="Monthly limit"
                              className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 pl-6 pr-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => saveCategoryLimit(category)}
                            className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLimitCategory(null)}
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Monthly limit:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {limit ? formatMoney(limit) : "No limit"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLimitCategory(category);
                                setTempLimitVal(limit ? String(limit) : "");
                              }}
                              className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                            >
                              {limit ? "Edit" : "Set"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Category Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Create Custom Category
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Add a new {tabLabels[activeTab].toLowerCase()} category tailored to your needs
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Category Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={placeholderText[activeTab]}
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {activeTab === "expense" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Monthly Limit (in Rs, Optional)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">
                    Rs
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              + Add {tabLabels[activeTab]} Category
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
