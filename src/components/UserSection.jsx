import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import axios from "../utils/axios";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/themeContext";

export default function UserSection({ open = true }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: t("user_section.confirm_logout"),
      text: t("user_section.logout_message"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--color-destructive)",
      cancelButtonColor: "var(--color-muted)",
      confirmButtonText: t("user_section.logout"),
      cancelButtonText: t("user_section.cancel"),
      background: darkMode ? "#1f2937" : "#fff",
      color: darkMode ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      try {
        await axios.post("/auth/logout");
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        logout();
      }
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className={`border-t border-[var(--color-primary-100)] mt-4 transition-all duration-300 ${
        open ? "p-4" : "p-2"
      }`}
    >
      <div className="w-full h-px bg-[var(--color-primary-100)] mb-4"></div>

      {open ? (
        <>
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[var(--color-primary-100)] bg-[var(--color-muted)]">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-2xl text-[var(--color-muted-foreground)]" />
                </div>
              )}
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-foreground)] leading-tight max-w-full">
              {user.fullName || user.email}
            </h3>

            <p className="text-xs text-[var(--color-muted-foreground)] capitalize leading-tight">
              {t(`roles.${user.role?.toLowerCase()}`)}
            </p>
          </div>

          <div
            className={`flex gap-2 ${
              i18n.language === "ar" && "justify-center"
            }`}
          >
            <button
              onClick={handleProfileClick}
              className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg text-sm font-medium hover:bg-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
              title={t("user_section.profile")}
            >
              <FaUserCircle className="text-sm" />
              <span>{t("user_section.profile")}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] rounded-lg text-sm font-medium hover:bg-red-600 focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
              title={t("user_section.logout")}
            >
              <FaSignOutAlt className="text-sm" />
              <span>{t("user_section.logout")}</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-primary-100)] bg-[var(--color-muted)] cursor-pointer hover:border-[var(--color-primary)] transition-colors"
            onClick={handleProfileClick}
            title={
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email
            }
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="text-sm text-[var(--color-muted-foreground)]" />
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-6 h-6 flex items-center justify-center bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] rounded-full text-xs hover:bg-red-600 focus:ring-1 focus:ring-[var(--color-ring)] transition-all"
            title={t("user_section.logout")}
          >
            <FaSignOutAlt className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
