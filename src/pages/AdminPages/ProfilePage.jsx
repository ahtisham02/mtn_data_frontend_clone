import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  User,
  Mail,
  Edit,
  Save,
  X,
  Briefcase,
  MapPin,
  FileText,
  KeyRound,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Key,
  Copy,
  Check,
} from "lucide-react";
import { updateUserProfile } from "../../auth/authSlice";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const passwordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain a lowercase letter")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirming your new password is required"),
});

const ValidationItem = ({ isValid, text }) => (
  <div
    className={`flex items-center gap-2 text-sm transition-colors ${
      isValid ? "text-green-600" : "text-slate-500"
    }`}
  >
    {isValid ? (
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
    ) : (
      <XCircle className="w-4 h-4 flex-shrink-0" />
    )}
    <span>{text}</span>
  </div>
);

const ProfileInput = ({ id, label, icon, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block mb-1 text-sm font-medium text-slate-700"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
        {icon}
      </div>
      <input
        id={id}
        name={id}
        {...props}
        className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E] disabled:bg-slate-200 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

const PasswordInput = ({ name, label, error, touched }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={name}
        className="block mb-1 text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Field
          type={showPassword ? "text" : "password"}
          id={name}
          name={name}
          className={`w-full py-2 pl-10 pr-10 border rounded-md bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E] ${
            error && touched ? "border-red-500" : "border-slate-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      <ErrorMessage
        name={name}
        component="p"
        className="mt-1 text-xs text-red-600"
      />
    </div>
  );
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.auth.userInfo);
  const token = useSelector((state) => state.auth.userToken);
  const Hash = useSelector((state) => state.auth.userInfo?.profile?.client?.[0]?.hash);

  const [userData, setUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      const initialData = {
        name: profile.name || "",
        email: profile.email || "",
        jobtitle: profile.jobtitle || "",
        location: profile.location || "",
        userBio: profile.userBio || "",
      };
      setUserData(initialData);
      setOriginalUserData(initialData);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setOriginalUserData(userData);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setUserData(originalUserData);
    setIsEditing(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(Hash);
      setCopied(true);
      toast.success("Hash copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy hash");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: userData.name,
      jobtitle: userData.jobtitle,
      location: userData.location,
      userBio: userData.userBio,
    };
    try {
      const response = await apiRequest("PUT", "/user/profile", payload, token);
      dispatch(updateUserProfile(response.data.profile));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (values, { setSubmitting, resetForm }) => {
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    };
    try {
      await apiRequest("PUT", "/user/update-password", payload, token);
      toast.success("Password updated successfully!");
      resetForm();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background text-slate-800"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.header variants={itemVariants} className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-slate-500">
          Update your personal details and manage your account security.
        </p>
      </motion.header>

      <div className="grid max-w-5xl grid-cols-1 gap-8 lg:gap-5 mx-auto lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="p-6 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="relative flex items-center justify-center w-32 h-32 mx-auto bg-[#F43F5E]/10 rounded-full ring-4 ring-white/80">
              <User className="w-16 h-16 text-[#F43F5E]" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {userData.name}
            </h2>
            <p className="text-sm text-slate-500">{userData.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 text-left space-y-3 text-sm">
              {userData.jobtitle && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Briefcase className="w-4 h-4 text-[#F43F5E]" />
                  <span>{userData.jobtitle}</span>
                </div>
              )}
              {userData.location && (
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#F43F5E]" />
                  <span>{userData.location}</span>
                </div>
              )}
              {userData.userBio && (
                <div className="flex items-start gap-3 text-slate-600">
                  <FileText className="w-4 h-4 mt-0.5 text-[#F43F5E] flex-shrink-0" />
                  <span className="leading-relaxed">{userData.userBio}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8 lg:col-span-2">
          <form
            onSubmit={handleProfileSave}
            className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Profile Information
              </h3>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#F43F5E] rounded-md hover:bg-[#E11D48] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save
                      className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`}
                    />
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#F43F5E] bg-[#F43F5E]/10 rounded-md hover:bg-[#F43F5E]/20 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProfileInput
                  id="name"
                  label="Full Name"
                  icon={<User />}
                  value={userData.name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <ProfileInput
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={<Mail />}
                  value={userData.email || ""}
                  disabled
                />
                <ProfileInput
                  id="jobtitle"
                  label="Job Title"
                  icon={<Briefcase />}
                  value={userData.jobtitle || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <ProfileInput
                  id="location"
                  label="Location"
                  icon={<MapPin />}
                  value={userData.location || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label
                  htmlFor="userBio"
                  className="block mb-1 text-sm font-medium text-slate-700"
                >
                  Bio
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    id="userBio"
                    name="userBio"
                    rows="3"
                    value={userData.userBio || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E] disabled:bg-slate-200 disabled:cursor-not-allowed"
                  ></textarea>
                </div>
              </div>
            </div>
          </form>

          <Formik
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            }}
            validationSchema={passwordSchema}
            onSubmit={handlePasswordSave}
          >
            {({ isSubmitting, values, errors, touched }) => (
              <Form className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg">
                <h3 className="mb-6 text-lg font-bold text-slate-900">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <PasswordInput
                    name="oldPassword"
                    label="Current Password"
                    error={errors.oldPassword}
                    touched={touched.oldPassword}
                  />
                  <div>
                    <PasswordInput
                      name="newPassword"
                      label="New Password"
                      error={errors.newPassword}
                      touched={touched.newPassword}
                    />
                    <div className="!mt-2 space-y-1 pl-1">
                      <ValidationItem
                        isValid={/[A-Z]/.test(values.newPassword)}
                        text="At least one uppercase letter"
                      />
                      <ValidationItem
                        isValid={/[a-z]/.test(values.newPassword)}
                        text="At least one lowercase letter"
                      />
                      <ValidationItem
                        isValid={/[0-9]/.test(values.newPassword)}
                        text="At least one number"
                      />
                    </div>
                  </div>
                  <PasswordInput
                    name="confirmNewPassword"
                    label="Confirm New Password"
                    error={errors.confirmNewPassword}
                    touched={touched.confirmNewPassword}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-6 font-semibold text-white bg-[#F43F5E] rounded-md hover:bg-[#E11D48] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Save
                    className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`}
                  />
                  {isSubmitting ? "Saving..." : "Change Password"}
                </button>
              </Form>
            )}
          </Formik>

          {Hash && (
            <motion.div variants={itemVariants} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">API Authentication Hash</h3>
                  <p className="text-sm text-slate-500">Your unique authentication token for API requests</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        X-auth-token
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12.5px] bg-white px-3 py-2 border border-slate-300 rounded-md flex-1">
                          {showHash ? Hash : "••••••••••••••••••••••••••••••••"}
                        </span>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center justify-center w-9 h-9 text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                          aria-label="Copy hash to clipboard"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setShowHash(!showHash)}
                          className="flex items-center justify-center w-9 h-9 text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                          aria-label={showHash ? "Hide hash" : "Show hash"}
                        >
                          {showHash ? <EyeOff className="w-5 h-5" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• This token is automatically included in your API requests</p>
                  <p>• Keep this token secure and do not share it with others</p>
                  <p>• You can copy this value to use in external API testing tools</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;