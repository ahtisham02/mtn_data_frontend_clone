import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
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
} from "lucide-react";
import { updateUserProfile } from "../../auth/authSlice";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.auth.userInfo);
  const state = useSelector((state) => state);
  console.log(state);

  const [userData, setUserData] = useState({});
  const [originalUserData, setOriginalUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const initialData = {
        name: profile.name || "",
        email: profile.email || "",
        jobTitle: profile.jobTitle || "",
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: userData.name,
      jobTitle: userData.jobTitle,
      location: userData.location,
      userBio: userData.userBio,
    };
    try {
      const response = await apiRequest("PUT", "/user/profile", payload, null, {
        "x-auth-token":
          "f13f0d5186dfe0cbff990639b640662768bb0ebcc64a08fabc752427d5ad62b8",
      });
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

  const handlePasswordResetInfo = () => {
    toast(
      'To reset your password, please log out and use the "Forgot Password" link on the login page.',
      {
        icon: "ℹ️",
        duration: 5000,
      }
    );
  };

  return (
    <motion.div
      className="min-h-screen p-4 bg-background text-slate-800"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.header variants={itemVariants} className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage your profile information and password.
        </p>
      </motion.header>

      <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="p-6 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-32 h-32 mx-auto bg-[#F43F5E]/10 rounded-full ring-4 ring-[#F43F5E]/30">
              <User className="w-16 h-16 text-[#F43F5E]" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {userData.name}
            </h2>
            <p className="text-sm text-slate-500">{userData.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 text-left space-y-2 text-sm">
              {userData.jobTitle && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4 text-[#F43F5E]" />
                  <span>{userData.jobTitle}</span>
                </div>
              )}
              {userData.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-[#F43F5E]" />
                  <span>{userData.location}</span>
                </div>
              )}
              {userData.userBio && (
                <div className="flex items-start gap-2 text-slate-600">
                  <FileText className="w-4 h-4 mt-0.5 text-[#F43F5E] flex-shrink-0" />
                  <span>{userData.userBio}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8 lg:col-span-2">
          <form
            onSubmit={handleProfileSave}
            className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm"
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
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-[#F43F5E] rounded-md hover:bg-[#E11D48] transition-colors disabled:opacity-70"
                  >
                    <Save className="w-4 h-4" />{" "}
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
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1 text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userData.name || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1 text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userData.email || ""}
                      disabled
                      className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="jobTitle"
                    className="block mb-1 text-sm font-medium text-slate-700"
                  >
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={userData.jobTitle || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="block mb-1 text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={userData.location || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E]"
                    />
                  </div>
                </div>
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
                    className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-md bg-slate-50 disabled:bg-slate-200 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#F43F5E] focus:border-[#F43F5E]"
                  ></textarea>
                </div>
              </div>
            </div>
          </form>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Change Password
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              To change your password, you must log out and use the "Forgot
              Password" feature.
            </p>
            <button
              onClick={handlePasswordResetInfo}
              className="w-full px-4 py-2 font-semibold text-white bg-[#F43F5E] rounded-md hover:bg-[#E11D48] transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Reset Password
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
