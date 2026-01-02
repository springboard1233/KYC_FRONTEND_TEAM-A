import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  Calendar,
  HardDrive,
  FileType,
  MoreHorizontal,
} from "lucide-react";
import api from "../services/api.js";

export default function DocumentCard({ doc, onDelete, onResubmit }) {
  const [status, setStatus] = useState(doc.status || "pending");
  const [showActions, setShowActions] = useState(false);
  const [showReviewNotes, setShowReviewNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        console.log("Fetching status for document ID:", doc.id || doc._id);
        const latestStatus = await api.getDocumentStatus(doc.id || doc._id);
        console.log("Fetched latestStatus:", latestStatus);
        if (latestStatus) {
          setStatus(latestStatus);
          console.log("Status updated in state:", latestStatus);
        }
      } catch (err) {
        console.error("Failed to fetch document status", err);
      }
    }
    fetchStatus();
  }, [doc.id, doc._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatFileSize = (bytes) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Delete document handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    const docId = doc.id || doc._id;

    if (!docId) {
      alert("Document ID is missing!");
      console.error("Document ID is missing:", doc);
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteDocument(docId);
      onDelete(docId);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open file picker for resubmission
  const handleResubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  // Handle file selection for resubmission
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PDF, JPEG, or PNG files.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setIsResubmitting(true);
    try {
      await onResubmit(doc.id || doc._id, file);
    } catch (error) {
      console.error("Failed to resubmit document:", error);
      alert("Failed to resubmit document. Please try again.");
    } finally {
      setIsResubmitting(false);
    }
  };

  // Preview document in new tab
  const handlePreview = async () => {
    try {
      const previewUrl = await api.previewDocument(doc.id || doc._id);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to preview document:", error);
      alert("Failed to preview document. Please try again.");
    }
  };

  // Download document handler
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await api.downloadDocument(doc.id || doc._id);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Status config for colors and icons
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-600/30",
          textColor: "text-green-400",
          borderColor: "border-green-500/30",
          glowColor: "shadow-green-500/20",
        };
      case "rejected":
        return {
          icon: XCircle,
          bgColor: "bg-red-600/30",
          textColor: "text-red-400",
          borderColor: "border-red-500/30",
          glowColor: "shadow-red-500/20",
        };
      default:
        return {
          icon: Clock,
          bgColor: "bg-yellow-600/30",
          textColor: "text-yellow-300",
          borderColor: "border-yellow-500/30",
          glowColor: "shadow-yellow-500/20",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.008, y: -4 }}
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Enhanced glow effect */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.borderColor} rounded-2xl opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500`}
      ></div>

      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl rounded-2xl border transition-all duration-500 group-hover:bg-slate-800/60 group-hover:shadow-xl ${statusConfig.borderColor} ${statusConfig.glowColor}`}
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent rounded-2xl pointer-events-none"></div>

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            {/* Document Info */}
            <div className="flex-1 min-w-0 pr-6">
              {/* Title and icon */}
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FileText className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate mb-2 group-hover:text-yellow-50 transition-colors">
                    {doc.filename}
                  </h3>
                  <div className="flex items-center gap-5 text-slate-400 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileType className="w-3.5 h-3.5" />
                      <span className="uppercase font-semibold tracking-wide">
                        {doc.fileType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Notes Toggle */}
              {doc.reviewNotes && (
                <motion.button
                  onClick={() => setShowReviewNotes(!showReviewNotes)}
                  className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10 font-medium"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{showReviewNotes ? "Hide" : "Show"} review notes</span>
                </motion.button>
              )}
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-4">
              {/* Desktop Actions */}
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="hidden md:flex items-center gap-2"
                  >
                    <ActionButton
                      icon={Eye}
                      onClick={handlePreview}
                      tooltip="Preview Document"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    />

                    <ActionButton
                      icon={Download}
                      onClick={handleDownload}
                      disabled={isDownloading}
                      tooltip="Download Document"
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      loading={isDownloading}
                    />

                    {status.toLowerCase() === "rejected" && (
                      <ActionButton
                        icon={Upload}
                        onClick={handleResubmit}
                        disabled={isResubmitting}
                        tooltip="Resubmit Document"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                        loading={isResubmitting}
                      />
                    )}

                    <ActionButton
                      icon={Trash2}
                      onClick={handleDelete}
                      disabled={isDeleting}
                      tooltip="Delete Document"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      loading={isDeleting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Menu */}
              <div className="md:hidden relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-600/30"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl z-20 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <MenuButton icon={Eye} onClick={handlePreview}>
                          Preview Document
                        </MenuButton>
                        <MenuButton
                          icon={Download}
                          onClick={handleDownload}
                          disabled={isDownloading}
                        >
                          {isDownloading
                            ? "Downloading..."
                            : "Download Document"}
                        </MenuButton>
                        {status.toLowerCase() === "rejected" && (
                          <MenuButton
                            icon={Upload}
                            onClick={handleResubmit}
                            disabled={isResubmitting}
                          >
                            {isResubmitting
                              ? "Resubmitting..."
                              : "Resubmit Document"}
                          </MenuButton>
                        )}
                        <MenuButton
                          icon={Trash2}
                          onClick={handleDelete}
                          disabled={isDeleting}
                          danger
                        >
                          {isDeleting ? "Deleting..." : "Delete Document"}
                        </MenuButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enhanced Status Badge */}
              <motion.div
                className={`relative px-4 py-2.5 rounded-full flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} backdrop-blur-sm`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <StatusIcon className="w-4 h-4" />
                <span className="capitalize font-semibold text-sm tracking-wide">
                  {status}
                </span>

                {/* Status indicator glow */}
                <div
                  className={`absolute inset-0 rounded-full ${statusConfig.bgColor} opacity-50 blur-md -z-10`}
                ></div>
              </motion.div>
            </div>
          </div>

          {/* Review Notes */}
          <AnimatePresence>
            {showReviewNotes && doc.reviewNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-500/30">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-300 font-semibold mb-2 text-sm tracking-wide">
                        REVIEW NOTES
                      </h4>
                      <p className="text-red-300/90 text-sm leading-relaxed">
                        {doc.reviewNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading Overlay */}
        {(isResubmitting || isDeleting) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30"
          >
            <div className="flex flex-col items-center gap-4 text-white">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border border-yellow-400/30"></div>
              </div>
              <span className="text-sm font-semibold tracking-wide">
                {isResubmitting
                  ? "Resubmitting document..."
                  : "Deleting document..."}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
      />
    </motion.div>
  );
}

// Action Button Component
function ActionButton({
  icon: Icon,
  onClick,
  disabled,
  tooltip,
  className,
  loading,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={`p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-transparent hover:border-current/20 font-medium ${className}`}
      title={tooltip}
      {...props}
    >
      <Icon className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
    </motion.button>
  );
}

// Menu Button Component
function MenuButton({
  icon: Icon,
  onClick,
  disabled,
  danger,
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all disabled:opacity-50 font-medium ${
        danger
          ? "text-red-400 hover:text-red-300 hover:bg-red-500/20"
          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
      }`}
      {...props}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{children}</span>
    </motion.button>
  );
}
