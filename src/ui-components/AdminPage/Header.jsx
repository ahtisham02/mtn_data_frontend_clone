import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeUserInfo } from "../../auth/authSlice";
import apiRequest from "../../utils/apiRequest";
import {
  Search,
  UserCircle,
  User,
  LogOut,
  Mountain,
  FileCode2,
  FileClock,
  CreditCard,
  Zap,
  Wallet,
} from "lucide-react";
import { collections } from "../../utils/data";
import { toast } from "react-toastify";

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const walletMenuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.userToken);
  const Hash = useSelector(
    (state) => state?.auth?.userInfo?.profile?.client?.[0]?.hash
  );

  useClickOutside(searchRef, () => setIsSearchOpen(false));
  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useClickOutside(walletMenuRef, () => setIsWalletMenuOpen(false));

  useEffect(() => {
    const fetchCredits = async () => {
      if (token && Hash) {
        try {
          const creditsResponse = await apiRequest(
            "get",
            "/user/fetch-credits",
            null,
            token,
            {
              "x-auth-token": Hash,
            }
          );
          setCreditsInfo(creditsResponse.data);
        } catch (error) {
          console.error("Failed to fetch credits:", error);
        }
      }
    };
    fetchCredits();
  }, [token, Hash]);

  const allEndpoints = collections.flatMap((c) => c.endpoints);
  const filteredEndpoints = searchTerm
    ? allEndpoints.filter((ep) =>
        ep.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleLogout = () => {
    toast.success("You have been logged out successfully!");
    dispatch(removeUserInfo());
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20 gap-4">
      <div className="flex items-center shrink-0">
        <div className="flex items-center space-x-3">
          <Mountain className="w-8 h-8 mb-0.5 text-accent" />
          <div className="text-black font-bold text-2xl">MTN DATA</div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center gap-3 flex-shrink-0">
        {creditsInfo ? (
          <>
            <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-2 text-rose-800">
              <CreditCard className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
              <p className="text-[13px] font-medium">
                Credits:
                <span className="font-semibold ml-1.5">
                  {creditsInfo.remainingCredits}
                </span>
                <span className="opacity-70">
                  {" "}
                  / {creditsInfo.totalCredits}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-2 text-sky-800">
              <Zap className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
              <p className="text-[13px] font-medium">
                API Calls:
                <span className="font-semibold ml-1.5">
                  {creditsInfo.remainingCalls}
                </span>
                <span className="opacity-70">
                  {" "}
                  / {creditsInfo.totalCalls}
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-[34px] w-36 animate-pulse rounded-full bg-muted/60"></div>
            <div className="h-[34px] w-36 animate-pulse rounded-full bg-muted/60"></div>
          </>
        )}
      </div>

      <div ref={searchRef} className="flex-1 max-w-lg relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchTerm}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-foreground pl-11 pr-4 py-2 border border-border bg-background rounded-md focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>
        {isSearchOpen && searchTerm && (
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
            {filteredEndpoints.length > 0 ? (
              <ul>
                {filteredEndpoints.map((ep) => (
                  <li key={ep.slug}>
                    <Link
                      to={`/endpoint/${ep.slug}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-background"
                    >
                      <FileCode2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {ep.name}
                        </p>
                        <p className="text-sm text-muted">{ep.method}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-muted">No results found.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <div ref={walletMenuRef} className="relative lg:hidden">
          <button
            onClick={() => setIsWalletMenuOpen((prev) => !prev)}
            className="p-1 rounded-full hover:bg-muted/50"
          >
            <Wallet className="h-6 w-6 text-muted hover:text-accent" />
          </button>
          {isWalletMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-md shadow-lg z-10 p-3">
              {creditsInfo ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md bg-rose-100 px-3 py-2 text-rose-800">
                    <CreditCard className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
                    <p className="text-[13px] font-medium">
                      Credits:
                      <span className="font-semibold ml-1.5">
                        {creditsInfo.remainingCredits}
                      </span>
                      <span className="opacity-70">
                        {" "}
                        / {creditsInfo.totalCredits}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-sky-100 px-3 py-2 text-sky-800">
                    <Zap className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
                    <p className="text-[13px] font-medium">
                      API Calls:
                      <span className="font-semibold ml-1.5">
                        {creditsInfo.remainingCalls}
                      </span>
                      <span className="opacity-70">
                        {" "}
                        / {creditsInfo.totalCalls}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-[38px] w-full animate-pulse rounded-md bg-muted/60"></div>
                  <div className="h-[38px] w-full animate-pulse rounded-md bg-muted/60"></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="rounded-full"
          >
            <UserCircle className="h-8 w-8 text-muted hover:text-accent" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-10">
              <ul className="p-1">
                <li>
                  <Link
                    to="/profile"
                    className="w-full text-left flex items-center gap-3 p-2 text-sm rounded-md hover:bg-background text-foreground"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-muted" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/logs"
                    className="w-full text-left flex items-center gap-3 p-2 text-sm rounded-md hover:bg-background text-foreground"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FileClock className="w-4 h-4 text-muted" />
                    API Logs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/billing"
                    className="w-full text-left flex items-center gap-3 p-2 text-sm rounded-md hover:bg-background text-foreground"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4 text-muted" />
                    Billing
                  </Link>
                </li>
                <div className="my-1 border-t border-border -mx-1" />
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 p-2 text-sm rounded-md hover:bg-background text-red-500"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}