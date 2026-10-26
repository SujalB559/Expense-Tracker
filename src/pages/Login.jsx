import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authApi } from "../utils/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [localError, setLocalError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);


  const { login, authError } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer for resending verification from login
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSuccess = (userObj) => {
    const name = userObj?.full_name || userObj?.first_name || userObj?.username || "there";
    setWelcomeUser(name);
    setTimeout(() => {
      navigate("/");
    }, 900);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLocalError("Please enter both your username and password.");
      return;
    }

    setLocalError("");
    setUnverifiedEmail(null);
    setResendSuccess("");
    setResendError("");
    setLoading(true);

    try {
      const data = await login(username.trim(), password);
      handleLoginSuccess(data?.user);
    } catch (err) {
      const isUnverified =
        err.isEmailNotVerified ||
        (err.message && err.message.toLowerCase().includes("not verified"));

      if (isUnverified) {
        setUnverifiedEmail(err.email || (username.includes("@") ? username.trim() : ""));
        setLocalError(
          err.message || "Your email address is not verified yet. Please check your inbox or resend the verification link."
        );
      } else {
        setLocalError(err.message || "Invalid username or password.");
      }
      setLoading(false);
    }
  };

  const handleResendFromLogin = async () => {
    const target = unverifiedEmail || username.trim();
    if (!target) {
      setResendError("Please enter your registered email address or username.");
      return;
    }

    setResending(true);
    setResendSuccess("");
    setResendError("");

    try {
      const res = await authApi.resendVerification(target);
      setResendSuccess(
        res.message || `A new verification email has been sent to ${res.email || target}.`
      );
      setResendCooldown(45);
    } catch (err) {
      setResendError(err.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername("jordan");
    setPassword("password123");
    setLocalError("");
    setUnverifiedEmail(null);
    setResendSuccess("");
    setResendError("");
    setLoading(true);
    try {
      const data = await login("jordan", "password123");
      handleLoginSuccess(data?.user);
    } catch (err) {
      setLocalError(err.message || "Failed to log into demo account.");
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Smooth Welcome Transition Overlay */}
        {welcomeUser && (
          <div className="animate-pop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-white dark:bg-slate-900 p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-3xl shadow-sm">
                👋
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Namaste, {welcomeUser}!
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Welcome back. Preparing your financial overview in Rs...
              </p>
              <div className="mt-5 flex justify-center">
                <svg
                  className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <span className="text-xl font-bold tracking-tight">रू</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expense Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Log in to manage your daily money in Nepal (Rs.)
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          {/* Unverified Email Warning Banner */}
          {unverifiedEmail ? (
            <div className="mb-5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none">⚠️</span>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-amber-950 dark:text-amber-100">
                    Email Verification Required
                  </p>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                    Your account exists, but your email address has not been verified yet. Please check your inbox (and spam folder) to activate your account.
                  </p>

                  {resendSuccess && (
                    <div className="rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-2 text-emerald-800 dark:text-emerald-300 font-medium">
                      ✓ {resendSuccess}
                    </div>
                  )}

                  {resendError && (
                    <div className="rounded-lg bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 p-2 text-red-800 dark:text-red-300 font-medium">
                      Notice: {resendError}
                    </div>
                  )}

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendFromLogin}
                      disabled={resending || resendCooldown > 0}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 dark:bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50"
                    >
                      {resending ? (
                        <span>Sending link...</span>
                      ) : resendCooldown > 0 ? (
                        <span>Resend in {resendCooldown}s</span>
                      ) : (
                        <span>Resend Verification Email</span>
                      )}
                    </button>
                    <Link
                      to="/check-email"
                      state={{ email: unverifiedEmail }}
                      className="text-xs font-semibold text-amber-800 dark:text-amber-300 underline hover:text-amber-900"
                    >
                      Instructions page →
                    </Link>
                  </div>


                </div>
              </div>
            </div>
          ) : displayError ? (
            <div className="mb-5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3.5 text-sm text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2.5">
                <span className="font-bold">Notice:</span>
                <span>{displayError}</span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Email
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email address"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700/80 disabled:opacity-50"
            >
              <span>Instant Test: Demo Account (Jordan)</span>
            </button>
          </div>

          {/* Signup link */}
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Amounts tracked strictly in Nepalese Rupees (NPR · Rs.)
        </p>
      </div>
    </div>
  );
}
