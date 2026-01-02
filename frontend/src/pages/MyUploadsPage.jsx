import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileCheck,
  AlertCircle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
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

import AnimatedBackground from "../components/AnimatedBackground";
import StatCard from "../components/StatCard";
import UploadModal from "../components/UploadModal";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDocs = async () => {
    try {
      setError(null);
      const docs = await api.getUserDocs();
      setUploads(docs);
      setFilteredUploads(docs);
    } catch (err) {
      setError("Failed to load uploads.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    let filtered = uploads;

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }
    setFilteredUploads(filtered);
  }, [uploads, searchTerm, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDocs();
  };

  const handleDelete = (id) => {
    setUploads((prev) => prev.filter((doc) => (doc.id || doc._id) !== id));
  };

  const handleResubmit = async (id, file) => {
    try {
      const updatedDoc = await api.resubmitDocument(id, file);
      setUploads((prev) =>
        prev.map((doc) => (doc.id === id || doc._id === id ? updatedDoc : doc))
      );
    } catch (error) {
      console.error("Failed to resubmit document:", error);
      throw error;
    }
  };

  const handleUpload = async (file) => {
    try {
      const newDoc = await api.uploadDocument(file);
      setUploads((prev) => [newDoc, ...prev]);
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  };

  const stats = {
    total: uploads.length,
    approved: uploads.filter((doc) => doc.status === "approved").length,
    pending: uploads.filter((doc) => doc.status === "pending").length,
    rejected: uploads.filter((doc) => doc.status === "rejected").length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />
      <div className="h-24" />
      <div className="w-full max-w-7xl mx-auto relative z-10 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <p className="text-slate-300 text-lg font-medium tracking-wide">
              Manage and track your document verification journey
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-400"></div>
          </motion.div>
        </motion.div>

        {!loading && uploads.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                title="Total Documents"
                value={stats.total.toString()}
                icon={FileCheck}
                color="blue"
                delay={0.1}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Approved"
                value={stats.approved.toString()}
                icon={FileCheck}
                color="green"
                delay={0.2}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Pending Review"
                value={stats.pending.toString()}
                icon={Clock}
                color="yellow"
                delay={0.3}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Rejected"
                value={stats.rejected.toString()}
                icon={AlertCircle}
                color="red"
                delay={0.4}
              />
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-yellow-600/20 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity blur-lg"></div>
          <div className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none"></div>
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Document Management
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Track and manage your verification process
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                  {uploads.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <motion.div
                        className="relative group/search"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/search:text-yellow-400 transition-colors z-10" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-72 pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm transition-all duration-300 font-medium"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-600/10 to-orange-600/10 opacity-0 group-hover/search:opacity-100 transition-opacity pointer-events-none"></div>
                      </motion.div>

                      <motion.div
                        className="relative group/filter"
                        whileHover={{ scale: 1.02 }}
                      >
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="appearance-none w-full sm:w-auto pl-4 pr-10 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 backdrop-blur-sm transition-all cursor-pointer font-medium"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/filter:text-yellow-400 transition-colors pointer-events-none" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-600/10 to-orange-600/10 opacity-0 group-hover/filter:opacity-100 transition-opacity pointer-events-none"></div>
                      </motion.div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="group flex items-center gap-2 px-5 py-3.5 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all border border-slate-600/30 hover:border-slate-500/50 backdrop-blur-sm disabled:opacity-50 font-medium"
                    >
                      <RefreshCw
                        className={`w-4 h-4 transition-all ${
                          refreshing ? "animate-spin" : "group-hover:rotate-180"
                        }`}
                      />
                      <span className="hidden sm:inline">Refresh</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUploadModal(true)}
                      className="group relative flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-500/25 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform" />
                      <span className="relative z-10">Upload New</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-yellow-400/30"></div>
                  </div>
                  <p className="text-slate-300 text-lg font-medium">
                    Loading your documents...
                  </p>
                  <div className="mt-4 w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="relative mb-8">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-red-400/20 blur-xl"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Something went wrong
                  </h3>
                  <p className="text-red-400 text-lg mb-8 max-w-md mx-auto">
                    {error}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all shadow-lg"
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              ) : uploads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="relative mb-10">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center border border-yellow-500/30">
                      <FileCheck className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="absolute inset-0 animate-pulse rounded-3xl bg-yellow-400/10 blur-xl"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Ready to get started?
                  </h3>
                  <p className="text-slate-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                    Upload your first document and begin the verification
                    process. We support JPEG, and PNG files up to 10MB.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadModal(true)}
                    className="group relative px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-yellow-500/25 overflow-hidden text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      Upload Your First Document
                    </span>
                  </motion.button>
                </motion.div>
              ) : filteredUploads.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="relative mb-8">
                    <Search className="w-16 h-16 text-slate-500 mx-auto" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-slate-400/10 blur-xl"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    No documents found
                  </h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                    Try adjusting your search terms or filter criteria to find
                    what you're looking for.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-xl transition-all"
                  >
                    Clear All Filters
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-400 font-medium">
                      Showing {filteredUploads.length} of {uploads.length}{" "}
                      documents
                    </p>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {filteredUploads.map((doc, idx) => (
                      <motion.div
                        key={doc._id || doc.id || doc.filename}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <DocumentCard
                          doc={doc}
                          onDelete={handleDelete}
                          onResubmit={handleResubmit}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-6 text-sm text-slate-500 bg-slate-900/30 backdrop-blur-sm px-8 py-4 rounded-2xl border border-slate-800">
            <span className="font-medium">
              © 2024 SecureKYC. All rights reserved.
            </span>
            <span className="w-px h-4 bg-slate-700"></span>
            <a
              href="#"
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

// ---------------- DocumentCard Component (inside same file) ----------------

function DocumentCard({ doc, onDelete, onResubmit }) {
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
        const docId = doc.id || doc._id;
        const latestStatus = await api.getDocumentStatus(docId);
        if (latestStatus) {
          setStatus(latestStatus);
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
    if (!bytes) return "0 B";
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

  const handleResubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

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
      const id = doc.id || doc._id;
      await onResubmit(id, file);
    } catch (error) {
      console.error("Failed to resubmit document:", error);
      alert("Failed to resubmit document. Please try again.");
    } finally {
      setIsResubmitting(false);
    }
  };

  const handlePreview = async () => {
    try {
      const docId = doc.id || doc._id;
      const previewUrl = await api.previewDocument(docId);
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to preview document:", error);
      alert("Failed to preview document. Please try again.");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const docId = doc.id || doc._id;
      await api.downloadDocument(docId);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusConfig = (st) => {
    switch (st?.toLowerCase()) {
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
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.borderColor} rounded-2xl opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500`}
      ></div>
      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl rounded-2xl border transition-all duration-500 group-hover:bg-slate-800/60 group-hover:shadow-xl ${statusConfig.borderColor} ${statusConfig.glowColor}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent rounded-2xl pointer-events-none"></div>

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-4 mb-5">
                <motion.div
                  className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FileText className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <DocumentMeta doc={doc} />
                </div>
              </div>

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

            <div className="flex items-center gap-4">
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

              <motion.div
                className={`relative px-4 py-2.5 rounded-full flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} backdrop-blur-sm`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <StatusIcon className="w-4 h-4" />
                <span className="capitalize font-semibold text-sm tracking-wide">
                  {status}
                </span>
                <div
                  className={`absolute inset-0 rounded-full ${statusConfig.bgColor} opacity-50 blur-md -z-10`}
                ></div>
              </motion.div>
            </div>
          </div>

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

// Subcomponent for metadata inside the card
function DocumentMeta({ doc }) {
  const filename = doc.filename || doc.name || "Untitled Document";
  const type = doc.type || doc.mimeType || "Document Type Unknown";
  const createdAt = doc.createdAt || doc.uploadedAt || null;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date not available";

  return (
    <div className="text-white">
      <h3 className="font-semibold text-lg leading-tight truncate">
        {filename}
      </h3>
      <p className="text-sm text-slate-400">{type}</p>
      <p className="text-xs text-slate-500">{formattedDate}</p>
    </div>
  );
}

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
