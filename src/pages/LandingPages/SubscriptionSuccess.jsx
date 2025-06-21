import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../utils/apiRequest";
import { useSelector, useDispatch } from "react-redux";
import { setCredits } from "../../auth/creditsSlice";

export default function SubscriptionSuccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading");
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [processed, setProcessed] = useState(false);
  const VITE_STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;
  const token = useSelector((state) => state.auth.userToken);
  const Hash = useSelector(
    (state) => state?.auth?.userInfo?.profile?.client?.[0]?.hash
  );

  useEffect(() => {
    if (processed) return;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const recordPaymentAndFetchCredits = async () => {
      try {
        const stripeResponse = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${VITE_STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (!stripeResponse.ok)
          throw new Error("Failed to fetch Stripe session");

        const stripeData = await stripeResponse.json();

        const apiResponse = await apiRequest(
          "post",
          "/user/subscription/callback",
          {
            price: stripeData.amount_total / 100,
            payload: stripeData,
          },
          token,
          {
            "x-auth-token": Hash,
          }
        );

        setSubscriptionDetails(apiResponse.data);
        setStatus("success");
        toast.success("Payment recorded successfully!");

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
          dispatch(setCredits(creditsResponse.data));
          toast.info("Your credits have been updated.");
        } catch (creditsError) {
          console.error("Failed to fetch credits:", creditsError);
          toast.error("Could not update credits automatically.");
        }
      } catch (error) {
        console.error("Recording failed:", error);
        setStatus("error");
        toast.error(
          error.response?.data?.message || "Payment recording failed"
        );
      } finally {
        searchParams.delete("session_id");
        setSearchParams(searchParams, { replace: true });
        setProcessed(true);
      }
    };

    recordPaymentAndFetchCredits();
  }, [
    searchParams,
    setSearchParams,
    processed,
    VITE_STRIPE_SECRET_KEY,
    token,
    Hash,
    dispatch,
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full">
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-accent mx-auto animate-spin mb-4" />
            <h1 className="text-2xl font-semibold">
              Processing your payment...
            </h1>
          </>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-green-500">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for subscribing to our service
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-red-500">
              Payment Failed
            </h1>
            <p className="text-muted mt-2">
              Please try again or contact support.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
            >
              Back to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
}