import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import TransactionForm from "./TransactionForm";

const navigation = [
  {
    path: "/",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/transactions",
    label: "Transactions",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: "/categories",
    label: "Categories",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    path: "/settings",
    label: "Settings",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Layout({ children, onAddTransaction, availableCategories }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const dropdownRef = useRef(null);

  const displayName = user?.full_name || user?.username || "My Account";
  const initials = user?.initials || (user?.username ? user.username.slice(0, 2).toUpperCase() : "ET");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutAlert(false);
    setProfileDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const handleModalSubmit = async (transaction) => {
    if (onAddTransaction) {
      await onAddTransaction(transaction);
    }
    setShowAddModal(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <span className="text-base font-bold">रू</span>
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Expense Tracker
              </span>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Nepal · NPR (Rs)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Expense</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <span className="text-slate-500 dark:text-slate-400">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card with Interactive Profile Dropdown Trigger */}
        <div className="relative border-t border-slate-100 dark:border-slate-800 p-3" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex w-full items-center justify-between rounded-xl p-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email || "Personal account"}
                </span>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="animate-pop absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl">
              {/* User details header */}
              <div className="border-b border-slate-100 dark:border-slate-700/80 px-3 py-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{user?.username || "user"}</p>
              </div>

              <div className="py-1">
                {/* Dark mode toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                >
                  <span className="flex items-center gap-2.5">
                    {isDark ? "🌙" : "☀️"}
                    <span>Dark Mode</span>
                  </span>
                  <span className={`h-5 w-9 rounded-full transition-colors p-0.5 flex items-center ${isDark ? "bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-slate-600 justify-start"}`}>
                    <span className="h-4 w-4 rounded-full bg-white shadow-xs block" />
                  </span>
                </button>

                {/* Settings link */}
                <NavLink
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                >
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </NavLink>

                {/* Log Out button */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setShowLogoutAlert(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-8">
        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              रू
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Expense Tracker</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>

            {/* Profile Dropdown Button on Mobile */}
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu if triggered from mobile header */}
        {profileDropdownOpen && (
          <div className="md:hidden animate-pop fixed top-14 right-4 z-50 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl">
            <div className="border-b border-slate-100 dark:border-slate-700 px-3 py-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  {isDark ? "🌙" : "☀️"}
                  <span>Dark Mode</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">{isDark ? "ON" : "OFF"}</span>
              </button>

              <NavLink
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span>⚙️</span>
                <span>Settings</span>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  setShowLogoutAlert(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 shadow-lg md:hidden">
        {navigation.slice(0, 2).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}

        {/* Floating Center Action Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md active:scale-95"
          aria-label="Add expense or income"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {navigation.slice(2, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="mt-0.5">{item.label}</span>
          </NavLink>
        ))}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition ${
              isActive
                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mt-0.5">Profile</span>
        </NavLink>
      </nav>

      {/* Global Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs sm:items-center sm:p-4">
          <div
            className="animate-pop w-full max-w-lg rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xl sm:rounded-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Transaction</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record a quick expense or income in Rs</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <TransactionForm
              onSubmit={handleModalSubmit}
              onCancel={() => setShowAddModal(false)}
              availableCategories={availableCategories}
            />
          </div>
        </div>
      )}

      {/* Log Out Confirmation Alert Modal */}
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
              You will be signed out of your account on this device. You will need to log back in to access your transactions.
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
