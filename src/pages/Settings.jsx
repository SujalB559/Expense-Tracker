import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

export default function Settings({
  budget,
  setBudget,
  clearData,
  resetData,
}) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [budgetInput, setBudgetInput] = useState(String(budget || 20000));
  const [budgetSuccess, setBudgetSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!Number.isNaN(val) && val > 0) {
      setBudget(val);
      setBudgetSuccess(true);
      setTimeout(() => setBudgetSuccess(false), 2500);
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  const handleClearTransactions = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all your transactions? This cannot be undone."
      )
    ) {
      setBusy(true);
      try {
        await clearData();
      } finally {
        setBusy(false);
      }
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all account data? All transactions and custom settings will be wiped."
      )
    ) {
      setBusy(true);
      try {
        await resetData();
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Account & Settings
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Manage your account profile, theme preferences, monthly budget, and data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* User Profile Card */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your registered user details
            </p>

            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {user?.initials || "ET"}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  {user?.full_name || user?.username || "Expense Tracker User"}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  @{user?.username} · {user?.email}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="block font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Primary Currency
                </span>
                <span className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                  Nepalese Rupee (NPR · Rs.)
                </span>
              </div>
              <div>
                <span className="block font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Account Status
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </section>

          {/* Theme Preference */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Appearance Theme
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between clean light mode and sleek dark mode
                </p>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <span>{isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (Click to switch)
                </span>
              </button>
            </div>
          </section>

          {/* Monthly Budget Setting */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Budget Target
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set the overall spending limit for each calendar month in Rs
            </p>

            <form onSubmit={handleBudgetSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Monthly Limit (in Rs)
                </label>
                <div className="relative mt-1.5 max-w-xs">
                  <span className="pointer-events-none absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                    Rs
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-2 pl-9 pr-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  Update Monthly Budget
                </button>
                {budgetSuccess && (
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    ✓ Saved successfully
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Danger Zone / Data Management */}
          <section className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-rose-900 dark:text-rose-400">
              Data Management & Danger Zone
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your saved transactions or reset account
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={handleClearTransactions}
                className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 disabled:opacity-50"
              >
                Clear All Transactions
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleResetData}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Reset Account Data
              </button>
            </div>
          </section>
        </div>

        {/* Right Info Box & Logout */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Session & Logout
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sign out of this device when you are finished.
            </p>

            <button
              type="button"
              onClick={() => setShowLogoutAlert(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </section>

          <section className="rounded-2xl bg-slate-900 dark:bg-slate-850 border border-slate-800 p-5 text-white shadow-xs sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-lg">
              रू
            </div>
            <h3 className="mt-3 text-sm font-bold text-white">
              Built for Nepal
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Designed for daily expenses in Nepal: Momo, petrol, wifi, groceries, and rent. All numbers formatted in Rs using the South Asian numbering system.
            </p>
          </section>
        </div>
      </div>

      {/* Logout Alert Modal */}
      {showLogoutAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="animate-pop w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Do you want to log out?
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You will be signed out of your account on this device.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutAlert(false)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
