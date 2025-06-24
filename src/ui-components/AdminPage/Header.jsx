import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CountUp from "react-countup";
import { removeUserInfo } from "../../auth/authSlice";
import { fetchCredits } from "../../auth/userSlice";
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
  Menu,
} from "lucide-react";
import { collections } from "../../utils/data";
import { toast } from "react-toastify";

const LoadingDots = () => (
  <div className="flex items-center justify-center p-2 space-x-1">
    <span className="sr-only">Loading...</span>
    <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"></div>
  </div>
);

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

// CHANGED: Accept `isSidebarOpen` as a prop
export default function Header({ isSidebarOpen, setIsSidebarOpen, closeSidebar }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const walletMenuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.userToken);
  const Hash = useSelector((state) => state.auth.userInfo?.profile?.client?.[0]?.hash);
  const creditsInfo = useSelector((state) => state.user.creditsInfo);
  const creditsStatus = useSelector((state) => state.user.status);

  useClickOutside(searchRef, () => setIsSearchOpen(false));
  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));
  useClickOutside(walletMenuRef, () => setIsWalletMenuOpen(false));

  useEffect(() => {
    if (token && Hash) {
      dispatch(fetchCredits());
    }
  }, [token, Hash, dispatch]);

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

  const showInitialLoader = creditsStatus === 'loading' && !creditsInfo;

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20 gap-4">
      <div className="flex items-center shrink-0">
        <button
          // CHANGED: This now toggles the sidebar state
          onClick={() => setIsSidebarOpen(prevState => !prevState)}
          className="mr-3 md:hidden"
          // CHANGED: The label is now dynamic for better accessibility
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          <Mountain className="w-8 h-8 mb-0.5 text-accent" />
          <div className="hidden font-bold text-black sm:block text-2xl">MTN DATA</div>
        </div>
      </div>

      <div className="items-center justify-center hidden gap-3 lg:flex flex-shrink-0">
        <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-2 text-rose-800 min-w-[140px] justify-center">
          <CreditCard className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
          {showInitialLoader ? <LoadingDots /> : (
            <p className="text-[13px] font-medium">
              Credits:
              <span className="ml-1.5 font-semibold">
                <CountUp start={0} end={creditsInfo?.remainingCredits || 0} duration={1} separator="," />
              </span>
              <span className="opacity-70">
                {" / "}
                <CountUp start={0} end={creditsInfo?.totalCredits || 0} duration={1} separator="," />
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-2 text-sky-800 min-w-[140px] justify-center">
          <Zap className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
           {showInitialLoader ? <LoadingDots /> : (
            <p className="text-[13px] font-medium">
              API Calls:
              <span className="ml-1.5 font-semibold">
                 <CountUp start={0} end={creditsInfo?.remainingCalls || 0} duration={1} separator="," />
              </span>
              <span className="opacity-70">
                {" / "}
                 <CountUp start={0} end={creditsInfo?.totalCalls || 0} duration={1} separator="," />
              </span>
            </p>
          )}
        </div>
      </div>

      <div ref={searchRef} className="relative flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchTerm}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-11 pr-4 border rounded-md text-foreground border-border bg-background focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>
        {isSearchOpen && searchTerm && (
          <div className="absolute !z-50 w-80 -ml-20 sm:-ml-0 min-[400px]:-ml-14 min-[450px]:-ml-16 min-[450px]:w-96 min-[500px]:-ml-8 min-[550px]:-ml-4 min-[600px]:w-[450px] sm:w-full mt-2 overflow-y-auto bg-card border rounded-md shadow-lg top-full border-border max-h-80">
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
                      <FileCode2 className="flex-shrink-0 w-5 h-5 text-accent" />
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
            <Wallet className="w-6 h-6 text-muted hover:text-accent" />
          </button>
          {isWalletMenuOpen && (
            <div className="absolute right-0 z-10 p-3 mt-2 w-64 bg-card border rounded-md shadow-lg top-full border-border">
              {showInitialLoader ? (
                <div className="flex items-center justify-center h-20">
                    <LoadingDots/>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-100 text-rose-800">
                    <CreditCard className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
                    <p className="text-[13px] font-medium">
                      Credits:
                      <span className="ml-1.5 font-semibold">
                        <CountUp end={creditsInfo?.remainingCredits || 0} duration={1}/>
                      </span>
                      <span className="opacity-70">
                        {" / "}
                        <CountUp end={creditsInfo?.totalCredits || 0} duration={1}/>
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sky-100 text-sky-800">
                    <Zap className="h-[17px] mb-0.5 w-[17px] flex-shrink-0" />
                    <p className="text-[13px] font-medium">
                      API Calls:
                      <span className="ml-1.5 font-semibold">
                        <CountUp end={creditsInfo?.remainingCalls || 0} duration={1}/>
                      </span>
                      <span className="opacity-70">
                        {" / "}
                        <CountUp end={creditsInfo?.totalCalls || 0} duration={1}/>
                      </span>
                    </p>
                  </div>
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
            <UserCircle className="w-8 h-8 text-muted hover:text-accent" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-4 z-10 w-56 mt-2 bg-card border rounded-md shadow-lg sm:right-0 top-full border-border">
              <ul className="p-1">
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center w-full gap-3 p-2 text-sm text-left rounded-md text-foreground hover:bg-background"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-muted" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/logs"
                    className="flex items-center w-full gap-3 p-2 text-sm text-left rounded-md text-foreground hover:bg-background"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FileClock className="w-4 h-4 text-muted" />
                    API Logs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/billing"
                    className="flex items-center w-full gap-3 p-2 text-sm text-left rounded-md text-foreground hover:bg-background"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4 text-muted" />
                    Billing
                  </Link>
                </li>
                <div className="my-1 -mx-1 border-t border-border" />
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 p-2 text-sm text-left text-red-500 rounded-md hover:bg-background"
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