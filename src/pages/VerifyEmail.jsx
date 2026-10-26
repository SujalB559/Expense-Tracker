import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../utils/api";
import { useAuth } from "../context/useAuth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verificationAttemptedRef = useRef(false);

  // Countdown for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (verificationAttemptedRef.current) return;

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please check the URL or request a new verification email.");
      return;
    }

    verificationAttemptedRef.current = true;

    async function doVerify() {
      try {
        const res = await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Your email address has been successfully verified!");
        if (res.email) setResendEmail(res.email);
        // Refresh auth state in case token was saved
        if (res.tokens?.access) {
          refreshUser().catch(() => null);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Verification failed. The link may have expired or is invalid.");
        if (err.email) {
          setResendEmail(err.email);
        }
      }
    }

    doVerify();
  }, [token, refreshUser]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError("Please enter your email address to receive a fresh verification link.");
      return;
    }

    setResending(true);
    setResendSuccess("");
    setResendError("");

    try {
      const res = await authApi.resendVerification(resendEmail.trim());
      setResendSuccess(
        res.message || `A new verification link has been sent to ${resendEmail.trim()}.`
      );
      setCooldown(45);
    } catch (err) {
      setResendError(err.message || "Could not send verification email. Please check the address.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold tracking-tight">रू</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Email Verification
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Nepal Expense Tracker Account Security
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          {/* 1. VERIFYING STATE */}
          {status === "verifying" && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
                <svg
                  className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400"
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
              <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                Verifying your email...
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Please wait a moment while we validate your secure verification token.
              </p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === "success" && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-3xl shadow-sm">
                ✓
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                Email Verified Successfully!
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {message}
              </p>

              <div className="mt-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
                🎉 Your account is now fully active. You have full access to daily expense tracking, monthly reports, and budget management in Nepali Rupees (Rs).
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  Continue to Dashboard →
                </button>
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/80"
                >
                  Go to Login Page
                </Link>
              </div>
            </div>
          )}

          {/* 3. ERROR / EXPIRED STATE */}
          {status === "error" && (
            <div className="py-2">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-amber-600 dark:text-amber-400 text-3xl">
                  ⚠️
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  Verification Link Expired or Invalid
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {message}
                </p>
              </div>

              {/* Alert Feedback */}
              {resendSuccess && (
                <div className="mt-5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span>{resendSuccess}</span>
                  </div>
                </div>
              )}

              {resendError && (
                <div className="mt-5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold">Notice:</span>
                    <span>{resendError}</span>
                  </div>
                </div>
              )}

              {/* Resend Form */}
              <div className="mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Request a New Link
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter your email to receive a new, secure verification email.
                </p>

                <form onSubmit={handleResend} className="mt-3.5 space-y-3">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={resending || cooldown > 0}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resending ? (
                      <span>Sending link...</span>
                    ) : cooldown > 0 ? (
                      <span>Resend in {cooldown}s</span>
                    ) : (
                      <span>Resend Verification Email</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  <span>← Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Expense Tracker · Built for Nepal (NPR · Rs.)
        </p>
      </div>
    </div>
  );
}
