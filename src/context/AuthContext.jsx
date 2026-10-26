import { useEffect, useState } from "react";
import { authApi } from "../utils/api";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("expense_access_token"))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = localStorage.getItem("expense_access_token");
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        if (isMounted && userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn("[Auth] Session validation failed:", err.message);
        if (isMounted) {
          localStorage.removeItem("expense_access_token");
          localStorage.removeItem("expense_refresh_token");
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
      setAuthError("Your session has expired. Please log in again.");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const data = await authApi.login({ username, password });
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setAuthError(err.message || "Failed to log in.");
      throw err;
    }
  };

  const signup = async ({ username, email, password, full_name }) => {
    setAuthError(null);
    try {
      const parts = (full_name || "").trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const data = await authApi.register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      // If tokens returned (e.g. if auto-verification enabled in future), log in; otherwise stay unverified
      if (data?.tokens?.access && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      return data;
    } catch (err) {
      setAuthError(err.message || "Failed to sign up.");
      throw err;
    }
  };

  const verifyEmail = async (token) => {
    setAuthError(null);
    try {
      const data = await authApi.verifyEmail(token);
      if (data?.tokens?.access && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
      return data;
    } catch (err) {
      setAuthError(err.message || "Failed to verify email.");
      throw err;
    }
  };

  const resendVerification = async (emailOrUsername) => {
    return await authApi.resendVerification(emailOrUsername);
  };

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError,
        login,
        signup,
        verifyEmail,
        resendVerification,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
