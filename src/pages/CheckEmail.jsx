import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { authApi } from "../utils/api";

export default function CheckEmail() {
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [verificationUrl, setVerificationUrl] = useState(location.state?.verificationUrl || "");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setResendError("Please enter your email address to receive a verification link.");
      return;
    }

    setResending(true);
    setResendSuccess("");
    setResendError("");

    try {
      const res = await authApi.resendVerification(email.trim());
      if (res.verification_url) {
        setVerificationUrl(res.verification_url);
      }
      setResendSuccess(
        res.message || `Verification link generated! Check ${email.trim()} or click below.`
      );
      setCooldown(30); // 30 seconds cooldown
    } catch (err) {
      setResendError(err.message || "Failed to resend verification email. Please try again.");
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
            Check Your Email
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            We sent an activation link to finish setting up your account
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          {/* Animated Envelope Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-3xl">
            ✉️
          </div>

          {/* Email badge */}
          {email ? (
            <div className="mt-5 text-center">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                Sent to
              </span>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3.5 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{email}</span>
              </div>
            </div>
          ) : (
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please check the inbox of the email address you registered with.
              </p>
            </div>
          )}

          {/* Instructions List */}
          <div className="mt-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.</span>
              <span>Open the verification email sent from <strong>Expense Tracker</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">2.</span>
              <span>Click the <strong>Verify My Email</strong> button in your email to activate your account.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-amber-600 dark:text-amber-400 font-bold">💡</span>
              <span className="text-slate-500 dark:text-slate-400">
                Can't find it? Be sure to check your <strong>Spam</strong> or <strong>Junk</strong> folder.
              </span>
            </div>
          </div>

          {/* Alert Messages */}
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

          {/* Instant Verification Shortcut */}
          {verificationUrl && (
            <div className="mt-5 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/30 p-4 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <span>⚡</span>
                <span>Instant Verification Link</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Click below to activate your account and open your dashboard immediately:
              </p>
              <a
                href={verificationUrl}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.99] transition"
              >
                <span>✓ Verify My Email & Open Dashboard</span>
              </a>
            </div>
          )}

          

          {/* Resend Action Form */}
          <form onSubmit={handleResend} className="mt-6">
            {!initialEmail && (
              <div className="mb-4">
                <label
                  htmlFor="resendEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </label>
                <input
                  id="resendEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={resending || cooldown > 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400"
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
                  <span>Sending email...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <>
                  <span>↻</span>
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login link */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <span>← Back to Login</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Expense Tracker · Built for Nepal (NPR · Rs.)
        </p>
      </div>
    </div>
  );
}
