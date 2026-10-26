import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SummaryCard from "../components/SummaryCard";
import { categoryIcons, chartColors } from "../data/constants";
import { formatMoney, formatShortMoney, getAmount } from "../utils/formatters";

export default function Analytics({ transactions }) {
  // Time range selector: '3' | '6' | '12' | 'this_year'
  const [timeRange, setTimeRange] = useState("6");

  // Determine months to include based on selected range
  const now = new Date();
  const currentYear = now.getFullYear();
  let monthCount = 6;

  if (timeRange === "3") monthCount = 3;
  else if (timeRange === "6") monthCount = 6;
  else if (timeRange === "12") monthCount = 12;
  else if (timeRange === "this_year") {
    monthCount = now.getMonth() + 1; // months elapsed this year
  }

  // Generate the monthly timeline
  const monthlyData = Array.from({ length: monthCount }, (_, index) => {
    let d = new Date();
    if (timeRange === "this_year") {
      d = new Date(currentYear, index, 1);
    } else {
      d.setMonth(d.getMonth() - (monthCount - 1 - index));
    }

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const income = transactions
      .filter((t) => t.type === "income" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === "expense" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    const savings = transactions
      .filter((t) => t.type === "savings" && t.date?.startsWith(key))
      .reduce((sum, t) => sum + getAmount(t.amount), 0);

    const net = income - expense;
    const rate = income > 0 ? Math.round((savings / income) * 100) : 0;

    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      fullMonth: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      key,
      income,
      expense,
      savings,
      savingsRate: Math.max(0, Math.min(100, rate)),
    };
  });

  // Filter transactions within the selected range for category breakdown
  const activeMonthKeys = new Set(monthlyData.map((m) => m.key));
  const rangeTransactions = transactions.filter((t) => {
    const monthKey = t.date?.slice(0, 7);
    return activeMonthKeys.has(monthKey);
  });

  // Calculate totals in selected range
  const rangeIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const rangeExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
  const rangeSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0);
  const rangeSavingsRate =
    rangeIncome > 0 ? Math.round((rangeSavings / rangeIncome) * 100) : 0;

  // Category breakdown
  const expenseTransactions = rangeTransactions.filter((t) => t.type === "expense");
  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + getAmount(t.amount);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage:
        rangeExpense > 0 ? Math.round((value / rangeExpense) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const highestCategory = categoryData[0];

  const hasData = transactions.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-16 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
          No spending data to analyze yet
        </h2>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Start recording your income and expenses to view monthly trends, category breakdowns, and savings comparisons.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Time Range Selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Monthly Expense & Income Analytics
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Compare monthly spending (Red), income (Green), and track savings in Rs
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs">
          {[
            { id: "3", label: "Last 3 Months" },
            { id: "6", label: "Last 6 Months" },
            { id: "12", label: "Last 12 Months" },
            { id: "this_year", label: "This Year" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTimeRange(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                timeRange === tab.id
                  ? "bg-slate-900 dark:bg-slate-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards (Income in Green, Expenses in Red) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Income"
          value={formatMoney(rangeIncome)}
          subtext={`Earned across ${monthlyData.length} months`}
          icon="↓"
          tone="emerald"
        />

        <SummaryCard
          label="Total Expenses"
          value={formatMoney(rangeExpense)}
          subtext={`Spent across ${monthlyData.length} months`}
          icon="↑"
          tone="rose"
        />

        <SummaryCard
          label="Total Savings"
          value={formatMoney(rangeSavings)}
          subtext={
            rangeSavings >= 0
              ? `${rangeSavingsRate}% saved overall`
              : "Deficit (Expenses exceed income)"
          }
          icon="💰"
          tone={rangeSavings >= 0 ? "emerald" : "rose"}
        />

        <SummaryCard
          label="Top Category"
          value={highestCategory ? highestCategory.name : "None"}
          subtext={
            highestCategory
              ? `${formatMoney(highestCategory.value)} (${highestCategory.percentage}% of spending)`
              : "No expense data"
          }
          icon={highestCategory ? categoryIcons[highestCategory.name] || "🏷️" : "🏷️"}
          tone="amber"
        />
      </section>

      {/* Highest Spending Category Alert Banner */}
      {highestCategory && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/60 text-lg">
              {categoryIcons[highestCategory.name] || "🏷️"}
            </span>
            <div>
              <span className="font-bold">
                Highest Spending Category: {highestCategory.name}
              </span>
              <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                You spent <strong className="text-rose-600 dark:text-rose-400">{formatMoney(highestCategory.value)}</strong> on {highestCategory.name}, which represents <strong>{highestCategory.percentage}%</strong> of your total expenses in this period.
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 sm:inline-block">
            {highestCategory.percentage}% of budget
          </span>
        </div>
      )}

      {/* 1. Monthly Income (Green) vs Expenses (Red) Comparison Chart */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Monthly Income (Green) vs Expenses (Red) Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare your earnings and spending each month to clearly monitor your net savings
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={4}>
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
                tickFormatter={(val) => formatShortMoney(val)}
              />
              <Tooltip
                formatter={(val) => [formatMoney(val), ""]}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#ffffff",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Breakdown Table (Income, Expenses, Savings, Savings Rate) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly Breakdown & Net Savings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detailed month-by-month record of your income, expenses, and savings in Rs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 pr-4">Month</th>
                <th className="py-3 px-4 text-right">Income</th>
                <th className="py-3 px-4 text-right">Expenses</th>
                <th className="py-3 px-4 text-right">Net Savings</th>
                <th className="py-3 pl-4 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...monthlyData].reverse().map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                    {row.fullMonth}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    {formatMoney(row.income)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600 dark:text-rose-400">
                    {formatMoney(row.expense)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      row.savings >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {row.savings >= 0 ? "+" : ""}{formatMoney(row.savings)}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        row.savingsRate > 20
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : row.savingsRate > 0
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {row.income > 0 ? `${row.savingsRate}%` : "0%"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Spending by Category & 3. Monthly Expense Trend (Red) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Spending by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How your expenses are distributed across Food, Transport, Bills, etc.
            </p>
          </div>

          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatMoney(val), ""]}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        color: "#ffffff",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown List */}
              <div className="max-h-56 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto pr-1">
                {categoryData.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: chartColors[idx % chartColors.length],
                        }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {categoryIcons[cat.name] || "🏷️"} {cat.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatMoney(cat.value)}{" "}
                      <span className="text-slate-400 dark:text-slate-500">({cat.percentage}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No expenses recorded in this period.
            </div>
          )}
        </section>

        {/* Monthly Expense Trend Area Chart (Red) */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Monthly Expense Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How your spending fluctuates from month to month (Red)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                  tickFormatter={(val) => formatShortMoney(val)}
                />
                <Tooltip
                  formatter={(val) => [formatMoney(val), "Monthly Spending"]}
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
                  dataKey="expense"
                  name="Expenses"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
