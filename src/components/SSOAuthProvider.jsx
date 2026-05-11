import { useIframeAuth } from "../hooks/useIframeAuth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { setUserInfo, removeUserInfo, updateUserProfile } from "../auth/authSlice";
import { toast } from "react-toastify";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || "http://66.29.128.138:4031";
const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL;

function SSOHandler() {
  const location  = useLocation();
  const ssoEnabled = new URLSearchParams(location.search).get('sso') === '1';
  const { isTokenLoaded, authData, loggedOut } = useIframeAuth(ssoEnabled);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // Logout via postMessage / BroadcastChannel
  useEffect(() => {
    if (!loggedOut) return;
    dispatch(removeUserInfo());
    toast.info("Logged out from SalesDriver");
    navigate("/login", { replace: true });
  }, [loggedOut]);

  // Polling fallback — sd_logout key set by SalesDriver iframe
  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('sd_logout')) {
        localStorage.removeItem('sd_logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('userToken');
        dispatch(removeUserInfo());
        toast.info("Logged out from SalesDriver");
        navigate("/login", { replace: true });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  // SSO login — only when ?sso=1
  useEffect(() => {
    if (!ssoEnabled || !isTokenLoaded || !authData?.token) return;
    const { token, email, name } = authData;

    axios.get(`${AUTH_BASE_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const raw = res.data;
        const user = {
          ...raw,
          first_name: raw.firstName || raw.first_name || "",
          last_name:  raw.lastName  || raw.last_name  || "",
          name: raw.fullName || `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || raw.email,
        };
        localStorage.setItem("userToken", token);
        dispatch(setUserInfo({ token, data: user }));
        toast.success(`Welcome${name ? ', ' + name : ''}! Logged in via SalesDriver`);

        // ── Fetch /user/profile to get the hash after SSO login ──
        try {
          const profileRes = await axios.get(
            `${API_BASE_URL}/user/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (profileRes.data?.profile) {
            dispatch(updateUserProfile(profileRes.data.profile));
          }
        } catch (profileErr) {
          console.warn("Could not fetch profile after SSO login:", profileErr?.response?.status);
        }

        const path = window.location.pathname;
        if (path === "/login" || path === "/signup" || path === "/")
          navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userToken");
      });
  }, [isTokenLoaded]);

  return null;
}

export default function SSOAuthProvider({ children }) {
  return <><SSOHandler />{children}</>;
}
