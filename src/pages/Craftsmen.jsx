import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import {
  FaUsers,
  FaUserClock,
  FaUserCheck,
  FaUserTimes,
  FaUserSlash,
} from "react-icons/fa";
import axios from "../utils/axios";
import { useTranslation } from "react-i18next";
import CraftsmenTable from "../components/CraftsmenTable";
import CraftsmenCharts from "../components/CraftsmenCharts";
import PendingVerifications from "../components/PendingVerifications";
import {
  CraftsmenProvider,
  useCraftsmenContext,
} from "../contexts/CraftsmenContext";
import { useUsers } from "../contexts/UserContext";
function CraftsmenContent() {
  const { t } = useTranslation();
  const { refreshTrigger } = useCraftsmenContext();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    banned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { users } = useUsers();

  useEffect(() => {
    async function fetchStats() {
      try {
        const verifications = await axios.get("/admin/verifications");
        console.log("verifications", verifications);
        const craftsmen = users.filter((u) => u.role === "craftsman");
        setStats({
          total: craftsmen.length,
          pending: craftsmen.filter(
            (u) =>
              u.craftsmanInfo?.verificationStatus?.toLowerCase() === "pending"
          ).length,
          verified: craftsmen.filter(
            (u) =>
              u.craftsmanInfo?.verificationStatus?.toLowerCase() === "verified"
          ).length,
          rejected: craftsmen.filter(
            (u) =>
              u.craftsmanInfo?.verificationStatus?.toLowerCase() === "rejected"
          ).length,
          banned: craftsmen.filter((u) => u.isBanned).length,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching stats");
        setLoading(false);
      }
    }
    fetchStats();
  }, [refreshTrigger]);

  const statCards = [
    {
      icon: <FaUsers />,
      label: t("craftsmen.total_craftsmen"),
      value: stats.total,
    },
    {
      icon: <FaUserClock />,
      label: t("craftsmen.pending_verification"),
      value: stats.pending,
    },
    {
      icon: <FaUserCheck />,
      label: t("craftsmen.verified_craftsmen"),
      value: stats.verified,
    },
    {
      icon: <FaUserTimes />,
      label: t("craftsmen.rejected_craftsmen"),
      value: stats.rejected,
    },
    {
      icon: <FaUserSlash />,
      label: t("craftsmen.banned_craftsmen"),
      value: stats.banned,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4 ">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-[var(--color-primary)] tracking-tight">
        {t("craftsmen.management_title", "Craftsmen Management")}
      </h1>
      {loading ? (
        <div className="max-w-7xl mx-auto mt-8 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--color-muted-foreground)] font-semibold">
                {t("loading")}
              </p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-[var(--color-destructive)]">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
          {statCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      )}
      <PendingVerifications />
      <CraftsmenCharts />
      <CraftsmenTable />
    </div>
  );
}

export default function Craftsmen() {
  return (
    <CraftsmenProvider>
      <CraftsmenContent />
    </CraftsmenProvider>
  );
}
