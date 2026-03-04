export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Helper to get token from multiple sources
  const getToken = (): string | null => {
    // Source 1: Try to get from localStorage (most reliable)
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem("hms_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          const token = parsed.token || null;
          if (token) return token;
        }
      } catch {
        // ignore parse errors
      }
    }

    // Source 2: Try to get from cookies
    if (typeof document !== "undefined") {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; hms-token=`);
      if (parts.length === 2) {
        const token = parts.pop()?.split(";").shift() || null;
        if (token) return token;
      }
    }

    return null;
  };

  const token = getToken();

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // For CORS cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}
