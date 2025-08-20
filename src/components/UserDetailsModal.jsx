import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaStar,
  FaWallet,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBan,
  FaClock,
  FaEye,
  FaIdCard,
} from "react-icons/fa";

export default function UserDetailsModal({ isOpen, onClose, user }) {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentPortfolioIndex(0);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isCraftsman = user.role === "craftsman" && user.craftsmanInfo;
  const isRTL = i18n.language === "ar";

  // Helper functions
  const getProfileImage = () => {
    return (
      user.profilePicture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.fullName || "U"
      )}&background=random&size=200`
    );
  };

  const getStatusBadge = () => {
    if (user.isBanned) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]">
          <FaBan size={12} />
          {t("users.isBanned")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-success)] text-[var(--color-success-foreground)]">
        <FaCheckCircle size={12} />
        {t("users.active")}
      </span>
    );
  };

  const getVerificationBadge = () => {
    if (!isCraftsman || !user.craftsmanInfo.verificationStatus) return null;

    const status = user.craftsmanInfo.verificationStatus;
    const badges = {
      verified: {
        icon: <FaCheckCircle size={12} />,
        className:
          "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
        text: t("users.verified"),
      },
      pending: {
        icon: <FaClock size={12} />,
        className:
          "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
        text: t("users.pending"),
      },
      rejected: {
        icon: <FaExclamationTriangle size={12} />,
        className:
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
        text: t("users.rejected"),
      },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.className}`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const getRoleBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
        <FaUser size={12} />
        {t(`roles.${user.role}`)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const nextPortfolioImage = () => {
    if (user.craftsmanInfo?.portfolioImageUrls?.length > 0) {
      setCurrentPortfolioIndex((prev) =>
        prev === user.craftsmanInfo.portfolioImageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPortfolioImage = () => {
    if (user.craftsmanInfo?.portfolioImageUrls?.length > 0) {
      setCurrentPortfolioIndex((prev) =>
        prev === 0 ? user.craftsmanInfo.portfolioImageUrls.length - 1 : prev - 1
      );
    }
  };

  const getServiceName = (service) => {
    if (!service) return t("users.not_available");

    if (isRTL && service.name?.ar) {
      return service.name.ar;
    } else if (service.name?.en) {
      return service.name.en;
    }
    return service.name || t("users.not_available");
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-primary-100)] w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-primary-100)] flex justify-between items-center sticky top-0 bg-[var(--color-card)] z-10">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {t("users.user_details")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <div className="flex flex-col items-center">
              <img
                src={getProfileImage()}
                alt={t("users.profile_picture")}
                className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-primary)] shadow-lg"
                loading="lazy"
              />
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {getRoleBadge()}
                {getStatusBadge()}
                {getVerificationBadge()}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
                {user.fullName}
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-4">
                {t("users.createdAt")}: {formatDate(user.createdAt)}
              </p>

              {/* Rating for Craftsmen */}
              {isCraftsman && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">
                      {user.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <span className="text-[var(--color-muted-foreground)]">
                    ({user.ratingCount || 0} {t("users.reviews")})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contact Information */}
            <div className="bg-[var(--color-muted)] rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                <FaUser className="text-[var(--color-primary)]" />
                {t("users.contact_information")}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-[var(--color-primary)] w-5 h-5" />
                  <div>
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      {t("users.email")}:
                    </span>
                    <p className="font-medium">
                      {user.email || t("users.not_available")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-[var(--color-primary)] w-5 h-5" />
                  <div>
                    <span className="text-sm text-[var(--color-muted-foreground)]">
                      {t("users.phone")}:
                    </span>
                    <p className="font-medium">
                      {user.phone || t("users.not_available")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-[var(--color-muted)] rounded-xl p-6">
              <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[var(--color-primary)]" />
                {t("users.address")}
              </h4>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">{t("users.country")}:</span>{" "}
                  {user.address?.country || t("users.not_available")}
                </p>
                <p>
                  <span className="font-medium">{t("users.state")}:</span>{" "}
                  {user.address?.state || t("users.not_available")}
                </p>
                <p>
                  <span className="font-medium">{t("users.city")}:</span>{" "}
                  {user.address?.city || t("users.not_available")}
                </p>
                <p>
                  <span className="font-medium">{t("users.street")}:</span>{" "}
                  {user.address?.street || t("users.not_available")}
                </p>
              </div>
            </div>
          </div>

          {/* Craftsman-specific Information */}
          {isCraftsman && (
            <div className="space-y-6">
              {/* Service & Bio */}
              <div className="bg-[var(--color-muted)] rounded-xl p-6">
                <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                  <FaTools className="text-[var(--color-primary)]" />
                  {t("users.professional_information")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">{t("users.service")}:</span>{" "}
                      {getServiceName(user.craftsmanInfo.service)}
                    </p>
                  </div>
                  {user.craftsmanInfo.bio && (
                    <div className="md:col-span-2">
                      <p className="mb-2 font-medium">{t("users.bio")}:</p>
                      <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                        {user.craftsmanInfo.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Information */}
              {user.wallet && (
                <div className="bg-[var(--color-muted)] rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                    <FaWallet className="text-[var(--color-primary)]" />
                    {t("users.wallet")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[var(--color-card)] rounded-lg p-4">
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {t("users.balance")}
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-primary)]">
                        ${user.wallet.balance?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-[var(--color-card)] rounded-lg p-4">
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {t("users.withdrawable_balance")}
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-success)]">
                        $
                        {user.wallet.withdrawableBalance?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Gallery */}
              {user.craftsmanInfo.portfolioImageUrls &&
                user.craftsmanInfo.portfolioImageUrls.length > 0 && (
                  <div className="bg-[var(--color-muted)] rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                      <FaEye className="text-[var(--color-primary)]" />
                      {t("users.portfolio")} (
                      {user.craftsmanInfo.portfolioImageUrls.length})
                    </h4>

                    {/* Main Portfolio Image */}
                    <div className="relative h-80 w-full bg-[var(--color-background)] rounded-xl overflow-hidden mb-4">
                      <img
                        src={
                          user.craftsmanInfo.portfolioImageUrls[
                            currentPortfolioIndex
                          ]
                        }
                        alt={`Portfolio ${currentPortfolioIndex + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />

                      {user.craftsmanInfo.portfolioImageUrls.length > 1 && (
                        <>
                          <button
                            onClick={prevPortfolioImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg hover:scale-110"
                            aria-label="Previous portfolio image"
                          >
                            <FaChevronLeft size={16} />
                          </button>
                          <button
                            onClick={nextPortfolioImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg hover:scale-110"
                            aria-label="Next portfolio image"
                          >
                            <FaChevronRight size={16} />
                          </button>

                          {/* Portfolio Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {user.craftsmanInfo.portfolioImageUrls.map(
                              (_, index) => (
                                <button
                                  key={index}
                                  onClick={() =>
                                    setCurrentPortfolioIndex(index)
                                  }
                                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    index === currentPortfolioIndex
                                      ? "bg-white shadow-lg scale-125"
                                      : "bg-white/50 hover:bg-white/75 hover:scale-110"
                                  }`}
                                  aria-label={`View portfolio image ${
                                    index + 1
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Portfolio Thumbnails */}
                    {user.craftsmanInfo.portfolioImageUrls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {user.craftsmanInfo.portfolioImageUrls.map(
                          (image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPortfolioIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                index === currentPortfolioIndex
                                  ? "border-[var(--color-primary)] shadow-lg scale-105"
                                  : "border-[var(--color-primary-100)] hover:border-[var(--color-primary)] hover:scale-105"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Portfolio thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Verification Documents */}
              {user.craftsmanInfo.verificationDocs &&
                user.craftsmanInfo.verificationDocs.length > 0 && (
                  <div className="bg-[var(--color-muted)] rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                      <FaIdCard className="text-[var(--color-primary)]" />
                      {t("requests.verification_documents")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.craftsmanInfo.verificationDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="bg-[var(--color-card)] rounded-lg p-4"
                        >
                          <p className="font-medium mb-2">
                            {doc.docName || doc.docType}
                          </p>
                          <img
                            src={doc.docUrl}
                            alt={doc.docName || doc.docType}
                            className="w-full h-32 object-cover rounded-lg border border-[var(--color-primary-100)]"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* User Activity Logs */}
          {user.userLogs && (
            <div className="bg-[var(--color-muted)] rounded-xl p-6 mt-6">
              <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                <FaCalendar className="text-[var(--color-primary)]" />
                {t("users.activity")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {user.userLogs.lastLogin && (
                  <div>
                    <p className="text-[var(--color-muted-foreground)]">
                      {t("users.last_login")}:
                    </p>
                    <p className="font-medium">
                      {formatDate(user.userLogs.lastLogin)}
                    </p>
                  </div>
                )}
                {user.userLogs.lastLogout && (
                  <div>
                    <p className="text-[var(--color-muted-foreground)]">
                      {t("users.last_logout")}:
                    </p>
                    <p className="font-medium">
                      {formatDate(user.userLogs.lastLogout)}
                    </p>
                  </div>
                )}
                {user.userLogs.lastIP && (
                  <div>
                    <p className="text-[var(--color-muted-foreground)]">
                      {t("users.last_ip")}:
                    </p>
                    <p className="font-medium">{user.userLogs.lastIP}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
