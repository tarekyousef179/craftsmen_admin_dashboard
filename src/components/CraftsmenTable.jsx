import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaDownload } from "react-icons/fa";
import axios from "../utils/axios";
import UserActionIcons from "./UserActionIcons";
import UserDetailsModal from "./UserDetailsModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CraftsmenTable() {
  const { t, i18n } = useTranslation();
  const [craftsmen, setCraftsmen] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [banFilter, setBanFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCraftsmen() {
      try {
        const { data } = await axios.get("/admin/users?page=1&limit=1000");
        setCraftsmen(
          (data.data.data || []).filter((u) => u.role === "craftsman")
        );
      } catch (err) {}
    }
    fetchCraftsmen();
  }, []);

  const uniqueSkills = useMemo(() => {
    const set = new Set();
    craftsmen.forEach((u) => {
      if (u.craftsmanInfo?.service?.name?.[i18n.language]) {
        set.add(u.craftsmanInfo.service.name?.[i18n.language]);
      }
    });
    return Array.from(set);
  }, [craftsmen, i18n.language]);
  const uniqueCities = useMemo(() => {
    const set = new Set();
    craftsmen.forEach((u) => {
      if (u.address?.city) set.add(u.address.city);
    });
    return Array.from(set);
  }, [craftsmen]);

  // Filtering
  const filteredCraftsmen = useMemo(() => {
    let filtered = craftsmen;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.phone?.includes(searchLower)
      );
    }
    if (verificationFilter !== "all") {
      filtered = filtered.filter(
        (u) =>
          (u.craftsmanInfo?.verificationStatus || "pending").toLowerCase() ===
          verificationFilter
      );
    }
    if (banFilter !== "all") {
      filtered = filtered.filter((u) =>
        banFilter === "banned" ? u.isBanned : !u.isBanned
      );
    }
    if (skillFilter !== "all") {
      filtered = filtered.filter(
        (u) => u.craftsmanInfo?.service?.name?.[i18n.language] === skillFilter
      );
    }
    if (cityFilter !== "all") {
      filtered = filtered.filter((u) => u.address?.city === cityFilter);
    }
    return filtered;
  }, [
    craftsmen,
    searchTerm,
    verificationFilter,
    banFilter,
    skillFilter,
    cityFilter,
    i18n.language,
  ]);

  const totalPages = Math.ceil(filteredCraftsmen.length / itemsPerPage);
  const paginatedCraftsmen = filteredCraftsmen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export logic
  const handleExportExcel = () => {
    const exportData = filteredCraftsmen.map((u) => ({
      [t("users.name")]: u.fullName,
      [t("users.email")]: u.email,
      [t("users.phone")]: u.phone,
      [t("users.city")]: u.address?.city,
      [t("users.skills")]: (u.craftsmanInfo?.skills || []).join(", "),
      [t("users.verification_status")]: u.craftsmanInfo?.verificationStatus,
      [t("users.status")]: u.isBanned ? t("users.isBanned") : t("users.active"),
      [t("users.createdAt")]: new Date(u.createdAt).toLocaleDateString(
        i18n.language
      ),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Craftsmen");
    XLSX.writeFile(workbook, "craftsmen.xlsx");
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      t("users.name"),
      t("users.email"),
      t("users.phone"),
      t("users.city"),
      t("users.skills"),
      t("users.verification_status"),
      t("users.status"),
      t("users.createdAt"),
    ];
    const tableRows = filteredCraftsmen.map((u) => [
      u.fullName,
      u.email,
      u.phone,
      u.address?.city,
      u.craftsmanInfo?.service?.name?.[i18n.language] || t("unknown"),
      u.craftsmanInfo?.verificationStatus,
      u.isBanned ? t("users.isBanned") : t("users.active"),
      new Date(u.createdAt).toLocaleDateString(i18n.language),
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save("craftsmen.pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto rounded-2xl shadow-lg bg-[var(--color-card)] border border-[var(--color-primary-100)]">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-[var(--color-primary)] tracking-tight drop-shadow">
        {t("craftsmen.table_title", "Craftsmen List")}
      </h2>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 content-between items-center justify-between">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          />
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            <option value="all">{t("all_verification_status")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="verified">{t("verified")}</option>
            <option value="rejected">{t("rejected")}</option>
          </select>
          <select
            value={banFilter}
            onChange={(e) => {
              setBanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            <option value="all">{t("all_ban_status")}</option>
            <option value="banned">{t("banned")}</option>
            <option value="not_banned">{t("not_banned")}</option>
          </select>
          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            <option value="all">{t("all_skills")}</option>
            {uniqueSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            <option value="all">{t("all_cities")}</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
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
      <div className="overflow-x-auto rounded-xl shadow border border-[var(--color-primary-100)] w-full">
        <table className="min-w-full text-center table-auto bg-[var(--color-card)] text-[var(--color-card-foreground)]">
          <thead className="bg-[var(--color-primary-100)] text-[var(--color-primary-900)]">
            <tr>
              <th className="p-3 font-bold">{t("users.name")}</th>
              <th className="p-3 font-bold">{t("users.email")}</th>
              <th className="p-3 font-bold">{t("users.phone")}</th>
              <th className="p-3 font-bold">{t("users.city")}</th>
              <th className="p-3 font-bold">{t("users.skills")}</th>
              <th className="p-3 font-bold">
                {t("users.verification_status")}
              </th>
              <th className="p-3 font-bold">{t("users.status")}</th>
              <th className="p-3 font-bold">{t("users.createdAt")}</th>
              <th className="p-3 font-bold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCraftsmen.length > 0 ? (
              paginatedCraftsmen.map((u, idx) => (
                <tr
                  key={u._id}
                  className={`border-t border-[var(--color-primary-100)] ${
                    idx % 2 === 0
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-muted)]"
                  } text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)] transition-colors`}
                >
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{u.address?.city}</td>
                  <td className="p-3">
                    {u.craftsmanInfo?.service?.name?.[i18n.language] ||
                      t("unknown")}
                  </td>
                  <td className="p-3">{u.craftsmanInfo?.verificationStatus}</td>
                  <td className="p-3">
                    {u.isBanned ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] text-xs font-bold">
                        {t("users.isBanned")}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full bg-[var(--color-success)] text-[var(--color-success-foreground)] text-xs font-bold">
                        {t("users.active")}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(u.createdAt).toLocaleDateString(i18n.language, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-3">
                    <UserActionIcons
                      user={u}
                      onBlock={() => {}}
                      onView={() => {
                      setSelectedUser(u);
                      setIsUserDetailsModalOpen(true);
                    }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-6 text-[var(--color-muted-foreground)]"
                >
                  {t("users.no_results")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
      <div className="flex flex-row gap-4 items-center mt-4">
        <label
          htmlFor="itemsPerPage"
          className="text-sm font-semibold text-[var(--color-muted-foreground)]"
        >
          {t("Items per page")}
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

      {/* UserDetailsModal */}
      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => {
          setIsUserDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}
