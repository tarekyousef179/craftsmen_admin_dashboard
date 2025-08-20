import React from "react";
import { FaLock, FaUnlock, FaEye } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function UserActionIcons({ user, onBlock, onView }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-2 items-center whitespace-nowrap">
      <button
        onClick={() => onBlock(user)}
        aria-label={user.isBanned ? t("users.unblock") : t("users.block")}
        title={user.isBanned ? t("users.unblock") : t("users.block")}
        className="p-2 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
      >
        {user.isBanned ? <FaUnlock /> : <FaLock />}
      </button>
      <button
        onClick={() => onView(user)}
        aria-label={t("users.view_details")}
        title={t("users.view_details")}
        className="p-2 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-primary-100)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
      >
        <FaEye />
      </button>
    </div>
  );
} 