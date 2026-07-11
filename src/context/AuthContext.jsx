import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, logoutUser } from "../api/auth.api";
import { registerAuthFailureHandler } from "../api/axios";

const STORAGE_KEY = "musify.user";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // The backend has no "/me" endpoint and the JWT lives in a cookie we
    // can't read from JS, so we mirror the last-known profile in
    // localStorage purely to restore the UI shell after a refresh. The
    // cookie (or its absence) is still what the backend actually checks.
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [authError, setAuthError] = useState("");

  const persist = (nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    registerAuthFailureHandler(() => persist(null));
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    setAuthError("");
    const data = await loginUser({ identifier, password });
    if (!data.user) {
      setAuthError(data.message || "Invalid credentials");
      throw new Error(data.message || "Invalid credentials");
    }
    persist(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError("");
    const data = await registerUser(payload);
    if (!data.user) {
      setAuthError(data.message || "Could not create account");
      throw new Error(data.message || "Could not create account");
    }
    persist(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      persist(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
