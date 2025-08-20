import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/themeContext";
import { useUsers } from "../contexts/UserContext";

import axios from "../utils/axios";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaMoneyBillWave,
  FaTools,
  FaStar,
} from "react-icons/fa";

export default function JobDetailsModal({ isOpen, onClose, jobId }) {
  const { t, i18n } = useTranslation();
  const { darkMode } = useTheme();

  const [job, setJob] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const userCacheRef = useRef({});

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

  useEffect(() => {
    if (!isOpen || !jobId) return;

    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const jobResponse = await axios.get(`/jobs/${jobId}`);
        // Handle single job response - could be direct object or in data property
        const jobData = jobResponse.data.data || jobResponse.data;
        setJob(jobData);

        const quotesResponse = await axios.get(`/jobs/${jobId}/quotes`);
        // Response is always an array
        const quotesData = quotesResponse.data.data || quotesResponse.data;
        setQuotes(quotesData);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [isOpen, jobId]);

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

  const nextImage = () => {
    if (job?.photos?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === job.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (job?.photos?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? job.photos.length - 1 : prev - 1
      );
    }
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
        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
          statusClasses[status] ||
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        }`}
      >
        {t(`requests.status_${status?.toLowerCase()}`)}
      </span>
    );
  };

  const getQuoteStatusBadge = (status) => {
    const statusClasses = {
      Submitted: "bg-[var(--color-info)] text-[var(--color-info-foreground)]",
      Accepted:
        "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
      Declined:
        "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
          statusClasses[status] ||
          "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        }`}
      >
        {t(`quotes.status_${status?.toLowerCase()}`)}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-primary-100)] w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[var(--color-primary-100)] flex justify-between items-center sticky top-0 bg-[var(--color-card)] z-10">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {t("requests.job_details")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--color-muted-foreground)] font-semibold">
                {t("overview.loading")}
              </p>
            </div>
          </div>
        ) : job ? (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
                  {job.title}
                </h3>
                <p className="text-[var(--color-muted-foreground)] max-w-2xl">
                  {job.description}
                </p>
              </div>
              {getStatusBadge(job.status)}
            </div>

            {job.photos && job.photos.length > 0 && (
              <div className="relative">
                <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                  {t("requests.job_photos")} ({job.photos.length})
                </h4>
                <div className="relative h-96 w-full bg-[var(--color-muted)] rounded-xl overflow-hidden">
                  <img
                    src={job.photos[currentImageIndex]}
                    alt={`Job photo ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain bg-[var(--color-background)]"
                    loading="lazy"
                    style={{ imageRendering: 'high-quality' }}
                  />

                  {job.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg hover:scale-110 backdrop-blur-sm"
                        aria-label="Previous image"
                      >
                        <FaChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 shadow-lg hover:scale-110 backdrop-blur-sm"
                        aria-label="Next image"
                      >
                        <FaChevronRight size={16} />
                      </button>
                    </>
                  )}

                  {job.photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {job.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentImageIndex
                              ? "bg-white shadow-lg scale-125"
                              : "bg-white/50 hover:bg-white/75 hover:scale-110"
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {job.photos.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {job.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex
                            ? "border-[var(--color-primary)] shadow-lg scale-105"
                            : "border-[var(--color-primary-100)] hover:border-[var(--color-primary)] hover:scale-105"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-[var(--color-muted)] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
                    {t("requests.job_information")}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaTools className="text-[var(--color-primary)]" />
                      <div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          {t("requests.service")}:
                        </span>
                        <p className="font-semibold">
                          {getServiceName(job.service)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave className="text-[var(--color-primary)]" />
                      <div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          {t("requests.payment_type")}:
                        </span>
                        <p className="font-semibold">
                          {t(
                            `requests.payment_${job.paymentType?.toLowerCase()}`
                          )}
                        </p>
                      </div>
                    </div>
                    {job.jobDate && (
                      <div className="flex items-center gap-3">
                        <FaCalendar className="text-[var(--color-primary)]" />
                        <div>
                          <span className="text-sm text-[var(--color-muted-foreground)]">
                            {t("requests.scheduled_date")}:
                          </span>
                          <p className="font-semibold">
                            {new Date(job.jobDate).toLocaleDateString(
                              i18n.language
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--color-muted)] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
                    {t("requests.location")}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-[var(--color-primary)] mt-1" />
                      <div>
                        <p className="font-semibold">{job.address?.street}</p>
                        <p className="text-[var(--color-muted-foreground)]">
                          {job.address?.city}, {job.address?.state},{" "}
                          {job.address?.country}
                        </p>
                        {job.location?.coordinates && (
                          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                            {t("requests.coordinates")}:{" "}
                            {job.location.coordinates[1]?.toFixed(6)},{" "}
                            {job.location.coordinates[0]?.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[var(--color-muted)] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
                    {t("requests.people")}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaUser className="text-[var(--color-primary)]" />
                      <div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          {t("requests.client")}:
                        </span>
                        <p className="font-semibold">
                          <UserDisplay userId={job.client} />
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaUser className="text-[var(--color-primary)]" />
                      <div>
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          {t("requests.craftsman")}:
                        </span>
                        <p className="font-semibold">
                          <UserDisplay
                            userId={job.craftsman}
                            fallback={t("requests.not_assigned")}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-muted)] rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
                    {t("requests.timeline")}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-muted-foreground)]">
                        {t("requests.created")}:
                      </span>
                      <span className="font-semibold">
                        {new Date(job.createdAt).toLocaleDateString(
                          i18n.language
                        )}
                      </span>
                    </div>
                    {job.updatedAt && job.updatedAt !== job.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--color-muted-foreground)]">
                          {t("requests.last_updated")}:
                        </span>
                        <span className="font-semibold">
                          {new Date(job.updatedAt).toLocaleDateString(
                            i18n.language
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Map Section */}
            {job.location?.coordinates && (
              <div className="bg-[var(--color-muted)] rounded-xl p-4">
                <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                  {t("requests.job_location_map")}
                </h4>
                <div className="h-80 bg-[var(--color-background)] rounded-lg border border-[var(--color-primary-100)] overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      job.location.coordinates[0] - 0.01
                    },${job.location.coordinates[1] - 0.01},${
                      job.location.coordinates[0] + 0.01
                    },${
                      job.location.coordinates[1] + 0.01
                    }&layer=mapnik&marker=${
                      job.location.coordinates[1]
                    },${job.location.coordinates[0]}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t("requests.job_location_map")}
                  />
                </div>
              </div>
            )}

            <div className="bg-[var(--color-muted)] rounded-xl p-4">
              <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
                {t("requests.quotes")} ({quotes.length})
              </h4>

              {quotes.length > 0 ? (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div
                      key={quote._id}
                      className="bg-[var(--color-card)] rounded-lg p-4 border border-[var(--color-primary-100)]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <FaUser className="text-[var(--color-primary)]" />
                          <div>
                            <p className="font-semibold">
                              <UserDisplay
                                userId={quote.craftsman?._id || quote.craftsman}
                                fallback={t("requests.unknown_craftsman")}
                              />
                            </p>
                            {quote.craftsman?.rating && (
                              <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-500" size={12} />
                                <span className="text-sm text-[var(--color-muted-foreground)]">
                                  {quote.craftsman.rating} (
                                  {quote.craftsman.ratingCount || 0})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[var(--color-primary)]">
                            ${quote.price?.toLocaleString()}
                          </p>
                          {getQuoteStatusBadge(quote.status)}
                        </div>
                      </div>

                      {quote.notes && (
                        <p className="text-[var(--color-foreground)] mb-3">
                          {quote.notes}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-sm text-[var(--color-muted-foreground)]">
                        <span>
                          {t("requests.submitted")}:{" "}
                          {new Date(quote.createdAt).toLocaleDateString(
                            i18n.language
                          )}
                        </span>
                        {quote.updatedAt &&
                          quote.updatedAt !== quote.createdAt && (
                            <span>
                              {t("requests.updated")}:{" "}
                              {new Date(quote.updatedAt).toLocaleDateString(
                                i18n.language
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-muted-foreground)] text-center py-8">
                  {t("requests.no_quotes_yet")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-[var(--color-muted-foreground)]">
              {t("requests.job_not_found")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
