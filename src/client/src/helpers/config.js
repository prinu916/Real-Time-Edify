const rawBackendUrl = import.meta.env.VITE_APP_BACKEND_URL || "";
const normalizedBackendUrl = rawBackendUrl.replace(/\/$/, "");

export const API = normalizedBackendUrl
  ? normalizedBackendUrl.endsWith("/api/v1")
    ? normalizedBackendUrl
    : `${normalizedBackendUrl}/api/v1`
  : '/api/v1';