import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import axios from "../utils/axios";
import StatCard from "../components/StatCard";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload, FaEye } from "react-icons/fa";
import JobDetailsModal from "../components/JobDetailsModal";
import {
  FaBriefcase,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarDay,
} from "react-icons/fa";
import { useUsers } from "../contexts/UserContext";

export default function Orders() {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();

  const [stats, setStats] = useState({
    totalJobs: 0,
    jobsInProgress: 0,
    jobsAwaitingOffers: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    disputedJobs: 0,
    jobsCreatedToday: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const UserDisplay = ({ userId, fallback = t("requests.unknown") }) => {
    const { getUserById, loading } = useUsers();
    const user = getUserById(userId);
    if (loading) {
      return (
        <span className="text-[var(--color-muted-foreground)]">Loading...</span>
      );
    }
    if (!user) {
      return (
        <span className="text-[var(--color-muted-foreground)]">{fallback}</span>
      );
    }
    return <span>{user?.fullName}</span>;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/jobs?page=1&limit=1000");
        const jobs = data.data.data || [];
        console.log("Fetched jobs:", jobs);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
          totalJobs: jobs.length,
          jobsInProgress: jobs.filter((j) =>
            ["Hired", "On The Way"].includes(j.status)
          ).length,
          jobsAwaitingOffers: jobs.filter((job) => job.status === "Posted")
            .length,
          completedJobs: jobs.filter((job) => job.status === "Completed")
            .length,
          cancelledJobs: jobs.filter((job) => job.status === "Cancelled")
            .length,
          disputedJobs: jobs.filter((job) => job.status === "Disputed").length,
          jobsCreatedToday: jobs.filter((job) => {
            const jobDate = new Date(job.createdAt);
            jobDate.setHours(0, 0, 0, 0);
            return jobDate.getTime() === today.getTime();
          }).length,
        };

        setStats(stats);
      } catch (error) {
        console.error("Error fetching job statistics:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        let url = `/jobs?page=${currentPage}&limit=${itemsPerPage}`;

        if (searchTerm) {
          url = `/jobs/search?q=${encodeURIComponent(
            searchTerm
          )}&page=${currentPage}&limit=${itemsPerPage}`;
        }

        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }

        if (serviceFilter !== "all") {
          url += `&service=${encodeURIComponent(serviceFilter)}`;
        }

        if (paymentTypeFilter !== "all") {
          url += `&paymentType=${paymentTypeFilter}`;
        }

        const { data } = await axios.get(url);

        setJobs(data.data.data || []);
        setTotalPages(Math.ceil((data.data.data.length || 0) / itemsPerPage));
        setTotalItems(data.data.data.length || 0);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: t("requests.fetch_error"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    serviceFilter,
    paymentTypeFilter,
  ]);

  const handleExportExcel = () => {
    const exportData = jobs.map((job) => ({
      [t("requests.job_id")]: job._id,
      [t("requests.title")]: job.title,
      [t("requests.description")]: job.description,
      [t("requests.service")]: getServiceName(job.service),
      [t("requests.status")]: t(`requests.status_${job.status?.toLowerCase()}`),
      [t("requests.payment_type")]: t(
        `requests.payment_${job.paymentType?.toLowerCase()}`
      ),
      [t("requests.client")]: job.client?.fullName || t("requests.unknown"),
      [t("requests.craftsman")]:
        job.craftsman?.fullName || t("requests.not_assigned"),
      [t(
        "requests.address"
      )]: `${job.address?.street}, ${job.address?.city}, ${job.address?.state}`,
      [t("requests.created_at")]: new Date(job.createdAt).toLocaleDateString(
        i18n.language
      ),
      [t("requests.job_date")]: job.jobDate
        ? new Date(job.jobDate).toLocaleDateString(i18n.language)
        : t("requests.not_scheduled"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "jobs.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      t("requests.job_id"),
      t("requests.title"),
      t("requests.service"),
      t("requests.status"),
      t("requests.payment_type"),
      t("requests.client"),
      t("requests.craftsman"),
      t("requests.created_at"),
    ];

    const tableRows = jobs.map((job) => [
      job._id.substring(0, 8) + "...",
      job.title.substring(0, 20) + (job.title.length > 20 ? "..." : ""),
      getServiceName(job.service),
      t(`requests.status_${job.status?.toLowerCase()}`),
      t(`requests.payment_${job.paymentType?.toLowerCase()}`),
      job.client?.fullName || t("requests.unknown"),
      job.craftsman?.fullName || t("requests.not_assigned"),
      new Date(job.createdAt).toLocaleDateString(i18n.language),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("jobs.pdf");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Posted: "bg-[var(--color-info)] text-[var(--color-info-foreground)]",
      Hired: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
      Completed:
        "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
      Cancelled:
        "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
      Disputed:
        "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
          statusClasses[status] ||
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        }`}
      >
        {t(`requests.status_${status?.toLowerCase()}`)}
      </span>
    );
  };

  const getPaymentTypeBadge = (paymentType) => {
    const paymentClasses = {
      cash: "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
      visa: "bg-[var(--color-info)] text-[var(--color-info-foreground)]",
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-center text-xs font-bold ${
          paymentClasses[paymentType?.toLowerCase()] ||
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        }`}
      >
        {t(`requests.payment_${paymentType?.toLowerCase()}`)}
      </span>
    );
  };

  const statsCards = [
    {
      icon: <FaBriefcase className="text-[var(--color-primary)]" />,
      label: t("requests.total_jobs"),
      value: stats.totalJobs,
    },
    {
      icon: <FaSpinner className="text-[var(--color-warning)]" />,
      label: t("requests.jobs_in_progress"),
      value: stats.jobsInProgress,
    },
    {
      icon: <FaClock className="text-[var(--color-info)]" />,
      label: t("requests.jobs_awaiting_offers"),
      value: stats.jobsAwaitingOffers,
    },
    {
      icon: <FaCheckCircle className="text-[var(--color-success)]" />,
      label: t("requests.completed_jobs"),
      value: stats.completedJobs,
    },
    {
      icon: <FaTimesCircle className="text-[var(--color-destructive)]" />,
      label: t("requests.cancelled_jobs"),
      value: stats.cancelledJobs,
    },
    {
      icon: <FaExclamationTriangle className="text-[var(--color-warning)]" />,
      label: t("requests.disputed_jobs"),
      value: stats.disputedJobs,
    },
    {
      icon: <FaCalendarDay className="text-[var(--color-primary)]" />,
      label: t("requests.jobs_created_today"),
      value: stats.jobsCreatedToday,
    },
  ];

  // Helper function to get service name based on language
  const getServiceName = (service) => {
    if (!service) return t("requests.no_service");

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
    return service.name || t("requests.no_service");
  };

  const uniqueServices = [
    ...new Set(jobs.map((job) => getServiceName(job.service)).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(jobs.map((job) => job.status).filter(Boolean)),
  ];
  const uniquePaymentTypes = [
    ...new Set(jobs.map((job) => job.paymentType).filter(Boolean)),
  ];

  if (loading && (!jobs || jobs.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto mt-8 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--color-muted-foreground)] font-semibold">
              {t("overview.loading")}
            </p>
          </div>
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal
          isOpen={isJobDetailsModalOpen}
          onClose={() => {
            setIsJobDetailsModalOpen(false);
            setSelectedJobId(null);
          }}
          jobId={selectedJobId}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-[var(--color-primary)] tracking-tight drop-shadow">
          {t("requests.main-title")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatCard
            key={index}
            icon={card.icon}
            label={card.label}
            value={card.value.toLocaleString()}
          />
        ))}
      </div>

      <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-6">
        <h2 className="text-3xl font-bold mb-6 text-[var(--color-foreground)] text-center">
          {t("requests.jobs_list")}
        </h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6 space-between">
          <div className="flex flex-col md:flex-row gap-4 ">
            <input
              type="text"
              placeholder={t("requests.search_jobs")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg w-full bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
            >
              <option value="all">{t("requests.all_statuses")}</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {t(`requests.status_${status.toLowerCase()}`)}
                </option>
              ))}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
            >
              <option value="all">{t("requests.all_services")}</option>
              {uniqueServices.map((service, idx) => (
                <option key={idx} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <select
              value={paymentTypeFilter}
              onChange={(e) => {
                setPaymentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
            >
              <option value="all">{t("requests.all_payment_types")}</option>
              {uniquePaymentTypes.map((paymentType) => (
                <option key={paymentType} value={paymentType}>
                  {t(`requests.payment_${paymentType.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold shadow bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
            >
              <FaDownload />
              {t("export.excel")}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold shadow bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] active:bg-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
            >
              <FaDownload />
              {t("export.pdf")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl shadow border border-[var(--color-primary-100)]">
          <table className="min-w-full text-center table-auto bg-[var(--color-card)] text-[var(--color-card-foreground)]">
            <thead className="bg-[var(--color-primary-100)] text-[var(--color-primary-900)]">
              <tr>
                <th className="p-3 font-bold">{t("requests.title")}</th>
                <th className="p-3 font-bold">{t("requests.service")}</th>
                <th className="p-3 font-bold">{t("requests.status")}</th>
                <th className="p-3 font-bold">{t("requests.payment_type")}</th>
                <th className="p-3 font-bold">{t("requests.client")}</th>
                <th className="p-3 font-bold">{t("requests.craftsman")}</th>
                <th className="p-3 font-bold">{t("requests.address")}</th>
                <th className="p-3 font-bold">{t("requests.created_at")}</th>
                <th className="p-3 font-bold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {jobs && jobs.length > 0 ? (
                jobs.map((job, idx) => (
                  <tr
                    key={job._id}
                    className={`border-t border-[var(--color-primary-100)] ${
                      idx % 2 === 0
                        ? "bg-[var(--color-background)]"
                        : "bg-[var(--color-muted)]"
                    } text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)] transition-colors`}
                  >
                    <td className="p-3">
                      <div className="max-w-xs">
                        <div className="font-semibold">{job.title}</div>
                        <div className="text-sm text-[var(--color-muted-foreground)] truncate">
                          {job.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{getServiceName(job.service)}</td>
                    <td className="p-3">{getStatusBadge(job.status)}</td>
                    <td className="p-3">
                      {getPaymentTypeBadge(job.paymentType)}
                    </td>
                    <td className="p-3">
                      <UserDisplay userId={job.client} />
                    </td>
                    <td className="p-3">
                      <UserDisplay
                        userId={job.craftsman}
                        fallback={t("requests.not_assigned")}
                      />
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs text-sm">
                        {job.address?.street}, {job.address?.city}
                      </div>
                    </td>
                    <td className="p-3">
                      {new Date(job.createdAt).toLocaleDateString(
                        i18n.language,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="p-3 items-center justify-center">
                      <button
                        onClick={() => {
                          console.log("Eye icon clicked for job:", job._id);
                          setSelectedJobId(job._id);
                          setIsJobDetailsModalOpen(true);
                        }}
                        className="p-2 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-primary-100)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
                        title={t("requests.view_details")}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-6 text-[var(--color-muted-foreground)]"
                  >
                    {t("requests.no_jobs_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex  gap-4 items-center mt-4 flex-end">
          <label className="text-sm font-semibold text-[var(--color-muted-foreground)]">
            {t("Items per page")}
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2 flex-wrap items-center">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="px-3 py-2 rounded-full font-bold shadow transition-all focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &#8592;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                aria-label={`Page ${i + 1}`}
                className={`px-4 py-2 rounded-full font-bold shadow transition-all focus:ring-2 focus:ring-[var(--color-ring)]
                  ${
                    currentPage === i + 1
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-400)] active:bg-[var(--color-primary-500)]"
                      : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)]"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="px-3 py-2 rounded-full font-bold shadow transition-all focus:ring-2 focus:ring-[var(--color-ring)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &#8594;
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
          {t("requests.showing")} {jobs.length} {t("requests.of")} {totalItems}{" "}
          {t("requests.jobs")}
        </div>
      </div>

      <JobDetailsModal
        isOpen={isJobDetailsModalOpen}
        onClose={() => {
          setIsJobDetailsModalOpen(false);
          setSelectedJobId(null);
        }}
        jobId={selectedJobId}
      />
    </div>
  );
}
