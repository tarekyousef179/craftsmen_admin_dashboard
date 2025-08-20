import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import axios from "../utils/axios";
import { useUsers } from "../contexts/UserContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-destructive)",
  "var(--color-accent)",
  "var(--color-info)",
];

export default function OverviewCharts() {
  const { t } = useTranslation();
  const { users } = useUsers();
  const [jobsByMonth, setJobsByMonth] = useState([]);
  const [craftsmenByCategory, setCraftsmenByCategory] = useState([]);
  const usersData = users || [];
  const userGrowthMap = {};
  usersData.forEach((u) => {
    if (!u.createdAt) return;
    const month = u.createdAt.slice(0, 7);
    userGrowthMap[month] = (userGrowthMap[month] || 0) + 1;
  });

  let total = 0;
  const userGrowth = Object.entries(userGrowthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      total += count;
      return { month, users: total };
    });

  useEffect(() => {
    async function fetchData() {
      const jobsRes = await axios.get("/jobs?page=1&limit=1000");
      console.log("Jobs data:", jobsRes);
      const jobs = jobsRes.data.data.data || [];
      const jobsByMonthMap = {};
      jobs.forEach((j) => {
        if (!j.createdAt) return;
        const month = j.createdAt.slice(0, 7);
        jobsByMonthMap[month] = (jobsByMonthMap[month] || 0) + 1;
      });
      setJobsByMonth(
        Object.entries(jobsByMonthMap).map(([month, count]) => ({
          month,
          count,
        }))
      );
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRes = await axios.get(`/services?lang=${i18n.language}`);
        const categoryMap = {};
        const serviceMap = {};
        servicesRes.data.data.forEach((service) => {
          console.log("Service:", service);
          const serviceName = service.name || t("unknown");
          serviceMap[service._id] = serviceName;
        });
        console.log("Service Map:", serviceMap);
        usersData
          .filter((u) => u.role === "craftsman")
          .forEach((u) => {
            const serviceId = u.craftsmanInfo?.service?._id;
            let serviceName = t("unknown");

            if (serviceId) {
              serviceName = serviceMap[serviceId] || t("unknown");
            }

            categoryMap[serviceName] = (categoryMap[serviceName] || 0) + 1;
          });
        console.log("categoryMap", categoryMap);
        setCraftsmenByCategory(
          Object.entries(categoryMap).map(([cat, value]) => ({
            name: cat,
            value,
          }))
        );
        console.log("Services data:", servicesRes.data.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [t, i18n.language]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)]">
        <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
          {t("overview.chart_jobs_by_month")}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={jobsByMonth}>
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="var(--color-primary)"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)]">
        <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
          {t("overview.chart_user_growth")}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={userGrowth}>
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="var(--color-success)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-[var(--color-card)] rounded-xl shadow p-3 border border-[var(--color-primary-100)] md:col-span-2">
        <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
          {t("overview.chart_craftsmen_by_category")}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={craftsmenByCategory}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {craftsmenByCategory.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
