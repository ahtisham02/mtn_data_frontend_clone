import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../../utils/apiRequest";

export default function SubscriptionSuccess() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const recordPayment = async () => {
      try {
        // Get session info from your Vercel serverless function
        const stripeResponse = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        const stripeData = await stripeResponse.json();

        if (!stripeResponse.ok) throw new Error(stripeData.error?.message || "Stripe session fetch failed");

        // Send data to your backend to record the subscription
        const apiResponse = await apiRequest(
          "post",
          "/user/subscription/callback",
          {
            price: stripeData.amount_total / 100,
            payload: stripeData
          },
          null,
          {
            "x-auth-token": "f13f0d5186dfe0cbff990639b640662768bb0ebcc64a08fabc752427d5ad62b8",
          }
        );

        setSubscriptionDetails(apiResponse.data);
        setStatus("success");
        toast.success("Payment recorded successfully!");
      } catch (error) {
        console.error("Payment recording failed:", error);
        setStatus("error");
        toast.error(
          error?.response?.data?.message || error?.message || "Payment recording failed"
        );
      } finally {
        // Clean URL and prevent re-processing
        searchParams.delete("session_id");
        setSearchParams(searchParams, { replace: true });
        setProcessed(true);
      }
    };

    recordPayment();
  }, [searchParams, setSearchParams, processed, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full">
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-accent mx-auto animate-spin mb-4" />
            <h1 className="text-2xl font-semibold">Processing your payment...</h1>
          </>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-green-500">Payment Successful!</h1>
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
            <h1 className="text-2xl font-semibold text-red-500">Payment Failed</h1>
            <p className="text-muted mt-2">Please try again or contact support.</p>
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
