import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import axios from "../utils/axios";
import Swal from "sweetalert2";

export default function CreateAdminModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("users.full_name_required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("users.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("users.email_invalid");
    }

    if (!formData.password.trim()) {
      newErrors.password = t("users.password_required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("users.password_min_length");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("/admin/users/create-admin", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
      });

      // Success notification
      await Swal.fire({
        icon: "success",
        title: t("users.admin_created_success"),
        text: `${formData.fullName} has been created as ${formData.role}`,
        confirmButtonText: "OK",
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
        confirmButtonColor: darkMode ? "#22c55e" : "#22c55e",
      });

      // Reset form and close modal
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      });
      setErrors({});
      onClose();
      onSuccess(); // Refresh the users list
    } catch (error) {
      console.error("Error creating admin:", error);

      const errorMessage =
        error.response?.data?.message || t("users.admin_creation_failed");

      await Swal.fire({
        icon: "error",
        title: t("error"),
        text: errorMessage,
        confirmButtonText: "OK",
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-primary-100)] w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-primary-100)]">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] text-center">
            {t("users.create_admin_title")}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("users.full_name")} *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                errors.fullName
                  ? "border-[var(--color-destructive)]"
                  : "border-[var(--color-primary-100)]"
              }`}
              placeholder={t("users.full_name")}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("users.email")} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                errors.email
                  ? "border-[var(--color-destructive)]"
                  : "border-[var(--color-primary-100)]"
              }`}
              placeholder={t("users.email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("users.phone")}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
              placeholder={t("users.phone")}
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("users.password")} *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                errors.password
                  ? "border-[var(--color-destructive)]"
                  : "border-[var(--color-primary-100)]"
              }`}
              placeholder={t("users.password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("users.role")} *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors"
              disabled={isLoading}
            >
              <option value="admin">{t("roles.admin")}</option>
              <option value="moderator">{t("roles.moderator")}</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-primary-100)] flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("users.cancel")}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] active:bg-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? t("users.creating_admin") : t("users.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
