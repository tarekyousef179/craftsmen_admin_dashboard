import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "../utils/axios";

export default function RecentActivity() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        // If you have /admin/activity-log, use it. Otherwise, mock:
        // const res = await axios.get("/admin/activity-log");
        // setActivities(res.data.data || []);
        setActivities([
          { id: 1, type: "user_registered", message: t("overview.activity_user_registered"), time: "2 min ago" },
          { id: 2, type: "job_accepted", message: t("overview.activity_job_accepted"), time: "10 min ago" },
          { id: 3, type: "craftsman_rated", message: t("overview.activity_craftsman_rated"), time: "30 min ago" },
        ]);
        setLoading(false);
      } catch {
        setActivities([]);
        setLoading(false);
      }
    }
    fetchActivities();
  }, [t]);

  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)] mb-10">
      <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">{t("overview.recent_activity")}</h3>
      {loading ? (
        <div className="text-[var(--color-muted-foreground)]">{t("loading")}</div>
      ) : activities.length === 0 ? (
        <div className="text-[var(--color-muted-foreground)]">{t("overview.no_activity")}</div>
      ) : (
        <ul className="space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] inline-block"></span>
              <span className="flex-1 text-[var(--color-foreground)]">{a.message}</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">{a.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 