import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import StatCard from "../components/StatCard";
import OverviewCharts from "../components/OverviewCharts";
import axios from "../utils/axios";
import {
  FaUsers,
  FaUserCheck,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaSyncAlt,
  FaTimesCircle,
  FaStar,
} from "react-icons/fa";
import { useUsers } from "../contexts/UserContext";
export default function OverviewPage() {
  const { t } = useTranslation();
  const { users, loading: usersLoading } = useUsers();
  const [stats, setStats] = useState({
    totalJobs: 0,
    jobsToday: 0,
    completedJobs: 0,
    ongoingJobs: 0,
    cancelledJobs: 0,
    averageRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const totalUsers = users.length;
  const verifiedCraftsmen = users.filter(
    (u) =>
      u.role === "craftsman" &&
      u.craftsmanInfo?.verificationStatus === "verified"
  ).length;

  useEffect(() => {
    async function fetchStats() {
      try {
        // Jobs
        const jobsRes = await axios.get("/jobs?page=1&limit=1000");
        const jobs = jobsRes.data.data.data || [];
        console.log("Jobs:", jobs);
        const totalJobs = jobs.length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const jobsToday = jobs.filter((j) => {
          const jobDate = new Date(j.createdAt);
          jobDate.setHours(0, 0, 0, 0);
          console.log("Job date:", jobDate, "Today:", today);
          return jobDate.getTime() === today.getTime();
        }).length;
        console.log("Jobs today:", jobsToday);
        const completedJobs = jobs.filter(
          (j) => j.status === "Completed"
        ).length;
        const ongoingJobs = jobs.filter((j) =>
          ["Posted", "Quoted", "Hired", "On The Way"].includes(j.status)
        ).length;
        const cancelledJobs = jobs.filter((j) =>
          ["Cancelled"].includes(j.status)
        ).length;
        const allRatings = users
          .filter((u) => u.role === "craftsman" && u.rating)
          .map((u) => u.rating);
        const averageRatings = allRatings.length
          ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(
              2
            )
          : 0;
        setStats({
          totalJobs,
          jobsToday,
          completedJobs,
          ongoingJobs,
          cancelledJobs,
          averageRatings,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching stats");
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      icon: <FaUsers />,
      label: t("overview.stat_users"),
      value: totalUsers,
    },
    {
      icon: <FaUserCheck />,
      label: t("overview.stat_verified_craftsmen"),
      value: verifiedCraftsmen,
    },
    {
      icon: <FaBriefcase />,
      label: t("overview.stat_jobs"),
      value: stats.totalJobs,
    },
    {
      icon: <FaChartLine />,
      label: t("overview.stat_jobs_today"),
      value: stats.jobsToday,
    },
    {
      icon: <FaCheckCircle />,
      label: t("overview.stat_completed_jobs"),
      value: stats.completedJobs,
    },
    {
      icon: <FaSyncAlt />,
      label: t("overview.stat_ongoing_jobs"),
      value: stats.ongoingJobs,
    },
    {
      icon: <FaTimesCircle />,
      label: t("overview.stat_cancelled_jobs"),
      value: stats.cancelledJobs,
    },
    {
      icon: <FaStar />,
      label: t("overview.stat_average_ratings"),
      value: stats.averageRatings,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 ">
      <h1 className="text-4xl font-extrabold  text-center mb-6 text-[var(--color-primary)] tracking-tight">
        {t("overview.title")}
      </h1>
      {loading || usersLoading ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {statCards.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
          <OverviewCharts />
        </>
      )}
    </div>
  );
}
