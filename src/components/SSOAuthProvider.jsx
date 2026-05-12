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

  // Logout via postMessage / BroadcastChannel
  useEffect(() => {
    if (!loggedOut) return;
    dispatch(removeUserInfo());
    toast.info("Logged out from SalesDriver");
    navigate("/login", { replace: true });
  }, [loggedOut, dispatch, navigate]);

  // Polling fallback — sd_logout key set by SalesDriver iframe
  useEffect(() => {
    console.log('[MTN Data] Logout polling started');
    const interval = setInterval(() => {
      const sdLogoutFlag = localStorage.getItem('sd_logout');
      if (sdLogoutFlag) {
        console.log('[MTN Data] sd_logout flag detected:', sdLogoutFlag);
        console.log('[MTN Data] Clearing tokens and logging out...');
        localStorage.removeItem('sd_logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('userToken');
        dispatch(removeUserInfo());
        toast.info("Logged out from SalesDriver");
        navigate("/login", { replace: true });
      }
    }, 1000);
    return () => {
      console.log('[MTN Data] Logout polling stopped');
      clearInterval(interval);
    };
  }, [dispatch, navigate]);

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
