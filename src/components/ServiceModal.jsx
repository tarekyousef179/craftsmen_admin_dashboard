import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import { FaTimes, FaUpload, FaImage, FaTrash } from "react-icons/fa";
import axios from "../utils/axios";
import Swal from "sweetalert2";

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service = null, // null for create, service object for edit
  mode = "create", // "create" or "edit"
}) {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: {
      en: "",
      ar: "",
    },
    description: {
      en: "",
      ar: "",
    },
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or service changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && service) {
        setFormData({
          name: {
            en: service.name?.en || "",
            ar: service.name?.ar || "",
          },
          description: {
            en: service.description?.en || "",
            ar: service.description?.ar || "",
          },
          image: null,
        });
        // If service has an existing image URL, set it as preview
        if (service.image && typeof service.image === "string") {
          setPreviewImage(service.image);
        }
      } else {
        // Reset form for create mode
        setFormData({
          name: {
            en: "",
            ar: "",
          },
          description: {
            en: "",
            ar: "",
          },
          image: null,
        });
        setPreviewImage(null);
      }
      setErrors({});
    }
  }, [isOpen, mode, service]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [field, lang] = name.split(".");

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          icon: t("services.invalid_image_type"),
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          icon: t("services.image_too_large"),
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setPreviewImage(null);
    // Reset file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.en.trim() && !formData.name.ar.trim()) {
      newErrors.name = t("services.name_required");
    }

    if (!formData.description.en.trim() && !formData.description.ar.trim()) {
      newErrors.description = t("services.description_required");
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
      const submitData = new FormData();
      submitData.append("nameEn", formData.name.en.trim());
      submitData.append("nameAr", formData.name.ar.trim());
      submitData.append("descriptionEn", formData.description.en.trim());
      submitData.append("descriptionAr", formData.description.ar.trim());

      // Only append image if a new file was selected
      if (formData.image instanceof File) {
        submitData.append("image", formData.image);
      }

      let response;
      if (mode === "edit" && service) {
        response = await axios.put(`/services/${service._id}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post("/services", submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      onSave(response.data.data || response.data);
      onClose();

      Swal.fire({
        title: t("services.success"),
        text:
          mode === "edit"
            ? t("services.service_updated_successfully")
            : t("services.service_created_successfully"),
        icon: "success",
        confirmButtonText: t("services.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    } catch (error) {
      console.error("Error saving service:", error);

      let errorMessage =
        mode === "edit"
          ? t("services.update_error")
          : t("services.create_error");

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Swal.fire({
        title: t("error"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("services.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-1000 p-4">
      <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-primary-100)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-primary-100)]">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
            {mode === "edit"
              ? t("services.edit_service")
              : t("services.create_service")}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Name */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("services.service_name")} *
            </label>

            {/* English Name */}
            <div>
              <label
                htmlFor="name.en"
                className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1"
              >
                {t("services.english_name")}
              </label>
              <input
                type="text"
                id="name.en"
                name="name.en"
                value={formData.name.en}
                onChange={handleInputChange}
                placeholder={t("services.enter_english_name")}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                  errors.name
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
              />
            </div>

            {/* Arabic Name */}
            <div>
              <label
                htmlFor="name.ar"
                className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1"
              >
                {t("services.arabic_name")}
              </label>
              <input
                type="text"
                id="name.ar"
                name="name.ar"
                value={formData.name.ar}
                onChange={handleInputChange}
                placeholder={t("services.enter_arabic_name")}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
                  errors.name
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {errors.name && (
              <p className="mt-1 text-sm text-[var(--color-destructive)]">
                {errors.name}
              </p>
            )}
          </div>

          {/* Service Description */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("services.service_description")} *
            </label>

            {/* English Description */}
            <div>
              <label
                htmlFor="description.en"
                className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1"
              >
                {t("services.english_description")}
              </label>
              <textarea
                id="description.en"
                name="description.en"
                value={formData.description.en}
                onChange={handleInputChange}
                placeholder={t("services.enter_english_description")}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors resize-vertical ${
                  errors.description
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
              />
            </div>

            {/* Arabic Description */}
            <div>
              <label
                htmlFor="description.ar"
                className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1"
              >
                {t("services.arabic_description")}
              </label>
              <textarea
                id="description.ar"
                name="description.ar"
                value={formData.description.ar}
                onChange={handleInputChange}
                placeholder={t("services.enter_arabic_description")}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors resize-vertical ${
                  errors.description
                    ? "border-[var(--color-destructive)]"
                    : "border-[var(--color-primary-100)]"
                }`}
                disabled={isLoading}
                dir="rtl"
              />
            </div>

            {errors.description && (
              <p className="mt-1 text-sm text-[var(--color-destructive)]">
                {errors.description}
              </p>
            )}
          </div>

          {/* Service Image */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              {t("services.service_image")}
            </label>

            {/* Upload Area */}
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    errors.image
                      ? "border-[var(--color-destructive)] bg-red-50"
                      : "border-[var(--color-primary-100)] bg-[var(--color-muted)] hover:bg-[var(--color-primary-100)]"
                  } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-[var(--color-muted-foreground)]" />
                    <p className="mb-2 text-sm text-[var(--color-muted-foreground)]">
                      <span className="font-semibold">
                        {t("services.click_to_upload")}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {t("services.supported_formats")}
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="Service image preview"
                    className="w-24 h-24 object-cover rounded-lg border border-[var(--color-primary-100)]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="absolute -top-2 -right-2 p-1 bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              )}

              {errors.image && (
                <p className="text-sm text-[var(--color-destructive)]">
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-primary-100)]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg font-semibold bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] transition-colors disabled:opacity-50"
            >
              {t("services.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {mode === "edit"
                ? t("services.update_service")
                : t("services.create_service")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
