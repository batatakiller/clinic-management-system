"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "doctor" | "receptionist" | "patient";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  specialization?: string; // for doctors
  department?: string;
  profileImage?: string;
  lastLogin?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  role?: UserRole; // used only in demo/register
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// No demo users, relying solely on real API
// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hms_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true, // true on mount so we can restore session
    isAuthenticated: false,
    error: null,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { user?: User; token?: string };
        const { user, token } = parsed;
        if (user && token && user.role) {
          dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
          return;
        } else {
          // Invalid or incomplete stored data — clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // corrupted storage — clear it
      localStorage.removeItem(STORAGE_KEY);
    }
    dispatch({ type: "AUTH_LOADING" });
    // Simulate async check done
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    dispatch({ type: "AUTH_LOADING" });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        },
      );

      if (res.ok) {
        const response = (await res.json()) as {
          success: boolean;
          message: string;
          data: { user: User; token: string };
        };
        const { data } = response;

        if (!data || !data.user || !data.user.role) {
          dispatch({
            type: "AUTH_ERROR",
            payload: "Invalid response from server.",
          });
          return;
        }

        const authData = { user: data.user, token: data.token };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

        // Set cookies with proper attributes
        const maxAge = 7 * 24 * 3600; // 7 days
        document.cookie = `hms-token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `hms-role=${data.user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;

        dispatch({ type: "AUTH_SUCCESS", payload: authData });
        return;
      } else {
        const errorData = await res.json().catch(() => ({}));
        dispatch({
          type: "AUTH_ERROR",
          payload: errorData.message || "Invalid email or password.",
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error. Server might be down.";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMsg,
      });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "hms-token=; path=/; max-age=0";
    document.cookie = "hms-role=; path=/; max-age=0";
    dispatch({ type: "AUTH_LOGOUT" });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: "AUTH_LOADING" });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (res.ok) {
        dispatch({ type: "AUTH_LOGOUT" }); // success → send to login
        return;
      } else {
        const err = (await res.json()) as { message?: string };
        dispatch({
          type: "AUTH_ERROR",
          payload: err.message ?? "Registration failed",
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error. Server might be down.";
      dispatch({
        type: "AUTH_ERROR",
        payload: errorMsg,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, register, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export function getRoleDashboardPath(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: "/admin",
    doctor: "/doctor",
    receptionist: "/receptionist",
    patient: "/patient",
  };
  return map[role];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  receptionist: "Receptionist",
  patient: "Patient",
};
