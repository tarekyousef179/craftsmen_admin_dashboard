import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaIdCard,
  FaCertificate,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaTimes as FaClose,
} from "react-icons/fa";
import axios from "../utils/axios";
import Swal from "sweetalert2";
import { useCraftsmenContext } from "../contexts/CraftsmenContext";

const PendingVerifications = () => {
  const { t } = useTranslation();
  const { refreshTrigger, updateVerificationStatus } = useCraftsmenContext();
  const [pendingCraftsmen, setPendingCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCraftsman, setSelectedCraftsman] = useState(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, [refreshTrigger]);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/verifications");
      const verifications = response.data.data || [];
      const pending = verifications.filter(
        (craftsman) =>
          craftsman.craftsmanInfo?.verificationStatus?.toLowerCase() ===
          "pending"
      );
      setPendingCraftsmen(pending);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = (craftsman) => {
    setSelectedCraftsman(craftsman);
    setCurrentDocIndex(0);
    setIsModalOpen(true);
  };

  const handleApprove = async (craftsmanId, craftsmanName) => {
    const result = await Swal.fire({
      title: t("craftsmen.confirm_approve_title"),
      text: t("craftsmen.confirm_approve_text", { name: craftsmanName }),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "var(--color-success)",
      cancelButtonColor: "var(--color-muted)",
      confirmButtonText: t("craftsmen.approve_verification"),
      cancelButtonText: t("users.cancel"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      const response = await updateVerificationStatus(craftsmanId, "approve");

      if (response.success) {
        setIsModalOpen(false);
        Swal.fire({
          title: t("craftsmen.approve_success_title"),
          text: t("craftsmen.approve_success"),
          icon: "success",
          confirmButtonColor: "var(--color-success)",
        });
      } else {
        Swal.fire({
          title: t("users.error"),
          text: t("craftsmen.action_error"),
          icon: "error",
          confirmButtonColor: "var(--color-destructive)",
        });
      }
      setActionLoading(false);
    }
  };

  const handleReject = async (craftsmanId, craftsmanName) => {
    const result = await Swal.fire({
      title: t("craftsmen.confirm_reject_title"),
      text: t("craftsmen.confirm_reject_text", { name: craftsmanName }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-destructive)",
      cancelButtonColor: "var(--color-muted)",
      confirmButtonText: t("craftsmen.reject_verification"),
      cancelButtonText: t("users.cancel"),
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      const response = await updateVerificationStatus(craftsmanId, "reject");

      if (response.success) {
        setIsModalOpen(false);
        Swal.fire({
          title: t("craftsmen.reject_success_title"),
          text: t("craftsmen.reject_success"),
          icon: "success",
          confirmButtonColor: "var(--color-success)",
        });
      } else {
        Swal.fire({
          title: t("users.error"),
          text: t("craftsmen.action_error"),
          icon: "error",
          confirmButtonColor: "var(--color-destructive)",
        });
      }
      setActionLoading(false);
    }
  };

  const nextDocument = () => {
    if (
      selectedCraftsman &&
      currentDocIndex <
        selectedCraftsman.craftsmanInfo.verificationDocs.length - 1
    ) {
      setCurrentDocIndex(currentDocIndex + 1);
    }
  };

  const prevDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  const getDocIcon = (docType) => {
    switch (docType?.toLowerCase()) {
      case "id":
        return <FaIdCard className="text-blue-500" />;
      case "certificate":
        return <FaCertificate className="text-green-500" />;
      case "portfolio":
        return <FaImage className="text-purple-500" />;
      default:
        return <FaImage className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-6">
        <div className="text-center text-[var(--color-muted-foreground)]">
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] p-6 mb-6">
        <h2 className="text-2xl font-bold text-center text-[var(--color-foreground)] mb-6">
          {t("craftsmen.pending_verifications_title")}
        </h2>

        {pendingCraftsmen.length === 0 ? (
          <div className="text-center text-[var(--color-muted-foreground)] py-8">
            {t("craftsmen.no_pending_verifications")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                    {t("craftsmen.craftsman_name")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                    {t("craftsmen.email")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                    {t("craftsmen.phone")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                    {t("craftsmen.documents_count")}
                  </th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                    {t("craftsmen.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingCraftsmen.map((craftsman) => (
                  <tr
                    key={craftsman._id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            craftsman.profilePicture || "/default-avatar.png"
                          }
                          alt={craftsman.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-[var(--color-foreground)] font-medium">
                          {craftsman.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[var(--color-muted-foreground)]">
                      {craftsman.email}
                    </td>
                    <td className="py-4 px-4 text-[var(--color-muted-foreground)]">
                      {craftsman.phone}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-[var(--color-primary-100)] text-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-medium">
                        {craftsman.craftsmanInfo?.verificationDocs?.length || 0}{" "}
                        {t("craftsmen.documents")}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewDocuments(craftsman)}
                        className="flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-lg hover:bg-[var(--color-primary-600)] transition-colors"
                      >
                        <FaEye />
                        {t("craftsmen.view_documents")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing documents */}
      {isModalOpen && selectedCraftsman && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-1000 p-4">
          <div className="bg-[var(--color-card)] rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-foreground)]">
                  {t("craftsmen.verification_documents")}
                </h3>
                <p className="text-[var(--color-muted-foreground)]">
                  {selectedCraftsman.fullName}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[var(--color-muted)] rounded-lg transition-colors"
              >
                <FaClose className="text-[var(--color-muted-foreground)]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {selectedCraftsman.craftsmanInfo?.verificationDocs?.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Document viewer */}
                  <div className="flex-1">
                    <div className="relative">
                      <img
                        src={
                          selectedCraftsman.craftsmanInfo.verificationDocs[
                            currentDocIndex
                          ]?.docUrl
                        }
                        alt={
                          selectedCraftsman.craftsmanInfo.verificationDocs[
                            currentDocIndex
                          ]?.docName
                        }
                        className="w-full h-96 object-contain bg-[var(--color-muted)] rounded-lg"
                      />

                      {/* Navigation arrows */}
                      {selectedCraftsman.craftsmanInfo.verificationDocs.length >
                        1 && (
                        <>
                          <button
                            onClick={prevDocument}
                            disabled={currentDocIndex === 0}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            onClick={nextDocument}
                            disabled={
                              currentDocIndex ===
                              selectedCraftsman.craftsmanInfo.verificationDocs
                                .length -
                                1
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <FaChevronRight />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Document info */}
                    <div className="mt-4 flex items-center gap-3">
                      {getDocIcon(
                        selectedCraftsman.craftsmanInfo.verificationDocs[
                          currentDocIndex
                        ]?.docType
                      )}
                      <div>
                        <p className="font-medium text-[var(--color-foreground)]">
                          {
                            selectedCraftsman.craftsmanInfo.verificationDocs[
                              currentDocIndex
                            ]?.docName
                          }
                        </p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          {
                            selectedCraftsman.craftsmanInfo.verificationDocs[
                              currentDocIndex
                            ]?.docType
                          }
                        </p>
                      </div>
                    </div>

                    {/* Document counter */}
                    <div className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                      {currentDocIndex + 1} {t("craftsmen.of")}{" "}
                      {selectedCraftsman.craftsmanInfo.verificationDocs.length}
                    </div>
                  </div>

                  {/* Document list and actions */}
                  <div className="lg:w-80">
                    <h4 className="font-semibold text-[var(--color-foreground)] mb-4">
                      {t("craftsmen.all_documents")}
                    </h4>

                    {/* Document list */}
                    <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                      {selectedCraftsman.craftsmanInfo.verificationDocs.map(
                        (doc, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentDocIndex(index)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                              index === currentDocIndex
                                ? "bg-[var(--color-primary-100)] border border-[var(--color-primary)]"
                                : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)] border border-transparent"
                            }`}
                          >
                            {getDocIcon(doc.docType)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
                                {doc.docName}
                              </p>
                              <p className="text-xs text-[var(--color-muted-foreground)]">
                                {doc.docType}
                              </p>
                            </div>
                          </button>
                        )
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          handleApprove(
                            selectedCraftsman._id,
                            selectedCraftsman.fullName
                          )
                        }
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-success)] text-[var(--color-success-foreground)] py-3 px-4 rounded-lg hover:bg-[var(--color-success-400)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaCheck />
                        {actionLoading
                          ? t("craftsmen.processing")
                          : t("craftsmen.approve_verification")}
                      </button>

                      <button
                        onClick={() =>
                          handleReject(
                            selectedCraftsman._id,
                            selectedCraftsman.fullName
                          )
                        }
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaTimes />
                        {actionLoading
                          ? t("craftsmen.processing")
                          : t("craftsmen.reject_verification")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[var(--color-muted-foreground)] py-8">
                  {t("craftsmen.no_documents")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingVerifications;
