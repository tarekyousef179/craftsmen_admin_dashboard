import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaUpload,
  FaTrash,
} from "react-icons/fa";
import axios from "../utils/axios";
import Swal from "sweetalert2";

export default function Profile() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const { user, login } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: null,
  });
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.fullName.split(" ")[0] || "",
        lastName: user.fullName.split(" ")[1] || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || null,
      });
      setPreviewImage(user.profilePicture || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: t("profile.invalid_image_type"),
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: t("profile.image_too_large"),
        }));
        return;
      }

      setNewProfilePicture(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      if (errors.profilePicture) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "",
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setNewProfilePicture(null);
    setPreviewImage(profileData.profilePicture);
    // Reset file input
    const fileInput = document.getElementById("profile-picture-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = t("profile.first_name_required");
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = t("profile.last_name_required");
    }

    if (!profileData.email.trim()) {
      newErrors.email = t("profile.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = t("profile.email_invalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "fullName",
        profileData.firstName.trim() + " " + profileData.lastName.trim()
      );
      formData.append("email", profileData.email.trim());
      if (profileData.phone) {
        formData.append("phone", profileData.phone.trim());
      }

      if (newProfilePicture instanceof File) {
        formData.append("profilePicture", newProfilePicture);
      }

      const response = await axios.patch("/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.data || response.data;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(localStorage.getItem("token"), updatedUser);

      setIsEditing(false);
      setNewProfilePicture(null);

      Swal.fire({
        title: t("profile.success"),
        text: t("profile.profile_updated_successfully"),
        icon: "success",
        confirmButtonText: t("profile.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    } catch (error) {
      console.error("Error updating profile:", error);

      let errorMessage = t("profile.update_error");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        title: t("error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("profile.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user.fullName.split(" ")[0] || "",
      lastName: user.fullName.split(" ")[1] || "",
      email: user.email || "",
      phone: user.phone || "",
      profilePicture: user.profilePicture || null,
    });
    setPreviewImage(user.profilePicture || null);
    setNewProfilePicture(null);
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaUser className="text-6xl text-[var(--color-muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--color-muted-foreground)]">
            {t("profile.no_user_data")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      {/* Header */}
      <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <FaUser className="text-[var(--color-primary)] text-3xl" />
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                {t("profile.title")}
              </h1>
              <p className="text-[var(--color-muted-foreground)]">
                {t("profile.subtitle")}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg font-semibold hover:bg-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
            >
              <FaEdit />
              {t("profile.edit_profile")}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary-100)] bg-[var(--color-muted)]">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-4xl text-[var(--color-muted-foreground)]" />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  id="profile-picture-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="flex items-center justify-center w-10 h-10 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-full cursor-pointer hover:bg-[var(--color-primary-400)] transition-colors"
                >
                  <FaUpload className="text-sm" />
                </label>
              </div>
            )}
          </div>

          {isEditing && newProfilePicture && (
            <button
              onClick={handleRemoveImage}
              disabled={isLoading}
              className="mt-2 text-sm text-[var(--color-destructive)] hover:underline"
            >
              {t("profile.remove_image")}
            </button>
          )}

          {errors.profilePicture && (
            <p className="mt-2 text-sm text-[var(--color-destructive)]">
              {errors.profilePicture}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("profile.first_name")} *
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                  errors.firstName
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
              />
            ) : (
              <p className="px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg">
                {profileData.firstName || t("profile.not_provided")}
              </p>
            )}
            {errors.firstName && (
              <p className="mt-1 text-sm text-[var(--color-destructive)]">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("profile.last_name")} *
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                  errors.lastName
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
              />
            ) : (
              <p className="px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg">
                {profileData.lastName || t("profile.not_provided")}
              </p>
            )}
            {errors.lastName && (
              <p className="mt-1 text-sm text-[var(--color-destructive)]">
                {errors.lastName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("profile.email")} *
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                  errors.email
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
              />
            ) : (
              <p className="px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg">
                {profileData.email || t("profile.not_provided")}
              </p>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-[var(--color-destructive)]">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("profile.phone")}
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--color-primary-100)] rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
                disabled={isLoading}
              />
            ) : (
              <p className="px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg">
                {profileData.phone || t("profile.not_provided")}
              </p>
            )}
          </div>

          {/* Role (Read-only) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("profile.role")}
            </label>
            <p className="px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-lg">
              {t(`roles.${user.role?.toLowerCase()}`)}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[var(--color-primary-100)]">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaTimes />
              {t("profile.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FaSave />
              {isLoading ? t("profile.saving") : t("profile.save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
