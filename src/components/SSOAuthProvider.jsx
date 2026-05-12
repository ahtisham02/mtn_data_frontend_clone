import { useIframeAuth } from "../hooks/useIframeAuth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUserInfo, removeUserInfo, updateUserProfile } from "../auth/authSlice";
import { toast } from "react-toastify";
import apiRequest from "../utils/apiRequest";

const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL;

function SSOHandler() {
  const location  = useLocation();
  const ssoEnabled = new URLSearchParams(location.search).get('sso') === '1';
  const { isTokenLoaded, authData, loggedOut } = useIframeAuth(false); // Always listen for logout
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Log when component mounts
  useEffect(() => {
    console.log('[MTN Data] SSOHandler component mounted');
    return () => console.log('[MTN Data] SSOHandler component unmounted');
  }, []);

  // Logout via postMessage / BroadcastChannel
  useEffect(() => {
    if (!loggedOut) return;
    dispatch(removeUserInfo());
    toast.info("Logged out from SalesDriver");
    navigate("/login", { replace: true });
  }, [loggedOut, dispatch, navigate]);

  // Logout detection - Multiple fallback methods
  // Method 1: Polling for sd_logout flag (set by iframe)
  useEffect(() => {
    console.log('[MTN Data] Logout polling started');
    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      const sdLogoutFlag = localStorage.getItem('sd_logout');
      
      // Log every 10 checks (every 10 seconds)
      if (checkCount % 10 === 0) {
        console.log('[MTN Data] Polling check #' + checkCount + ', sd_logout:', sdLogoutFlag);
      }
      
      if (sdLogoutFlag) {
        console.log('[MTN Data] sd_logout flag detected via polling:', sdLogoutFlag);
        performLogout('polling');
      }
    }, 1000);
    return () => {
      console.log('[MTN Data] Logout polling stopped');
      clearInterval(interval);
    };
  }, [dispatch, navigate]);

  // Method 2: BroadcastChannel API
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('salesdriver_auth');
      channel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          console.log('[MTN Data] Logout detected via BroadcastChannel');
          performLogout('BroadcastChannel');
        }
      };
      console.log('[MTN Data] BroadcastChannel listener active');
      return () => channel.close();
    } catch (e) {
      console.warn('[MTN Data] BroadcastChannel not supported:', e);
    }
  }, [dispatch, navigate]);

  // Method 3: Storage event listener (cross-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sd_logout_broadcast' || e.key === 'sd_logout') {
        console.log('[MTN Data] Logout detected via storage event:', e.key);
        performLogout('storage event');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    console.log('[MTN Data] Storage event listener active');
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, navigate]);

  // Method 4: Periodic token validation (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('userToken');
      const persistAuth = localStorage.getItem('persist:auth');
      
      // If no token found, user might have been logged out
      if (!token && !persistAuth) {
        console.log('[MTN Data] No auth token found, logging out');
        performLogout('token validation');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  // Helper function to perform logout
  const performLogout = (method) => {
    console.log('[MTN Data] Performing logout via:', method);
    localStorage.removeItem('sd_logout');
    localStorage.removeItem('sd_logout_broadcast');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('persist:auth');
    localStorage.removeItem('persist:root');
    dispatch(removeUserInfo());
    toast.info("Logged out from SalesDriver");
    navigate("/login", { replace: true });
  };

  // SSO login — only when ?sso=1
  useEffect(() => {
    if (!ssoEnabled || !isTokenLoaded || !authData?.token) return;
    const { token, email, name } = authData;

    // Store token and set minimal auth
    localStorage.setItem("userToken", token);
    localStorage.setItem("access_token", token);
    dispatch(setUserInfo({ token, data: { email, name } }));

    // Fetch MTN Data profile
    apiRequest('get', '/user/profile', null, token)
      .then(async (res) => {
        const profileData = res.data?.profile || res.data;
        if (profileData) {
          dispatch(updateUserProfile(profileData));
        }
        toast.success(`Welcome${name ? ', ' + name : ''}! Logged in via SalesDriver`);

        const path = window.location.pathname;
        if (path === "/login" || path === "/signup" || path === "/")
          navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        console.warn("Profile fetch failed:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("userToken");
      });
  }, [ssoEnabled, isTokenLoaded, authData, dispatch, navigate]);

  return null;
}

export default function SSOAuthProvider({ children }) {
  return <><SSOHandler />{children}</>;
}
