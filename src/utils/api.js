const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function extractFriendlyErrorMessage(errorData, status) {
  if (typeof errorData === "string" && errorData.trim()) {
    return errorData;
  }

  if (errorData?.message) {
    return errorData.message;
  }

  if (errorData?.detail) {
    if (
      errorData.detail.toLowerCase().includes("no active account") ||
      errorData.detail.toLowerCase().includes("credentials")
    ) {
      return "Incorrect username or password. Please check your credentials.";
    }
    return errorData.detail;
  }

  if (Array.isArray(errorData?.non_field_errors)) {
    return errorData.non_field_errors.join(" ");
  }

  if (status === 401) {
    return "Your session has expired or credentials are invalid. Please log in.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "Requested resource could not be found.";
  }
  if (status >= 500) {
    return "A server error occurred. Please try again later.";
  }

  // Handle Django validation dictionary e.g. { username: ["A user with that username already exists."] }
  if (typeof errorData === "object" && errorData !== null) {
    const messages = [];
    for (const [key, val] of Object.entries(errorData)) {
      const field = key === "detail" ? "" : `${key.replace(/_/g, " ")}: `;
      if (Array.isArray(val)) {
        messages.push(`${field}${val.join(", ")}`);
      } else if (typeof val === "string") {
        messages.push(`${field}${val}`);
      }
    }
    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  return `Something went wrong (code ${status}). Please try again.`;
}

export async function request(endpoint, options = {}) {
  let accessToken = localStorage.getItem("expense_access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.warn(`[API] Connection error on ${endpoint}:`, err);
    throw new Error("Unable to connect to the server. Please verify your connection.");
  }

  // Handle token refresh on 401
  if (response.status === 401 && localStorage.getItem("expense_refresh_token") && !endpoint.includes("/auth/refresh")) {
    const refreshToken = localStorage.getItem("expense_refresh_token");
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        localStorage.setItem("expense_access_token", refreshData.access);
        headers.Authorization = `Bearer ${refreshData.access}`;

        // Retry original request with refreshed token
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        localStorage.removeItem("expense_access_token");
        localStorage.removeItem("expense_refresh_token");
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    } catch {
      localStorage.removeItem("expense_access_token");
      localStorage.removeItem("expense_refresh_token");
      window.dispatchEvent(new Event("auth:session-expired"));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = extractFriendlyErrorMessage(errorData, response.status);
    const err = new Error(message);
    err.status = response.status;
    err.data = errorData;
    err.isEmailNotVerified =
      errorData?.error === "email_not_verified" ||
      (typeof message === "string" && message.toLowerCase().includes("not verified"));
    err.email = errorData?.email;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

// Authentication API
export const authApi = {
  register: async (data) => {
    const res = await request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Note: unverified accounts do not receive auto-login tokens
    if (res?.tokens?.access) {
      localStorage.setItem("expense_access_token", res.tokens.access);
      localStorage.setItem("expense_refresh_token", res.tokens.refresh);
    }
    return res;
  },
  login: async (credentials) => {
    const data = await request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (data?.tokens?.access) {
      localStorage.setItem("expense_access_token", data.tokens.access);
      localStorage.setItem("expense_refresh_token", data.tokens.refresh);
    }
    return data;
  },
  verifyEmail: async (token) => {
    const res = await request("/auth/verify-email/", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (res?.tokens?.access) {
      localStorage.setItem("expense_access_token", res.tokens.access);
      localStorage.setItem("expense_refresh_token", res.tokens.refresh);
    }
    return res;
  },
  resendVerification: (identifier) => {
    const str = String(identifier || "").trim();
    const payload = str.includes("@") ? { email: str } : { username: str };
    return request("/auth/resend-verification/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getCurrentUser: () => request("/auth/me/"),
  updateProfile: (data) =>
    request("/auth/me/", { method: "PATCH", body: JSON.stringify(data) }),
  resetUserData: () => request("/auth/reset-data/", { method: "POST" }),
  logout: () => {
    localStorage.removeItem("expense_access_token");
    localStorage.removeItem("expense_refresh_token");
  },
};

// Transactions API
export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions/${query ? `?${query}` : ""}`);
  },
  getSummary: () => request("/transactions/summary/"),
  create: (data) =>
    request("/transactions/", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/transactions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/transactions/${id}/`, { method: "DELETE" }),
  clearAll: () => request("/transactions/clear/", { method: "POST" }),
};

// Categories API
export const categoriesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/categories/${query ? `?${query}` : ""}`);
  },
  create: (data) =>
    request("/categories/", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/categories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/categories/${id}/`, { method: "DELETE" }),
};

// Budgets API
export const budgetsApi = {
  getMonthlyBudget: () => request("/budgets/"),
  updateMonthlyBudget: (amount) =>
    request("/budgets/", {
      method: "PATCH",
      body: JSON.stringify({ amount: Number(amount) }),
    }),
  getSavingsGoals: () => request("/budgets/goals/"),
  createSavingsGoal: (data) =>
    request("/budgets/goals/", { method: "POST", body: JSON.stringify(data) }),
  updateSavingsGoal: (id, data) =>
    request(`/budgets/goals/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSavingsGoal: (id) =>
    request(`/budgets/goals/${id}/`, { method: "DELETE" }),
};
