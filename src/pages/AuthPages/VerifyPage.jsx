import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, LoaderCircle } from "lucide-react";
import AuthLayout from "../../routes/AuthLayout";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function VerifyPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Redirecting.");
      navigate("/signup");
    } else if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      e.preventDefault();
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      await apiRequest('POST', '/auth/verify-email', { email, code });
      toast.success("Verification successful!");
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid verification code.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await apiRequest('POST', '/auth/resend-verify-email', { email });
      toast.success("A new verification code has been sent.");
      setCountdown(30);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend code.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      pageTitle="Verify Your Account"
      welcomeMessage="We've sent a 6-digit code to your email. Please enter it below."
    >
      <motion.div
        className="flex flex-col items-center justify-center w-full h-full text-center"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-accent/10"
        >
          <KeyRound className="w-10 h-10 text-accent" />
        </motion.div>
        <motion.h2 variants={itemVariants} className="mb-2 text-3xl font-bold text-card-foreground">
          Enter Verification Code
        </motion.h2>
        <motion.p variants={itemVariants} className="max-w-sm mb-6 text-muted">
          A code was sent to <strong className="text-foreground">{email || "your email"}</strong>.
        </motion.p>
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-14 text-2xl font-semibold text-center border rounded-lg shadow-sm bg-background text-foreground border-border focus:ring-2 focus:ring-accent focus:outline-none"
                disabled={loading}
                autoComplete="one-time-code"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full h-[48px] font-semibold text-white transition-all duration-300 rounded-lg bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed"
          >
            {loading ? <LoaderCircle className="w-6 h-6 animate-spin" /> : "Verify Account"}
          </button>
        </motion.form>
        <motion.div variants={itemVariants} className="w-full max-w-sm mt-6 text-center">
          <p className="text-sm text-muted">
            Didn't receive it?{" "}
            <button
              onClick={handleResendCode}
              disabled={loading || countdown > 0 || isResending}
              className="font-semibold text-accent hover:underline disabled:text-accent/70 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </button>
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="w-full max-w-sm mt-4">
          <Link
            to="/login"
            className="flex items-center justify-center w-full h-[48px] font-semibold text-accent transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}