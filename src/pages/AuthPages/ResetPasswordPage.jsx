import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from "formik";
import * as Yup from "yup";
import { Lock, Eye, EyeOff, Check, KeyRound, CheckCircle } from 'lucide-react';
import AuthLayout from "../../routes/AuthLayout";
import FormInput from "../../ui-components/FormInput";
import apiRequest from "../../utils/apiRequest";
import { toast } from 'react-toastify';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ThreeDotsLoader = () => {
  const loaderVariants = { animation: { transition: { staggerChildren: 0.1 } } };
  const dotVariants = { animation: { y: [0, -8, 0], transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity } } };
  return (
    <motion.div variants={loaderVariants} animate="animation" className="flex items-center justify-center gap-1" aria-label="Loading...">
      <motion.span variants={dotVariants} className="w-2 h-2 bg-white rounded-full" />
      <motion.span variants={dotVariants} className="w-2 h-2 bg-white rounded-full" />
      <motion.span variants={dotVariants} className="w-2 h-2 bg-white rounded-full" />
    </motion.div>
  );
};

const ValidationItem = ({ isValid, text }) => (
  <motion.div variants={itemVariants} className={`flex items-center gap-2 text-xs transition-colors ${isValid ? 'text-green-500' : 'text-muted'}`}>
    <Check className="w-4 h-4 flex-shrink-0" />
    <span>{text}</span>
  </motion.div>
);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      toast.error("No email found. Please start the process again.");
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      e.preventDefault();
      setOtp(paste.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain a lowercase letter')
        .matches(/[A-Z]/, 'Password must contain an uppercase letter')
        .matches(/[0-9]/, 'Password must contain a number')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const code = otp.join('');
      if (code.length !== 6) {
        toast.error("Please enter the 6-digit verification code.");
        setSubmitting(false);
        return;
      }
      try {
        await apiRequest("post", "/auth/reset-password", {
          email,
          newPassword: values.password,
          code,
        });
        toast.success("Password changed successfully!");
        setIsSuccess(true);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to reset password. The code may be invalid or expired.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isSuccess) {
    return (
      <AuthLayout pageTitle="Success!" welcomeMessage="Your password has been updated. You can now log in with your new credentials.">
        <motion.div className="flex flex-col items-center justify-center w-full h-full text-center" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
          <motion.div variants={itemVariants} className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-500/10">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <motion.h2 variants={itemVariants} className="mb-2 text-3xl font-bold text-card-foreground">
            Password Changed!
          </motion.h2>
          <motion.p variants={itemVariants} className="max-w-sm mb-8 text-muted">
            You can now use your new password to log in to your account.
          </motion.p>
          <motion.div variants={itemVariants} className="w-full">
            <Link to="/login" className="flex items-center justify-center w-full h-[48px] font-semibold text-white transition-all duration-300 rounded-lg bg-accent hover:bg-accent/90">
              Return to Login
            </Link>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout pageTitle="Reset Password" welcomeMessage="Enter the code from your email and create a new password.">
      <motion.div className="flex flex-col w-full h-full text-center" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <header>
          <motion.h2 variants={itemVariants} className="mb-2 text-3xl font-bold text-card-foreground">
            Set New Password
          </motion.h2>
          <motion.p variants={itemVariants} className="max-w-md mx-auto mb-8 text-muted">
            A 6-digit code was sent to <strong className="text-foreground">{email || "your email"}</strong>.
          </motion.p>
        </header>

        <form onSubmit={formik.handleSubmit} className="flex-grow space-y-5 text-left">
            <motion.div variants={itemVariants}>
              <label className="block mb-2 text-sm font-medium text-center text-muted">Verification Code</label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((data, index) => (
                      <input
                          key={index} type="text" maxLength="1" value={data}
                          ref={(el) => (inputRefs.current[index] = el)}
                          onChange={(e) => handleOtpChange(e.target, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onFocus={(e) => e.target.select()}
                          className="w-12 h-14 text-2xl font-semibold text-center border rounded-lg shadow-sm bg-background text-foreground border-border focus:ring-2 focus:ring-accent focus:outline-none"
                      />
                  ))}
              </div>
            </motion.div>

            <FormInput
              icon={Lock} type={showPassword ? "text" : "password"} placeholder="New Password"
              name="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
              endIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="transition-colors text-muted hover:text-accent">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
            />

            <div className="pt-1 space-y-1.5">
              <ValidationItem isValid={formik.values.password.length >= 8} text="At least 8 characters" />
              <ValidationItem isValid={/[A-Z]/.test(formik.values.password) && /[a-z]/.test(formik.values.password)} text="Uppercase & lowercase letters" />
              <ValidationItem isValid={/[0-9]/.test(formik.values.password)} text="At least one number" />
            </div>

            <FormInput
              icon={Lock} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password"
              name="confirmPassword" value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
              endIcon={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="transition-colors text-muted hover:text-accent">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="pt-[1px] text-xs text-red-500">{formik.errors.confirmPassword}</div>
            )}

            <motion.button
              type="submit" disabled={formik.isSubmitting || !formik.isValid} variants={itemVariants}
              className="flex items-center justify-center w-full h-[48px] font-semibold text-white transition-all duration-300 rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? <ThreeDotsLoader /> : <><KeyRound className="w-5 h-5 mr-2" /> Set New Password</>}
            </motion.button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}