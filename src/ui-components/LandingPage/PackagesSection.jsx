import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Rocket,
  Building2,
} from "lucide-react";
import { Link as ScrollLink } from "react-scroll";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const packages = [
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: "Custom",
    icon: <Building2 className="w-7 h-7 text-accent" />,
    details: ["Custom Volume & Support"],
    features: [
      { text: "Unlimited API access", included: true },
      { text: "Access to all AI tools", included: true },
      {
        text: "Full suite of professional, job, and org endpoints",
        included: true,
      },
      { text: "Bulk & high-throughput capabilities", included: true },
      { text: "Developer support via chat & email", included: true },
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    price: 49,
    icon: <Zap className="w-7 h-7 text-accent" />,
    details: ["20,000 Credits"],
    features: [
      { text: "LinkedIn Profile Data", included: true },
      { text: "LinkedIn Jobs Data", included: true },
      { text: "LinkedIn Company Data", included: true },
      { text: "Bulk Processing", included: true },
      { text: "Sales Navigator Search", included: false },
      { text: "AI-Powered Endpoints", included: false },
    ],
    rateLimit: "Rate Limit: 20 requests/minute",
  },
  {
    id: "plan_growth",
    name: "Growth",
    price: 99,
    icon: <TrendingUp className="w-7 h-7 text-accent" />,
    details: ["100,000 Credits"],
    features: [
      { text: "All Pro Features", included: true },
      { text: "Premium Company Insights", included: true },
      { text: "Sales Navigator Search", included: true },
      { text: "AI-Powered Endpoints", included: false },
    ],
    rateLimit: "Rate Limit: 35 requests/minute",
  },
  {
    id: "plan_ultra",
    name: "Ultra",
    price: 199,
    icon: <Rocket className="w-7 h-7 text-accent" />,
    details: ["350,000 Credits"],
    features: [
      { text: "All Growth Features", included: true },
      { text: "AI-Powered Endpoints", included: true },
      { text: "Priority Support", included: true },
    ],
    rateLimit: "Rate Limit: 50 requests/minute",
  },
];

const PackageCard = ({ pkg, onCtaClick, isLoading }) => {
  const isCustomPlan = pkg.price === "Custom";
  return (
    <div className="flex flex-col h-full p-8 transition-all duration-300 bg-white border rounded-2xl border-border hover:shadow-2xl hover:-translate-y-2">
      <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-accent/10">
        {pkg.icon}
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
          {isCustomPlan ? (
            <ScrollLink
              to="booking"
              spy={true}
              smooth={true}
              offset={-70}
              duration={800}
              className="cursor-pointer"
            >
              <button className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-accent hover:bg-accent-hover hover:shadow-xl">
                Contact Sales <ArrowRight size={18} />
              </button>
            </ScrollLink>
          ) : (
            <button
              onClick={onCtaClick}
              disabled={isLoading}
              className={`flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-accent hover:bg-accent-hover hover:shadow-xl`}
            >
              {isLoading ? "Processing..." : "Get Started"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PackagesSection = () => {
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const userToken = useSelector((state) => state?.auth?.userToken);
  const navigate = useNavigate();

  const planToStripeCheckoutLinkUrl = useMemo(
    () => ({
      plan_pro: "https://buy.stripe.com/test_9B6cN50yGfYRbnneFZbfO04",
      plan_growth: "https://buy.stripe.com/test_aFa9AT5T06ohfDDdBVbfO05",
      plan_ultra: "https://buy.stripe.com/test_eVq3cv2GO2819ff8hBbfO06",
    }),
    []
  );

  const handlePlanSelect = async (planId) => {
    if (planId === "plan_enterprise") return;

    if (!userToken) {
      navigate("/login");
      return;
    }

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

  return (
    <section id="packages" className="py-16 bg-background md:py-24">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-bold tracking-wider uppercase text-accent">
            All-Inclusive Value
          </p>
          <h2 className="mt-2 text-4xl font-bold text-foreground md:text-5xl">
            Simple Pricing,
            <span className="relative inline-block ml-3">
              <span className="absolute md:top-9 top-8 w-full h-3 bg-accent/20"></span>
              <span className="relative">Full Access</span>
            </span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-muted">
            One flat rate. Unlimited potential.{" "}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-16 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onCtaClick={() => handlePlanSelect(pkg.id)}
              isLoading={loadingPlanId === pkg.id}
            />
          ))}
        </div>
        <div className="flex justify-center mt-16">
          <ScrollLink
            to="booking"
            spy={true}
            smooth={true}
            offset={-70}
            duration={800}
            className="cursor-pointer"
          >
            <button className="inline-flex flex-col items-center px-8 py-3 font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-accent to-accent-hover hover:shadow-xl hover:-translate-y-0.5">
              <span className="flex leading-tight md:leading-normal items-center text-lg">
                Subscribe in Minutes. Cancel Anytime{" "}
              </span>
              <span className="text-[14px] font-normal pt-1 md:pt-0 tracking-wider uppercase">
                Start Now{" "}
              </span>
            </button>
          </ScrollLink>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
