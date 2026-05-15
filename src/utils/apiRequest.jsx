import axios from "axios";
import { removeUserInfo, updateUserProfile } from "../auth/authSlice";
import { toast } from "react-toastify";

// 401 on these endpoints should NOT trigger logout — retry with fresh profile instead
const RETRY_401_ENDPOINTS = [
  "/user/fetch-logs",
  "/user/call-volume",
  "/user/fetch-credits",
];

// 401 on these endpoints should be completely silent (no logout, no retry)
const SILENT_401_ENDPOINTS = [
  "/api/dashboard",
  "/dashboard",
  "/user/profile",
  "/profile",
];

const isSilent401 = (url) =>
  SILENT_401_ENDPOINTS.some((e) => url.includes(e));

const isRetry401 = (url) =>
  RETRY_401_ENDPOINTS.some((e) => url.includes(e));

// Fetch fresh profile to get updated hash, then retry the original request
const refreshProfileAndRetry = async (config) => {
  try {
    const token =
      window.__store__?.getState()?.auth?.userToken ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("userToken");
    if (!token) return null;

    // Hit profile API to get fresh data
    const profileRes = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/user/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const profile = profileRes.data?.profile || profileRes.data;
    if (profile) {
      window.__store__?.dispatch(updateUserProfile(profile));
    }

    // Retry original request
    return await axios(config);
  } catch (retryError) {
    console.warn("Retry after profile refresh failed:", retryError?.response?.status);
    return null;
  }
};

// Prevent multiple simultaneous 401 logouts
let isLoggingOut = false;

const handle401Logout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // Clear all auth keys from localStorage
  [
    "userToken", "access_token", "salesdriver_email", "salesdriver_name",
    "persist:auth", "persist:root", "persist:credits",
  ].forEach((k) => { try { localStorage.removeItem(k); } catch (_) {} });

  // Dispatch Redux logout via window.__store__ (avoids circular dependency)
  try {
    window.__store__?.dispatch(removeUserInfo());
  } catch (_) {}

  toast.error("Your session has expired. Please log in again.");

  setTimeout(() => {
    isLoggingOut = false;
    window.location.href = "/login";
  }, 1500);
};

const apiRequest = async (method, url, data = {}, token, headers = {}) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Always resolve token: explicit param → window store → localStorage
  const resolvedToken =
    token ||
    window.__store__?.getState()?.auth?.userToken ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("userToken") ||
    null;

  const config = {
    method: method.toLowerCase(),
    url: `${BASE_URL}${url}`,
    credentials: "include",
    headers: {
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...headers,
    },
  };

  switch (method.toLowerCase()) {
    case "get":
    case "delete":
      config.params = data;
      break;
    case "post":
    case "put":
    case "patch":
      config.data = data;
      break;
    default:
      throw new Error(`Unsupported request method: ${method}`);
  }

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      if (isRetry401(url)) {
        // Refresh profile to get fresh hash, then retry once
        console.log(`[apiRequest] 401 on ${url} — refreshing profile and retrying...`);
        const retryResponse = await refreshProfileAndRetry(config);
        if (retryResponse) return retryResponse;
        // Retry failed — just throw silently, don't logout
        throw error;
      }
      if (!isSilent401(url)) {
        console.warn(`[apiRequest] 401 on ${url} — session expired, logging out`);
        handle401Logout();
      }
    }
    throw error;
  }
};

export default apiRequest;
