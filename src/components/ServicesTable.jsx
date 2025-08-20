import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaEye, FaEdit, FaTrash, FaTools } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTheme } from "../contexts/themeContext";

export default function ServicesTable({ services, onEdit, onDelete, onView }) {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper function to get service name based on language
  const getServiceName = (service) => {
    if (!service) return '';

    const lang = i18n.language;
    if (lang === 'ar' && service.name?.ar) {
      return service.name.ar;
    } else if (lang === 'en' && service.name?.en) {
      return service.name.en;
    } else if (service.name?.en) {
      return service.name.en;
    } else if (service.name?.ar) {
      return service.name.ar;
    }
    return service.name || '';
  };

  // Helper function to get service description based on language
  const getServiceDescription = (service) => {
    if (!service) return '';

    const lang = i18n.language;
    if (lang === 'ar' && service.description?.ar) {
      return service.description.ar;
    } else if (lang === 'en' && service.description?.en) {
      return service.description.en;
    } else if (service.description?.en) {
      return service.description.en;
    } else if (service.description?.ar) {
      return service.description.ar;
    }
    return service.description || '';
  };

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const serviceName = getServiceName(service).toLowerCase();
      const serviceDescription = getServiceDescription(service).toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return serviceName.includes(searchLower) || 
             serviceDescription.includes(searchLower);
    });
  }, [services, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = async (service) => {
    const result = await Swal.fire({
      title: t("services.confirm_delete_title"),
      text: t("services.confirm_delete_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-destructive)",
      cancelButtonColor: "var(--color-muted)",
      confirmButtonText: t("services.delete"),
      cancelButtonText: t("services.cancel"),
      background: darkMode ? "#1f2937" : "#fff",
      color: darkMode ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      onDelete(service);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-primary-100)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaTools className="text-[var(--color-primary)] text-2xl" />
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
            {t("services.services_table")}
          </h2>
        </div>
        <div className="text-sm text-[var(--color-muted-foreground)]">
          {t("services.total_count", { count: filteredServices.length })}
        </div>
      </div>

      {/* Search and Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder={t("services.search_placeholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm w-full md:w-80"
          />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <label
            htmlFor="itemsPerPage"
            className="text-sm font-semibold text-[var(--color-muted-foreground)]"
          >
            {t("services.items_per_page")}
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto  rounded-xl shadow border border-[var(--color-primary-100)]">
        <table className="min-w-full text-center table-auto bg-[var(--color-card)] text-[var(--color-card-foreground)]">
          <thead className="bg-[var(--color-primary-100)] text-[var(--color-primary-900)]">
            <tr>
              <th className="p-3 font-bold ">{t("services.name")}</th>
              <th className="p-3 font-bold ">{t("services.description")}</th>
              <th className="p-3 font-bold">{t("services.created_at")}</th>
              <th className="p-3 font-bold">{t("services.updated_at")}</th>
              <th className="p-3 font-bold">{t("services.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedServices.length > 0 ? (
              paginatedServices.map((service, idx) => (
                <tr
                  key={service._id}
                  className={`border-t border-[var(--color-primary-100)] ${
                    idx % 2 === 0
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-muted)]"
                  } text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)] transition-colors`}
                >
                  <td className="p-3 ">
                    <div className="font-semibold">{getServiceName(service)}</div>
                  </td>
                  <td className="p-3  max-w-xs">
                    <div className="truncate" title={getServiceDescription(service)}>
                      {getServiceDescription(service) || t("services.no_description")}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {formatDate(service.createdAt)}
                  </td>
                  <td className="p-3 text-sm">
                    {formatDate(service.updatedAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onView(service)}
                        aria-label={t("services.view_details")}
                        title={t("services.view_details")}
                        className="p-2 rounded-full bg-[var(--color-info)] text-[var(--color-info-foreground)] hover:bg-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onEdit(service)}
                        aria-label={t("services.edit")}
                        title={t("services.edit")}
                        className="p-2 rounded-full bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning)] hover:opacity-80 focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        aria-label={t("services.delete")}
                        title={t("services.delete")}
                        className="p-2 rounded-full bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:bg-[var(--color-destructive)] hover:opacity-80 focus:ring-2 focus:ring-[var(--color-ring)] transition-all shadow"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center">
                  <div className="text-[var(--color-muted-foreground)]">
                    <FaTools className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>{t("services.no_services_found")}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
    </div>
  );
}
