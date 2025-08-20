import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import axios from "../utils/axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaDownload, FaPlus } from "react-icons/fa";
import UserActionIcons from "./UserActionIcons";
import UserDetailsModal from "./UserDetailsModal";
import CreateAdminModal from "./CreateAdminModal";
import { useUsers } from "../contexts/UserContext";

export default function UsersTableSimple() {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();
  const { user: currentUser } = useAuth();

  const { users, setUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const handleExportExcel = () => {
    const exportData = filteredUsers.map((user) => ({
      [t("users.name")]: user.fullName,
      [t("users.email")]: user.email,
      [t("users.phone")]: user.phone,
      [t("users.country")]: user.country,
      [t("users.role")]: t(`roles.${user.role}`),
      [t("users.status")]: user.isBanned
        ? t("users.isBanned")
        : t("users.active"),
      [t("users.rating")]: user.rating,
      [t("users.rating_count")]: user.rating_count,
      [t("users.createdAt")]: new Date(user.createdAt).toLocaleDateString(
        i18n.language
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      t("users.name"),
      t("users.email"),
      t("users.phone"),
      t("users.country"),
      t("users.role"),
      t("users.status"),
      t("users.rating"),
      t("users.rating_count"),
      t("users.createdAt"),
    ];

    const tableRows = filteredUsers.map((user) => [
      user.fullName,
      user.email,
      user.phone,
      user.country,
      t(`roles.${user.role}`),
      user.isBanned ? t("users.isBanned") : t("users.active"),
      user.rating,
      user.rating_count,
      new Date(user.createdAt).toLocaleDateString(i18n.language),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("users.pdf");
  };
  const handleToggleBlock = async (user) => {
    const isBanned = user.isBanned;
    if (isBanned) {
      const confirmUnblock = await Swal.fire({
        title: t("users.confirm_unblock_title"),
        text: t("users.confirm_unblock"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("users.unblock"),
        cancelButtonText: t("users.cancel"),
        confirmButtonColor: darkMode ? "#22c55e" : "#22c55e",
        cancelButtonColor: "#d33",
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });

      if (!confirmUnblock.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `/admin/users/${user._id}/unban`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id
              ? { ...u, isBanned: false, isBanned_reason: null }
              : u
          )
        );

        Swal.fire({
          icon: "success",
          title: t("users.unblock_success"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: t("users.unblock_failed"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      }
    } else {
      const confirmBlock = await Swal.fire({
        title: t("users.confirm_block_title"),
        text: t("users.confirm_block"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("users.continue"),
        cancelButtonText: t("users.cancel"),
        confirmButtonColor: darkMode ? "#f97316" : "#f97316",
        cancelButtonColor: "#d33",
        background: darkMode ? "#1f2937" : "#fff",
        color: darkMode ? "#fff" : "#000",
      });

      if (!confirmBlock.isConfirmed) return;

      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `/admin/users/${user._id}/ban`,
          {
            user_id: user._id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isBanned: true } : u))
        );

        Swal.fire({
          icon: "success",
          title: t("users.block_success"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: t("users.block_failed"),
          background: darkMode ? "#1f2937" : "#fff",
          color: darkMode ? "#fff" : "#000",
        });
      }
    }
  };

  const filteredUsers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return users.filter((u) => {
      const roleOriginal = u.role?.toLowerCase();
      const roleTranslated = t(`roles.${u.role}`)?.toLowerCase();

      const countryOriginal = u.country?.toLowerCase();
      const countryTranslated = t(`countries.${u.country}`)?.toLowerCase();

      const matchSearch =
        u.fullName?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.phone?.includes(searchLower) ||
        roleOriginal?.includes(searchLower) ||
        roleTranslated?.includes(searchLower) ||
        countryOriginal?.includes(searchLower) ||
        countryTranslated?.includes(searchLower);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isBanned) ||
        (statusFilter === "isBanned" && u.isBanned);

      const matchRole = roleFilter === "all" || u.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter, t]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueRoles = [...new Set(users.map((u) => u.role))];

  const handleCreateAdminSuccess = () => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/admin/users?page=1&limit=1000");
        setUsers(
          data.data.data.filter(
            (user) => user.role !== "admin" || user.role !== "moderator	"
          )
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto rounded-2xl shadow-lg bg-[var(--color-card)] border border-[var(--color-primary-100)]">
      <h2 className="text-5xl font-extrabold mb-8 text-center text-[var(--color-primary)] tracking-tight drop-shadow">
        {t("users.title")}
      </h2>
      {currentUser?.role === "admin" && (
        <button
          onClick={() => setIsCreateAdminModalOpen(true)}
          className="flex mb-7 items-center gap-2 px-5 py-2 rounded-xl font-bold shadow bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:bg-[var(--color-success-400)] active:bg-[var(--color-success-500)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
        >
          <FaPlus />
          {t("users.add_new_admin")}
        </button>
      )}
      <div className="flex flex-col md:flex-row gap-4 mb-8 content-between items-center justify-between">
        <div className="flex flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder={t("search")}
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
            <option value="all">{t("users.all_status")}</option>
            <option value="active">{t("users.active")}</option>
            <option
              value="
isBanned"
            >
              {t("users.isBanned")}
            </option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg bg-[var(--color-input)] text-[var(--color-foreground)] border-[var(--color-primary-100)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          >
            <option value="all">{t("users.all_roles")}</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-row gap-4 items-center mt-4 md:mt-0">
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
              <th className="p-3 font-bold">{t("users.name")}</th>
              <th className="p-3 font-bold">{t("users.email")}</th>
              <th className="p-3 font-bold">{t("users.phone")}</th>
              <th className="p-3 font-bold">{t("users.country")}</th>
              <th className="p-3 font-bold">{t("users.role")}</th>
              <th className="p-3 font-bold">{t("users.status")}</th>
              <th className="p-3 font-bold">{t("users.createdAt")}</th>
              <th className="p-3 font-bold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, idx) => (
                <tr
                  key={user._id}
                  className={`border-t border-[var(--color-primary-100)] ${
                    idx % 2 === 0
                      ? "bg-[var(--color-background)]"
                      : "bg-[var(--color-muted)]"
                  } text-[var(--color-foreground)] hover:bg-[var(--color-primary-100)] transition-colors`}
                >
                  <td className="p-3">{user.fullName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">{user.address?.country}</td>
                  <td className="p-3">{t(`roles.${user.role}`)}</td>
                  <td className="p-3">
                    {user.isBanned ? (
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
                    {new Date(user.createdAt).toLocaleDateString(
                      i18n.language,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </td>
                  <td className="p-3">
                    <UserActionIcons
                      user={user}
                      onBlock={handleToggleBlock}
                      onView={() => {
                        setSelectedUser(user);
                        setIsUserDetailsModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
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

      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onSuccess={handleCreateAdminSuccess}
      />

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
