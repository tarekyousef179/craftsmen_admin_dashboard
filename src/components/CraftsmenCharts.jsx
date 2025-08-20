import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "../utils/axios";
import { useCraftsmenContext } from "../contexts/CraftsmenContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-destructive)",
  "var(--color-accent)",
  "var(--color-info)",
];

function TopCitiesChart({ data, t }) {
  const { i18n } = useTranslation();
  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-primary)]">
        {t("craftsmen.chart_top_cities", "Top Cities by Craftsmen Count")}
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis
            type="number"
            stroke="var(--color-muted-foreground)"
            allowDecimals={false}
            fontSize={16}
            fontWeight={600}
          />
          <YAxis
            dataKey="city"
            type="category"
            stroke="var(--color-muted-foreground)"
            width={100}
            fontSize={16}
            fontWeight={600}
            textAnchor={i18n.language === "ar" ? "start" : "end"}
          />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="var(--color-primary)"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VerificationPieChart({ data, t }) {
  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)]">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-primary)]">
        {t(
          "craftsmen.chart_verification_distribution",
          "Verification Status Distribution"
        )}
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function RatingsByServiceChart({ data, t }) {
  const { i18n } = useTranslation();
  return (
    <div className="bg-[var(--color-card)] rounded-xl shadow p-6 border border-[var(--color-primary-100)]">
      <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
        {t(
          "craftsmen.chart_avg_ratings_by_service",
          "Average Ratings by Service Type"
        )}
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="service"
            stroke="var(--color-muted-foreground)"
            fontSize={16}
            fontWeight={600}
            textAnchor="middle"
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            domain={[0, 5]}
            fontSize={16}
            allowDecimals={true}
            fontWeight={600}
            textAnchor={i18n.language === "ar" ? "start" : "end"}
          />
          <Tooltip />
          <Bar
            dataKey="avgRating"
            maxBarSize={40}
            fill="var(--color-success)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CraftsmenCharts({ showingRateings = false }) {
  const { t } = useTranslation();
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCraftsmen() {
      try {
        const { data } = await axios.get("/admin/users?page=1&limit=1000");
        setCraftsmen(
          (data.data.data || []).filter((u) => u.role === "craftsman")
        );
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    fetchCraftsmen();
  }, []);

  const topCities = React.useMemo(() => {
    const map = {};
    craftsmen.forEach((u) => {
      const city = u.address?.city?.toLowerCase() || t("unknown");
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [craftsmen, t]);

  const verificationDist = React.useMemo(() => {
    const map = {};
    craftsmen.forEach((u) => {
      const status = (
        u.craftsmanInfo?.verificationStatus || t("pending")
      ).toLowerCase();
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({
      status: t(status),
      value,
    }));
  }, [craftsmen, t]);

  const ratingsByService = React.useMemo(() => {
    const map = {};
    craftsmen.forEach((u) => {
      // Get service from craftsmanInfo.service instead of skills
      const craftsmanService = u.craftsmanInfo?.service;
      if (craftsmanService && craftsmanService.name) {
        // Use helper function to get service name in correct language
        const getServiceName = (service) => {
          if (!service) return "";
          const lang = "en"; // Default to English for charts, you can use i18n.language if available
          if (service.name?.en) {
            return service.name.en;
          } else if (service.name?.ar) {
            return service.name.ar;
          }
          return service.name || "";
        };

        const serviceName = getServiceName(craftsmanService);
        if (serviceName) {
          if (!map[serviceName]) map[serviceName] = { total: 0, count: 0 };
          if (typeof u.rating === "number") {
            map[serviceName].total += u.rating;
            map[serviceName].count += 1;
          }
        }
      }
    });
    console.log("Ratings by Service Map:", map);
    return Object.entries(map).map(([service, { total, count }]) => ({
      service,
      avgRating: count ? (total / count).toFixed(2) : 0,
    }));
  }, [craftsmen]);

  if (loading) {
    return (
      <div className="text-center text-[var(--color-muted-foreground)] mb-10">
        {t("loading")}
      </div>
    );
  }

  return showingRateings ? (
    <div className="md:col-span-2">
      <RatingsByServiceChart data={ratingsByService} t={t} />
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <TopCitiesChart data={topCities} t={t} />
      <VerificationPieChart data={verificationDist} t={t} />
    </div>
  );
}
