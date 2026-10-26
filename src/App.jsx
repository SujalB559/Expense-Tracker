import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/useAuth";
import { categoryIcons } from "./data/constants";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import CheckEmail from "./pages/CheckEmail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Transactions from "./pages/Transactions";
import VerifyEmail from "./pages/VerifyEmail";
import {
  authApi,
  budgetsApi,
  categoriesApi,
  transactionsApi,
} from "./utils/api";

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategoriesState] = useState({
    expense: [],
    income: [],
    savings: [],
  });
  const [budget, setBudgetState] = useState(20000);
  const [categoryLimits, setCategoryLimitsState] = useState({});

  const categoriesListRef = useRef([]);
  const categoryLimitDebounceRef = useRef({});

  // Fetch real data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadUserData() {
      try {
        // 1. Transactions
        const txList = await transactionsApi.getAll().catch(() => null);
        if (Array.isArray(txList) && isMounted) {
          setTransactions(txList);
        }

        // 2. Categories & Limits
        const catList = await categoriesApi.getAll().catch(() => null);
        if (Array.isArray(catList) && isMounted) {
          categoriesListRef.current = catList;
          const customExp = catList
            .filter((c) => !c.is_default && c.type === "expense")
            .map((c) => c.name);
          const customInc = catList
            .filter((c) => !c.is_default && c.type === "income")
            .map((c) => c.name);
          const customSav = catList
            .filter((c) => !c.is_default && c.type === "savings")
            .map((c) => c.name);

          setCustomCategoriesState({
            expense: customExp,
            income: customInc,
            savings: customSav,
          });

          const limits = {};
          catList.forEach((c) => {
            if (c.limit !== null && c.limit !== undefined && c.limit !== "") {
              limits[c.name] = Number(c.limit);
            }
          });
          setCategoryLimitsState(limits);
        }

        // 3. Monthly Budget
        const bData = await budgetsApi.getMonthlyBudget().catch(() => null);
        if (bData && bData.amount !== undefined && isMounted) {
          setBudgetState(Number(bData.amount) || 20000);
        }
      } catch (err) {
        console.warn("[App] Could not load user data from backend:", err);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Transaction Actions
  const addTransaction = async (transaction) => {
    const tempId = Date.now();
    const optimistic = {
      ...transaction,
      id: tempId,
      icon: categoryIcons[transaction.category] || "🏷️",
    };
    setTransactions((prev) => [optimistic, ...prev]);

    try {
      const created = await transactionsApi.create(transaction);
      if (created && created.id) {
        setTransactions((prev) =>
          prev.map((item) => (item.id === tempId ? created : item))
        );
      }
    } catch (err) {
      console.warn("[App] Failed to save transaction:", err);
      // Revert if failed
      setTransactions((prev) => prev.filter((item) => item.id !== tempId));
      throw err;
    }
  };

  const updateTransaction = async (updated) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? { ...updated, icon: categoryIcons[updated.category] || "🏷️" }
          : item
      )
    );

    try {
      await transactionsApi.update(updated.id, updated);
    } catch (err) {
      console.warn("[App] Failed to update transaction:", err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    const previous = [...transactions];
    setTransactions((prev) => prev.filter((item) => item.id !== id));

    try {
      await transactionsApi.delete(id);
    } catch (err) {
      console.warn("[App] Failed to delete transaction:", err);
      setTransactions(previous);
      throw err;
    }
  };

  // Budget Actions
  const setBudget = (newBudget) => {
    const val = typeof newBudget === "function" ? newBudget(budget) : newBudget;
    setBudgetState(val);
    budgetsApi
      .updateMonthlyBudget(val)
      .catch((err) => console.warn("[App] Failed to sync budget:", err));
  };

  // Categories Actions
  const setCustomCategories = (action) => {
    setCustomCategoriesState((current) => {
      const next = typeof action === "function" ? action(current) : action;

      // New expense category
      const addedExpense = next.expense.find((e) => !current.expense.includes(e));
      if (addedExpense) {
        categoriesApi
          .create({ name: addedExpense, type: "expense" })
          .then((created) => {
            if (created) categoriesListRef.current.push(created);
          })
          .catch((err) => console.warn("[App] Failed to create category:", err));
      }

      // New income category
      const addedIncome = next.income.find((i) => !current.income.includes(i));
      if (addedIncome) {
        categoriesApi
          .create({ name: addedIncome, type: "income" })
          .then((created) => {
            if (created) categoriesListRef.current.push(created);
          })
          .catch((err) => console.warn("[App] Failed to create category:", err));
      }

      // Deleted expense category
      const removedExpense = current.expense.find((e) => !next.expense.includes(e));
      if (removedExpense) {
        const cat = categoriesListRef.current.find(
          (c) => c.name.toLowerCase() === removedExpense.toLowerCase() && c.type === "expense"
        );
        if (cat?.id) {
          categoriesApi
            .delete(cat.id)
            .then(() => {
              categoriesListRef.current = categoriesListRef.current.filter((c) => c.id !== cat.id);
            })
            .catch((err) => console.warn("[App] Failed to delete category:", err));
        }
      }

      // New savings category
      const addedSavings = next.savings?.find((s) => !current.savings?.includes(s));
      if (addedSavings) {
        categoriesApi
          .create({ name: addedSavings, type: "savings" })
          .then((created) => {
            if (created) categoriesListRef.current.push(created);
          })
          .catch((err) => console.warn("[App] Failed to create category:", err));
      }

      // Deleted income category
      const removedIncome = current.income?.find((i) => !next.income?.includes(i));
      if (removedIncome) {
        const cat = categoriesListRef.current.find(
          (c) => c.name.toLowerCase() === removedIncome.toLowerCase() && c.type === "income"
        );
        if (cat?.id) {
          categoriesApi
            .delete(cat.id)
            .then(() => {
              categoriesListRef.current = categoriesListRef.current.filter((c) => c.id !== cat.id);
            })
            .catch((err) => console.warn("[App] Failed to delete category:", err));
        }
      }

      // Deleted savings category
      const removedSavings = current.savings?.find((s) => !next.savings?.includes(s));
      if (removedSavings) {
        const cat = categoriesListRef.current.find(
          (c) => c.name.toLowerCase() === removedSavings.toLowerCase() && c.type === "savings"
        );
        if (cat?.id) {
          categoriesApi
            .delete(cat.id)
            .then(() => {
              categoriesListRef.current = categoriesListRef.current.filter((c) => c.id !== cat.id);
            })
            .catch((err) => console.warn("[App] Failed to delete category:", err));
        }
      }

      return next;
    });
  };

  // Category Limits Actions
  const setCategoryLimits = (action) => {
    setCategoryLimitsState((current) => {
      const next = typeof action === "function" ? action(current) : action;

      Object.keys(next).forEach((catName) => {
        if (next[catName] !== current[catName]) {
          if (categoryLimitDebounceRef.current[catName]) {
            clearTimeout(categoryLimitDebounceRef.current[catName]);
          }
          categoryLimitDebounceRef.current[catName] = setTimeout(() => {
            const cat = categoriesListRef.current.find(
              (c) => c.name.toLowerCase() === catName.toLowerCase()
            );
            const limVal =
              next[catName] !== "" && next[catName] != null
                ? Number(next[catName])
                : null;
            if (cat?.id) {
              categoriesApi
                .update(cat.id, { limit: limVal })
                .catch((err) => console.warn("[App] Failed to update category limit:", err));
            }
          }, 500);
        }
      });

      return next;
    });
  };

  // Data management Actions
  const clearData = async () => {
    setTransactions([]);
    try {
      await transactionsApi.clearAll();
    } catch (err) {
      console.warn("[App] Failed to clear transactions:", err);
    }
  };

  const resetData = async () => {
    setTransactions([]);
    setCustomCategoriesState({ expense: [], income: [], savings: [] });
    setBudgetState(20000);
    setCategoryLimitsState({});

    try {
      await authApi.resetUserData();
      const freshCats = await categoriesApi.getAll().catch(() => []);
      if (Array.isArray(freshCats)) {
        categoriesListRef.current = freshCats;
      }
    } catch (err) {
      console.warn("[App] Failed to reset data:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <svg className="h-5 w-5 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading Expense Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Signup />
        }
      />
      <Route
        path="/check-email"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <CheckEmail />
        }
      />
      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Layout
              onAddTransaction={addTransaction}
              availableCategories={customCategories}
            >
              <Dashboard
                transactions={transactions}
                addTransaction={addTransaction}
                budget={budget}
                setBudget={setBudget}
                customCategories={customCategories}
              />
            </Layout>
          )
        }
      />

      <Route
        path="/transactions"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Layout
              onAddTransaction={addTransaction}
              availableCategories={customCategories}
            >
              <Transactions
                transactions={transactions}
                addTransaction={addTransaction}
                updateTransaction={updateTransaction}
                deleteTransaction={deleteTransaction}
                customCategories={customCategories}
              />
            </Layout>
          )
        }
      />

      <Route
        path="/analytics"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Layout
              onAddTransaction={addTransaction}
              availableCategories={customCategories}
            >
              <Analytics transactions={transactions} />
            </Layout>
          )
        }
      />

      <Route
        path="/categories"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Layout
              onAddTransaction={addTransaction}
              availableCategories={customCategories}
            >
              <Categories
                customCategories={customCategories}
                setCustomCategories={setCustomCategories}
                categoryLimits={categoryLimits}
                setCategoryLimits={setCategoryLimits}
              />
            </Layout>
          )
        }
      />

      <Route
        path="/settings"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <Layout
              onAddTransaction={addTransaction}
              availableCategories={customCategories}
            >
              <Settings
                budget={budget}
                setBudget={setBudget}
                clearData={clearData}
                resetData={resetData}
              />
            </Layout>
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
