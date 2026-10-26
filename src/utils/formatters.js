/**
 * NPR Currency & Number Formatter for Expense Tracker Nepal
 * Uses standard South Asian / Nepali grouping (e.g. Rs 500, Rs 2,500, Rs 15,000, Rs 1,25,000)
 */

export function formatMoney(value, includePrefix = true) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  const isNegative = safe < 0;
  const abs = Math.abs(safe);

  // en-IN produces South Asian numbering system (e.g., 1,25,000)
  const formatted = abs.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
  });

  const prefix = includePrefix ? "Rs " : "";
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Compact NPR formatting for tight chart axes or badges
 * e.g. Rs 1.5k, Rs 2.5 Lakh
 */
export function formatShortMoney(value) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  const isNegative = safe < 0;
  const abs = Math.abs(safe);

  let formatted = "";
  if (abs >= 10000000) {
    formatted = (abs / 10000000).toFixed(1).replace(/\.0$/, "") + " Cr";
  } else if (abs >= 100000) {
    formatted = (abs / 100000).toFixed(1).replace(/\.0$/, "") + " Lakh";
  } else if (abs >= 1000) {
    formatted = (abs / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    formatted = abs.toLocaleString("en-IN");
  }

  return `${isNegative ? "-" : ""}Rs ${formatted}`;
}

export function getAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";

    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

export function getInitial(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
