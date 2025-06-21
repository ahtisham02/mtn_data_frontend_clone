import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  BarChart,
  Bar,
  LabelList,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import {
  CheckCircle,
  ChevronRight,
  Server,
  Cpu,
  Clock,
  BarChart2,
  Activity,
  Shield,
  Database,
  Layers,
  ArrowUp,
  ArrowDown,
  Zap,
  XCircle,
  ArrowRight,
  Loader,
} from "lucide-react";
import {
  setLogsLoading,
  setLogsSuccess,
  setLogsError,
} from "../../auth/logsSlice";
import { apiData, collections, packages } from "../../utils/data";
import DashboardLoader from "./DashboardLoader";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const getSeededRandom = (seed, min, max) => {
  if (!seed) return min;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const random = (Math.abs(hash) % 1000) / 1000;
  return Math.floor(random * (max - min + 1)) + min;
};

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        className="text-2xl font-bold fill-foreground"
      >
        {value.toLocaleString()}
      </text>
      <text
        x={cx}
        y={cy + 10}
        dy={8}
        textAnchor="middle"
        className="text-sm fill-muted-foreground"
      >
        {(percent * 100).toFixed(2)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-md"
      />
    </g>
  );
};

const EmptyChartState = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-sm text-muted-foreground">No data available</p>
  </div>
);

const ResponseCodesPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_, index) => setActiveIndex(index);

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4" />
        Response Codes
      </h3>
      <div className="w-full h-40">
        {!data || data.length === 0 ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="mt-6 space-y-3">
        {data.map((item, index) => (
          <li
            key={item.name}
            className={`flex items-center gap-3 text-sm transition-opacity ${
              activeIndex === index ? "opacity-100" : "opacity-60"
            }`}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-muted-foreground flex-1">{item.name}</span>
            <span className="font-semibold text-foreground">
              {item.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EndpointUsageChart = ({ data }) => {
  const colorScale = ["#a78bfa", "#9370db", "#805ad5", "#6b46c1", "#553c9a"];

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4" />
        Top Endpoints
      </h3>
      <div className="w-full h-72">
        {!data || data.length === 0 ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              barCategoryGap="25%"
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "hsla(var(--accent) / 0.1)" }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="p-2 bg-card border rounded-lg shadow-lg">
                      <p className="font-bold text-foreground">
                        {payload[0].payload.name}
                      </p>
                      <p className="text-muted-foreground">{`Requests: ${payload[0].value.toLocaleString()}`}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value) => value.toLocaleString()}
                  className="fill-foreground font-semibold"
                  fontSize={12}
                />
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorScale[index % colorScale.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const LatencyDistributionChart = ({ data }) => (
  <div className="p-6 bg-card border border-border rounded-xl">
    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
      <Clock className="h-5 w-5 text-accent" />
      Latency Distribution
    </h2>
    <div className="h-64 w-full">
      {!data || data.every((d) => d.requests === 0) ? (
        <EmptyChartState />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsla(var(--accent) / 0.1)" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Bar
              dataKey="requests"
              fill="url(#latencyGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

const RequestMethodsChart = ({ data }) => {
  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-accent" />
        Request Methods
      </h2>
      <div className="h-64 w-full">
        {!data || data.length === 0 ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={15}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey="value" cornerRadius={10} />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const ApiCallVolumeChart = ({ data }) => (
  <div className="w-full h-80">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value >= 1000 ? `${value / 1000}k` : value
          }
        />
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
          }}
          formatter={(value) => [value.toLocaleString(), "Requests"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVolume)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const StatusIndicator = ({ operational }) => (
  <span
    className={`flex items-center gap-1.5 ${
      operational
        ? "bg-green-500/10 text-green-400"
        : "bg-red-500/10 text-red-400"
    } text-xs font-medium px-2.5 py-1 rounded-full`}
  >
    {operational ? (
      <>
        <CheckCircle className="h-3.5 w-3.5" />
        Operational
      </>
    ) : (
      <>
        <Server className="h-3.5 w-3.5" />
        Down
      </>
    )}
  </span>
);

const StatCard = ({ icon, title, value, change, isPositive }) => {
  const IconComponent = icon;
  return (
    <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-4">
      <div
        className={`p-2 rounded-lg ${
          isPositive
            ? "bg-green-500/10 text-green-500"
            : "bg-red-500/10 text-red-500"
        }`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p
          className={`text-xs mt-1 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUp className="inline h-3 w-3" />
          ) : (
            <ArrowDown className="inline h-3 w-3" />
          )}{" "}
          {change}
        </p>
      </div>
    </div>
  );
};

const CollectionRow = ({ collection }) => {
  if (!collection.endpoints || collection.endpoints.length === 0) return null;
  const firstEndpointSlug = collection.endpoints[0].slug;
  return (
    <Link
      to={`/endpoint/${firstEndpointSlug}`}
      className="flex items-center justify-between p-4 -mx-4 rounded-lg hover:bg-accent/5 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Layers className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
            {collection.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {collection.endpoints.length} endpoints
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
};

const PackageCard = ({ pkg, onCtaClick, isLoading, isCurrentPlan }) => {
  const IconComponent = pkg.icon;
  const isCustomPlan = pkg.price === "Custom";
  return (
    <div
      className={`flex flex-col h-full p-6 transition-all duration-300 bg-white border rounded-2xl ${
        isCurrentPlan
          ? "border-accent shadow-accent/20 shadow-lg"
          : "border-border hover:shadow-2xl hover:-translate-y-2"
      }`}
    >
      {isCurrentPlan && (
        <div className="text-center py-1 px-4 bg-accent text-white text-xs font-bold rounded-full -mt-10 mx-auto mb-4">
          Current Plan
        </div>
      )}
      <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-accent/10">
        {IconComponent && <IconComponent className="w-7 h-7 text-accent" />}
      </div>
      <h3 className="text-2xl font-bold text-foreground">{pkg.name}</h3>
      <div className="flex items-end mt-4">
        {typeof pkg.price === "number" ? (
          <>
            <span className="text-5xl font-extrabold text-foreground">
              ${pkg.price}
            </span>
            <span className="pb-1 ml-2 font-semibold text-muted">/Month</span>
          </>
        ) : (
          <span className="text-4xl font-extrabold text-foreground">
            {pkg.price}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1 text-sm font-semibold text-muted">
        {pkg.details.map((detail) => (
          <p key={detail}>{detail}</p>
        ))}
      </div>
      <div className="flex flex-col flex-grow pt-8 mt-8 border-t border-border">
        <ul className="space-y-4">
          {pkg.features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-3">
              {feature.included ? (
                <CheckCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-green-500" />
              ) : (
                <XCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-rose-400" />
              )}
              <span
                className={
                  !feature.included
                    ? "text-muted line-through"
                    : "text-foreground"
                }
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        {pkg.rateLimit && (
          <p className="mt-6 text-xs font-semibold text-muted">
            {pkg.rateLimit}
          </p>
        )}
        <div className="mt-auto pt-8">
          <button
            onClick={onCtaClick}
            disabled={isLoading}
            className={`flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-accent hover:bg-accent-hover hover:shadow-xl`}
          >
            {isCustomPlan ? (
              <>
                Contact Sales <ArrowRight size={18} className="ml-2" />
              </>
            ) : isLoading ? (
              "Processing..."
            ) : (
              "Upgrade Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ApiAnalytics() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [currentPlanId] = useState("plan_pro");

  const {
    logs,
    loading: logsLoading,
    error: logsError,
  } = useSelector((state) => state.logs);
  const token = useSelector((state) => state.auth.userToken);
  const userHash = useSelector(
    (state) => state?.auth?.userInfo?.profile?.client?.[0]?.hash
  );

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token || !userHash) return;
      dispatch(setLogsLoading());
      try {
        const response = await fetch("https://salesdriver.co:8089/api/user/fetch-logs", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': userHash
          }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
          throw new Error(errorData.message || 'Failed to fetch logs');
        }
        const data = await response.json();
        dispatch(setLogsSuccess(data.logs || []));
      } catch (error) {
        dispatch(setLogsError(error.message));
        toast.error(error.message);
      }
    };
    fetchLogs();
  }, [dispatch, token, userHash]);

  const dynamicData = useMemo(() => {
    const defaultData = {
      stats: [
        { icon: BarChart2, title: "Total Requests", value: "0", change: "0%", isPositive: true },
        { icon: Cpu, title: "Avg Latency", value: "0ms", change: "0%", isPositive: true },
        { icon: Clock, title: "Uptime", value: "100%", change: "0%", isPositive: true },
        { icon: Server, title: "Errors", value: "0", change: "0%", isPositive: false },
      ],
      pieData: [],
      endpointUsage: [],
      latencyData: [
        { name: "< 50ms", requests: 0 }, { name: "50-100ms", requests: 0 },
        { name: "100-200ms", requests: 0 }, { name: "200-500ms", requests: 0 },
        { name: "> 500ms", requests: 0 },
      ],
      requestMethodsData: [],
      apiCallVolume: {
        "7d": Array(7).fill(0).map((_, i) => ({ label: `Day ${i + 1}`, value: 0 })),
        "30d": Array(30).fill(0).map((_, i) => ({ label: `Day ${i + 1}`, value: 0 })),
        "90d": Array(12).fill(0).map((_, i) => ({ label: `Week ${i + 1}`, value: 0 })),
      },
    };

    if (!logs || !userHash) {
      return defaultData;
    }

    const statusCounts = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
    const methodCounts = {};
    const pathCounts = {};

    logs.forEach((log) => {
      const status = log.status;
      if (status >= 200 && status < 300) statusCounts["2xx"]++;
      else if (status >= 300 && status < 400) statusCounts["3xx"]++;
      else if (status >= 400 && status < 500) statusCounts["4xx"]++;
      else if (status >= 500 && status < 600) statusCounts["5xx"]++;
      methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
      const pathKey = log.path.replace("/api/", "");
      pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
    });

    const totalErrors = statusCounts["4xx"] + statusCounts["5xx"];
    const uptime = logs.length > 0 ? ((logs.length - statusCounts["5xx"]) / logs.length) * 100 : 100;

    const stats = [
      {
        icon: BarChart2,
        title: "Total Requests",
        value: logs.length.toLocaleString(),
        change: `${getSeededRandom(userHash.slice(0, 5), 5, 20)}%`,
        isPositive: true,
      },
      {
        icon: Cpu,
        title: "Avg Latency",
        value: `${getSeededRandom(userHash.slice(5, 10), 80, 250)}ms`,
        change: `${getSeededRandom(userHash.slice(10, 15), 2, 10)}%`,
        isPositive: getSeededRandom(userHash.slice(15, 20), 0, 1) === 1,
      },
      {
        icon: Clock,
        title: "Uptime",
        value: `${uptime.toFixed(2)}%`,
        change: `${(getSeededRandom(userHash.slice(20, 25), 1, 10) / 100).toFixed(2)}%`,
        isPositive: true,
      },
      {
        icon: Server,
        title: "Errors",
        value: totalErrors.toLocaleString(),
        change: `${getSeededRandom(userHash.slice(25, 30), 1, 8)}%`,
        isPositive: false,
      },
    ];

    const pieData = Object.entries(statusCounts)
      .map(([key, value]) => ({
        name: `${key} ${key === "2xx" ? "Success" : "Error"}`,
        value,
        color: { "2xx": "#22c55e", "3xx": "#f59e0b", "4xx": "#f97316", "5xx": "#ef4444" }[key],
      }))
      .filter((d) => d.value > 0);

    const endpointUsage = Object.entries(pathCounts)
      .map(([path, count]) => ({ name: path, value: count }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const requestMethodsData = Object.entries(methodCounts)
      .map(([method, count]) => ({
        name: method, value: count,
        fill: { GET: "#8884d8", POST: "#82ca9d", PUT: "#ffc658", DELETE: "#ff8042" }[method] || "#a4de6c",
      })).filter((d) => d.value > 0);

    const latencyBaseDistribution = [
      getSeededRandom(userHash.slice(0, 8), 30, 50),
      getSeededRandom(userHash.slice(8, 16), 20, 40),
      getSeededRandom(userHash.slice(16, 24), 10, 20),
      getSeededRandom(userHash.slice(24, 32), 5, 10),
      getSeededRandom(userHash.slice(32, 40), 1, 5),
    ];
    const totalDist = latencyBaseDistribution.reduce((a, b) => a + b, 1);
    const latencyData = [
      { name: "< 50ms", requests: Math.round((latencyBaseDistribution[0] / totalDist) * logs.length) },
      { name: "50-100ms", requests: Math.round((latencyBaseDistribution[1] / totalDist) * logs.length) },
      { name: "100-200ms", requests: Math.round((latencyBaseDistribution[2] / totalDist) * logs.length) },
      { name: "200-500ms", requests: Math.round((latencyBaseDistribution[3] / totalDist) * logs.length) },
      { name: "> 500ms", requests: Math.round((latencyBaseDistribution[4] / totalDist) * logs.length) },
    ];
    
    const generateVolumeData = (days) => {
        const volume = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return {
                label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                jsDate: date.toISOString().split("T")[0],
                value: 0
            };
        });

        logs.forEach(log => {
            const logDateStr = new Date(log.createdAt).toISOString().split("T")[0];
            const dayEntry = volume.find(d => d.jsDate === logDateStr);
            if (dayEntry) {
                dayEntry.value++;
            }
        });
        return volume.map(({ label, value }) => ({ label, value }));
    };

    return {
        stats, pieData, endpointUsage, latencyData, requestMethodsData,
        apiCallVolume: {
            "7d": generateVolumeData(7),
            "30d": generateVolumeData(30),
            "90d": generateVolumeData(90),
        }
    };
  }, [logs, userHash]);

  const planToStripeCheckoutLinkUrl = useMemo(() => ({
      plan_pro: "https://buy.stripe.com/test_9B6cN50yGfYRbnneFZbfO04",
      plan_growth: "https://buy.stripe.com/test_aFa9AT5T06ohfDDdBVbfO05",
      plan_ultra: "https://buy.stripe.com/test_eVq3cv2GO2819ff8hBbfO06",
    }), []);

  const handlePlanSelect = async (planId) => {
    const checkoutLinkUrl = planToStripeCheckoutLinkUrl[planId];
    if (!checkoutLinkUrl || checkoutLinkUrl.startsWith("YOUR_")) {
      toast.error("Stripe Checkout Link for this plan is not configured.");
      return;
    }
    setLoadingPlanId(planId);
    try {
      if (!stripePromise) {
        toast.error("Stripe configuration is missing. Payments are disabled.");
        throw new Error("Stripe is not initialized.");
      }
      window.location.href = checkoutLinkUrl;
    } catch (error) {
      toast.error("An unexpected error occurred while redirecting to payment.");
      setLoadingPlanId(null);
    }
  };

  const handleContactClick = () => {
    navigate("/", { state: { scrollTo: "booking" } });
  };

  if (logsLoading) {
    return <DashboardLoader />;
  }

  if (logsError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-500">
          Failed to load dashboard
        </h2>
        <p className="text-muted-foreground mt-2">{logsError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="bg-accent/10 text-accent p-2 rounded-lg">
              <Database className="h-6 w-6" />
            </span>
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span>Showing data for</span>
            <span className="font-medium text-foreground">{apiData.name}</span>
            <span>•</span>
            <span className="font-mono text-sm bg-accent/10 text-accent px-2 py-0.5 rounded">
              v{apiData.version}
            </span>
          </p>
        </div>
        <StatusIndicator operational={!logsError} />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicData.stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-8">
          <ResponseCodesPieChart data={dynamicData.pieData} />
          <EndpointUsageChart data={dynamicData.endpointUsage} />
        </aside>
        <main className="flex-1 space-y-8 w-full">
          <section>
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="flex justify-between items-baseline mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-accent" />
                  API Call Volume
                </h2>
                <div className="flex gap-2">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        timeRange === range
                          ? "bg-accent/10 text-accent"
                          : "bg-card text-muted-foreground hover:bg-accent/5"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <ApiCallVolumeChart
                data={dynamicData.apiCallVolume[timeRange]}
              />
            </div>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LatencyDistributionChart data={dynamicData.latencyData} />
            <RequestMethodsChart data={dynamicData.requestMethodsData} />
          </div>
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-accent" />
                API Collections
              </h2>
              <Link to="#" className="text-sm text-accent hover:underline">
                View All
              </Link>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl divide-y divide-border">
              {collections.map((c) => (
                <CollectionRow key={c.id} collection={c} />
              ))}
            </div>
          </section>
          <section id="billing">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Layers className="h-6 w-6 text-accent" />
              Billing & Plans
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onCtaClick={() =>
                    pkg.price === "Custom"
                      ? handleContactClick()
                      : handlePlanSelect(pkg.id)
                  }
                  isLoading={loadingPlanId === pkg.id}
                  isCurrentPlan={currentPlanId === pkg.id}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}