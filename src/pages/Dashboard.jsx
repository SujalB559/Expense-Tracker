import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useAuth } from "../context/useAuth";
import { categoryIcons } from "../data/constants";
import { formatMoney, formatShortMoney, getAmount } from "../utils/formatters";

export default function Dashboard({
  transactions,
  addTransaction,
  budget,
  setBudget,
  customCategories,
}) {
  const { user } = useAuth();
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(String(budget || 20000));
  const [budgetError, setBudgetError] = useState("");
  const [chartView, setChartView] = useState("6"); // '3' | '6' | '12' | 'this_year'
  const [chartType, setChartType] = useState("bar"); // 'bar' | 'area'

  const greetingName = user?.first_name || user?.username || "there";

  // Calculate totals
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  // User-controlled savings from explicit savings transactions
  const totalSavings = transactions
    .filter((t) => t.type === "savings")
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const netBalance = totalIncome - totalExpense - totalSavings;

  const monthExpenses = transactions
    .filter((t) => t.type === "expense" && t.date?.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const monthIncome = transactions
    .filter((t) => t.type === "income" && t.date?.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  const monthSavings = transactions
    .filter((t) => t.type === "savings" && t.date?.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + getAmount(t.amount), 0);

  // Budget calculations
  const budgetAmount = getAmount(budget);
  const budgetRemaining = budgetAmount - monthExpenses;
  const budgetPercent =
    budgetAmount > 0 ? Math.round((monthExpenses / budgetAmount) * 100) : 0;
  const isOverBudget = budgetAmount > 0 && monthExpenses > budgetAmount;
  const isNearBudget = budgetAmount > 0 && !isOverBudget && budgetPercent >= 80;

  // Category breakdown for this month
  const categoryTotals = transactions
    .filter((t) => t.type === "expense" && t.date?.startsWith(currentMonthKey))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + getAmount(t.amount);
      return acc;
    }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage:
        monthExpenses > 0 ? Math.round((amount / monthExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestCategory = sortedCategories[0];

  // Dynamic Monthly Chart Data based on chartView
  const now = new Date();
  const currentYear = now.getFullYear();
  let chartMonthCount = 6;
  if (chartView === "3") chartMonthCount = 3;
  else if (chartView === "6") chartMonthCount = 6;
  else if (chartView === "12") chartMonthCount = 12;
  else if (chartView === "this_year") chartMonthCount = now.getMonth() + 1;

  const chartData = Array.from({ length: chartMonthCount }, (_, index) => {
    let d = new Date();
    if (chartView === "this_year") {
      d = new Date(currentYear, index, 1);
    } else {
      d.setMonth(d.getMonth() - (chartMonthCount - 1 - index));
    }

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const inc = transactions
      .filter((t) => t.type === "income" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    const exp = transactions
      .filter((t) => t.type === "expense" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    const sav = transactions
      .filter((t) => t.type === "savings" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      income: inc,
      expense: exp,
      savings: sav,
    };
  });

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(newBudgetVal);
    if (Number.isNaN(val) || val <= 0) {
      setBudgetError("Please enter a valid monthly budget amount.");
      return;
    }
    setBudgetError("");
    setBudget(val);
    setEditingBudget(false);
  };

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with smooth greeting animation */}
      <div className="animate-pop flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Namaste, {greetingName} 👋
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

            {/* Main Focus: 4 Core Money Cards (Balance, Income in Green, Expenses in Red, Savings in Blue) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Balance"
          value={formatMoney(netBalance)}
          subtext={
            netBalance >= 0
              ? "Available net balance"
              : "Deficit (Expenses exceed income)"
          }
          icon="रू"
          tone={netBalance >= 0 ? "emerald" : "rose"}
        />

        <SummaryCard
          label="Total Income"
          value={formatMoney(totalIncome)}
          subtext={`This month: ${formatMoney(monthIncome)}`}
          icon="↑"
          tone="emerald"
        />

        <SummaryCard
          label="Total Expenses"
          value={formatMoney(totalExpense)}
          subtext={`This month: ${formatMoney(monthExpenses)}`}
          icon="↓"
          tone="rose"
        />

        <SummaryCard
          label="Total Savings"
          value={formatMoney(totalSavings)}
          subtext={`This month: ${formatMoney(monthSavings)}`}
          icon="🎯"
          tone="blue"
        />
      </section>

      {/* Budget Status Card with Clear Warnings & Percentage Used */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Status
              </h2>
              {isOverBudget ? (
                <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400 animate-pulse">
                  ⚠ Over Budget ({budgetPercent}%)
                </span>
              ) : isNearBudget ? (
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  ⚠ Near Limit ({budgetPercent}%)
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  ✓ On Track ({budgetPercent}%)
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Target for {new Date().toLocaleString("en-US", { month: "long" })}:{" "}
              <strong className="text-slate-800 dark:text-slate-200">{formatMoney(budgetAmount)}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewBudgetVal(String(budgetAmount));
              setEditingBudget(!editingBudget);
            }}
            className="self-start rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:self-auto"
          >
            {editingBudget ? "Close" : "Change Budget"}
          </button>
        </div>

        {/* Warning notification banner if over budget or near limit */}
        {isOverBudget && (
          <div className="mt-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-300">
            <strong>Budget Alert:</strong> You have exceeded your monthly budget by{" "}
            <strong>{formatMoney(Math.abs(budgetRemaining))}</strong> ({budgetPercent}% used).
          </div>
        )}
        {isNearBudget && (
          <div className="mt-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300">
            <strong>Budget Warning:</strong> You have used {budgetPercent}% of your monthly limit. You have {formatMoney(budgetRemaining)} remaining.
          </div>
        )}

        {/* Edit Budget Form */}
        {editingBudget && (
          <form onSubmit={handleSaveBudget} className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Set New Monthly Budget (Rs)
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2 text-xs font-bold text-slate-400">
                  Rs
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(e.target.value)}
                  className="w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Save
              </button>
            </div>
            {budgetError && (
              <p className="mt-1 text-xs text-red-600">{budgetError}</p>
            )}
          </form>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOverBudget
                  ? "bg-rose-500"
                  : isNearBudget
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
              <span className="block text-slate-400 dark:text-slate-500 font-medium">Budget:</span>
              <strong className="block text-sm text-slate-800 dark:text-slate-200 font-bold">{formatMoney(budgetAmount)}</strong>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
              <span className="block text-slate-400 dark:text-slate-500 font-medium">Spent:</span>
              <strong className="block text-sm text-rose-600 dark:text-rose-400 font-bold">{formatMoney(monthExpenses)}</strong>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
              <span className="block text-slate-400 dark:text-slate-500 font-medium">
                {isOverBudget ? "Overspent:" : "Remaining:"}
              </span>
              <strong
                className={`block text-sm font-bold ${
                  isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {formatMoney(Math.abs(budgetRemaining))}
              </strong>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2.5">
              <span className="block text-slate-400 dark:text-slate-500 font-medium">Used:</span>
              <strong className="block text-sm text-slate-800 dark:text-slate-200 font-bold">{budgetPercent}%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Column (Monthly Expense Chart & Recent Transactions) & Right Column (Highest Category, Category Breakdown & Quick Add) */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Monthly Expense & Income Comparison Chart (Red for Expense, Green for Income) */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6 transition">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Expense & Income Tracking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track how much you spend (Red) and earn (Green) each month in Rs
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1">
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
                  {[
                    { id: "3", label: "3M" },
                    { id: "6", label: "6M" },
                    { id: "12", label: "12M" },
                    { id: "this_year", label: "Year" },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setChartView(btn.id)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                        chartView === btn.id
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Bar vs Area chart toggle */}
                <button
                  type="button"
                  title="Toggle chart style"
                  onClick={() => setChartType(chartType === "bar" ? "area" : "bar")}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {chartType === "bar" ? "📈 Area" : "📊 Bar"}
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e120" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(v) => formatShortMoney(v)}
                    />
                    <Tooltip
                      formatter={(value) => [formatMoney(value), ""]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#ffffff",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                    <Bar
                      dataKey="income"
                      name="Income (Green)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expenses (Red)"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="savings"
                      name="Savings (Blue)"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="savFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e120" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(v) => formatShortMoney(v)}
                    />
                    <Tooltip
                      formatter={(value) => [formatMoney(value), ""]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#ffffff",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#incFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expenses"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      fill="url(#expFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#savFill)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Quick Monthly summary pill */}
            <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>This Month Net Savings:</span>
              <strong
                className={monthSavings >= 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}
              >
                {monthSavings >= 0 ? "+" : ""}{formatMoney(monthSavings)}
              </strong>
            </div>
          </section>

          {/* Recent Transactions List */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your latest expense (Red) and income (Green) entries
                </p>
              </div>

              {hasTransactions && (
                <Link
                  to="/transactions"
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  View all →
                </Link>
              )}
            </div>

            <TransactionList
              transactions={transactions.slice(0, 5)}
              emptyMessage="No transactions recorded yet. Add your first expense to start tracking."
              onAddClick={() => {
                const addInput = document.querySelector('input[type="number"]');
                if (addInput) addInput.focus();
              }}
            />
          </section>
        </div>

        {/* Right Column: Highest Category, Category Spending & Quick Add */}
        <div className="space-y-6">
          {/* Quick Add Expense Widget */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6 transition">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Add Expense
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add an expense or income in seconds (Amount, Category, Date)
              </p>
            </div>

            <TransactionForm
              onSubmit={addTransaction}
              availableCategories={customCategories}
            />
          </section>

          {/* Spending by Category & Highest Category Highlight */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:p-6 transition">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Spending by Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Where your money went this month
                </p>
              </div>
              <Link
                to="/categories"
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                All Categories →
              </Link>
            </div>

            {/* Clearly show highest spending category */}
            {highestCategory && (
              <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-xs">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Highest Spending Category
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="text-base">{categoryIcons[highestCategory.name] || "🏷️"}</span>
                    {highestCategory.name}
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {formatMoney(highestCategory.amount)}{" "}
                    <span className="font-medium text-slate-500 dark:text-slate-400">({highestCategory.percentage}%)</span>
                  </span>
                </div>
              </div>
            )}

            {sortedCategories.length > 0 ? (
              <div className="space-y-3">
                {sortedCategories.map((cat) => {
                  const icon = categoryIcons[cat.name] || "🏷️";
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                          <span className="text-sm">{icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatMoney(cat.amount)}{" "}
                          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                            ({cat.percentage}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No expenses logged this month yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
