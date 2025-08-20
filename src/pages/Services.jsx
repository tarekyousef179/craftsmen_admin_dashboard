import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import { useUsers } from "../contexts/UserContext";
import axios from "../utils/axios";
import StatCard from "../components/StatCard";
import ServicesTable from "../components/ServicesTable";
import ServiceModal from "../components/ServiceModal";
import CraftsmenChart from "../components/CraftsmenCharts";
import Swal from "sweetalert2";
import {
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaCog,
  FaWrench,
  FaChartBar,
  FaPlus,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Services() {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();
  const { users, loading: usersLoading } = useUsers();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get service name based on language
  const getServiceName = (service) => {
    if (!service) return "";

    const lang = i18n.language;
    if (lang === "ar" && service.name?.ar) {
      return service.name.ar;
    } else if (lang === "en" && service.name?.en) {
      return service.name.en;
    } else if (service.name?.en) {
      return service.name.en;
    } else if (service.name?.ar) {
      return service.name.ar;
    }
    return service.name || "";
  };

  // Helper function to get service description based on language
  const getServiceDescription = (service) => {
    if (!service) return "";

    const lang = i18n.language;
    if (lang === "ar" && service.description?.ar) {
      return service.description.ar;
    } else if (lang === "en" && service.description?.en) {
      return service.description.en;
    } else if (service.description?.en) {
      return service.description.en;
    } else if (service.description?.ar) {
      return service.description.ar;
    }
    return service.description || "";
  };
  const [serviceStats, setServiceStats] = useState({
    totalServices: 0,
    activeServices: 0,
    unusedServices: 0,
    usedServices: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [jobsChartData, setJobsChartData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  useEffect(() => {
    if (usersLoading) return;

    const fetchAndCalculate = async () => {
      setLoading(true);
      try {
        const [servicesResponse, jobsResponse] = await Promise.all([
          axios.get("/services"),
          axios.get("/jobs?page=1&limit=1000"),
        ]);

        const servicesArr = servicesResponse.data.data || [];
        console.log("Fetched services:", servicesArr);
        const jobsArr = jobsResponse.data.data.data || [];
        setServices(servicesArr);

        const serviceUsage = {};
        const craftsmen = users.filter((user) => user.role === "craftsman");
        craftsmen.forEach((craftsman) => {
          // Get service from craftsmanInfo.service
          const craftsmanService = craftsman.craftsmanInfo?.service;
          if (craftsmanService && craftsmanService.name) {
            const serviceName = getServiceName(craftsmanService);
            if (serviceName) {
              serviceUsage[serviceName] = (serviceUsage[serviceName] || 0) + 1;
            }
          }
        });

        const totalServices = servicesArr.length;
        const usedServices = Object.keys(serviceUsage).length;
        const unusedServices = totalServices - usedServices;
        const activeServices = usedServices;

        const chart = servicesArr
          .map((service) => {
            const serviceName = getServiceName(service);
            return {
              name: serviceName,
              craftsmen: serviceUsage[serviceName] || 0,
              percentage:
                craftsmen.length > 0
                  ? (
                      ((serviceUsage[serviceName] || 0) / craftsmen.length) *
                      100
                    ).toFixed(1)
                  : 0,
            };
          })
          .filter((item) => item.craftsmen > 0)
          .sort((a, b) => b.craftsmen - a.craftsmen);
        console.log("Service usage chart data:", chart);

        setServiceStats({
          totalServices,
          activeServices,
          unusedServices,
          usedServices,
        });
        setChartData(chart);

        const serviceJobCounts = {};
        jobsArr.forEach((job) => {
          if (job.service) {
            const serviceName = getServiceName(job.service);
            if (serviceName) {
              serviceJobCounts[serviceName] =
                (serviceJobCounts[serviceName] || 0) + 1;
            }
          }
        });
        console.log("Service job counts:", serviceJobCounts);

        const jobsChart = Object.entries(serviceJobCounts)
          .map(([serviceName, jobCount]) => ({
            name: serviceName,
            jobs: jobCount,
          }))
          .sort((a, b) => b.jobs - a.jobs);

        setJobsChartData(jobsChart);
      } catch (error) {
        console.error("Error fetching services:", error);
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: t("services.fetch_error"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculate();
  }, [users, usersLoading, darkMode, t]);

  const handleViewService = (service) => {
    const serviceName = getServiceName(service);
    const serviceDescription = getServiceDescription(service);
    const isArabic = i18n.language === "ar";

    // Determine the image to show - prioritize 'image' over 'icon'
    const serviceImage = service.image || service.icon;

    Swal.fire({
      title: serviceName,
      html: `
        <div class="${
          isArabic ? "text-right" : "text-left"
        }" style="direction: ${isArabic ? "rtl" : "ltr"};">
          ${
            serviceImage
              ? `
            <div class="mb-4 flex justify-center">
              <img src="${serviceImage}" alt="${serviceName}" 
                   class="w-44 h-44 object-cover rounded-lg border border-gray-200" 
                   style="max-width: 140px; max-height: 140px;" />
            </div>
          `
              : ""
          }
          <p class="mb-3"><strong>${t("services.description")}:</strong> ${
        serviceDescription || t("services.no_description")
      }</p>
          <p class="mb-2"><strong>${t(
            "services.created_at"
          )}:</strong> ${new Date(service.createdAt).toLocaleString(
        isArabic ? "ar-EG" : "en-US"
      )}</p>
          <p><strong>${t("services.updated_at")}:</strong> ${new Date(
        service.updatedAt
      ).toLocaleString(isArabic ? "ar-EG" : "en-US")}</p>
        </div>
      `,
      confirmButtonText: t("services.close"),
      background: darkMode ? "#1f2937" : "#fff",
      color: darkMode ? "#fff" : "#000",
      customClass: {
        htmlContainer: isArabic ? "swal-rtl" : "swal-ltr",
      },
    });
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleServiceSave = (savedService) => {
    if (modalMode === "create") {
      setServices((prev) => [...prev, savedService]);
    } else {
      setServices((prev) =>
        prev.map((s) => (s._id === savedService._id ? savedService : s))
      );
    }
  };

  const handleDeleteService = async (service) => {
    try {
      await axios.delete(`/services/${service._id}`);
      setServices(services.filter((s) => s._id !== service._id));
      Swal.fire({
        title: t("services.delete_success"),
        text: t("services.service_deleted"),
        icon: "success",
        confirmButtonText: t("services.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    } catch (error) {
      console.error("Error deleting service:", error);
      Swal.fire({
        title: t("error"),
        text: t("services.delete_error"),
        icon: "error",
        confirmButtonText: t("services.close"),
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });
    }
  };

  const statsCards = [
    {
      icon: <FaTools className="text-[var(--color-primary)]" />,
      label: t("services.total_services"),
      value: serviceStats.totalServices,
    },
    {
      icon: <FaCheckCircle className="text-[var(--color-success)]" />,
      label: t("services.active_services"),
      value: serviceStats.activeServices,
    },
    {
      icon: <FaTimesCircle className="text-[var(--color-destructive)]" />,
      label: t("services.unused_services"),
      value: serviceStats.unusedServices,
    },
  ];

  if (loading || usersLoading) {
    return (
      <div className="max-w-7xl mx-auto mt-8 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--color-muted-foreground)] font-semibold">
              {t("services.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold mb-4 text-[var(--color-primary)] tracking-tight drop-shadow">
            {t("services.title")}
          </h1>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCreateService}
            className="flex items-center gap-3 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-xl font-semibold shadow-lg hover:bg-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all transform hover:scale-105"
          >
            <FaPlus className="text-lg" />
            {t("services.create_service")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:justify-evenly md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatCard
            key={index}
            icon={card.icon}
            label={card.label}
            value={card.value.toLocaleString()}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              {t("services.services_usage")}
            </h2>
            <FaChartBar className="text-[var(--color-primary)] text-2xl" />
          </div>

          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-muted)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-foreground)"
                    fontSize={16}
                    fontWeight={600}
                    textAnchor="middle"
                  />
                  <YAxis
                    stroke="var(--color-foreground)"
                    fontSize={16}
                    allowDecimals={false}
                    fontWeight={600}
                    textAnchor={i18n.language === "ar" ? "start" : "end"}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                    }}
                    formatter={(value, name) => [
                      name === "craftsmen"
                        ? `${value} ${t("services.craftsmen_count")}`
                        : `${value}%`,
                      name === "craftsmen"
                        ? t("services.craftsmen_count")
                        : t("services.usage_percentage"),
                    ]}
                  />
                  <Bar
                    dataKey="craftsmen"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaCog className="text-5xl text-[var(--color-muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--color-muted-foreground)] text-base">
                  {t("services.no_services")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              {t("services.most_requested_services")}
            </h2>
            <FaChartBar className="text-[var(--color-success)] text-2xl" />
          </div>

          {jobsChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={jobsChartData}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-muted)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-foreground)"
                    fontSize={16}
                    fontWeight={600}
                    textAnchor="middle"
                    interval={0}
                  />
                  <YAxis
                    stroke="var(--color-foreground)"
                    fontSize={16}
                    allowDecimals={false}
                    fontWeight={600}
                    textAnchor={i18n.language === "ar" ? "start" : "end"}
                    label={{
                      value: t("services.job_count"),
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fill: "var(--color-foreground)",
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-foreground)",
                    }}
                    formatter={(value) => [
                      `${value} ${t("services.jobs")}`,
                      t("services.job_count"),
                    ]}
                    labelFormatter={(label) =>
                      `${t("services.service")}: ${label}`
                    }
                  />
                  <Area
                    dataKey="jobs"
                    fill="var(--color-success)"
                    radius={[4, 4, 0, 0]}
                    stroke="var(--color-success-400)"
                    strokeWidth={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FaCog className="text-5xl text-[var(--color-muted-foreground)] mx-auto mb-4" />
                <p className="text-[var(--color-muted-foreground)] text-base">
                  {t("services.no_jobs_data")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CraftsmenChart Section */}
      <div className="mb-8 w-2/3 m-auto">
        <div className="bg-[var(--color-card)]  rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-6">
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              {t("services.craftsmen_ratings")}
            </h2>
            <FaUsers className="text-[var(--color-primary)] text-2xl" />
          </div> */}
          <CraftsmenChart showingRateings={true} />
        </div>
      </div>

      <ServicesTable
        services={services}
        onView={handleViewService}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
      />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleServiceSave}
        service={selectedService}
        mode={modalMode}
      />
    </div>
  );
}
