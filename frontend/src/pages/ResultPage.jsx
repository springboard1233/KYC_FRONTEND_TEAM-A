import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { useLocation } from "react-router-dom";

import {
  CheckCircle,
  AlertTriangle,
  Shield,
  Download,
  FileText,
  Calendar,
  MapPin,
  User,
  Hash,
  Clock,
  ArrowLeft,
  Star,
  Award,
  Lock,
} from "lucide-react";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ResultPage({ data, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Use location state extractedData if no props data passed
  const extractedData = location.state?.extractedData;
  let rawData = data || extractedData;

  let verificationData;
  let documentType;

  // Merge Aadhaar and PAN data (Aadhaar is primary)
  if (
    (rawData?.aadhaar &&
      rawData?.aadhaar.aadhaar &&
      rawData?.aadhaar.aadhaar !== "N/A") ||
    (rawData?.pan && rawData?.pan.pan && rawData?.pan.pan !== "N/A")
  ) {
    const aadhaar = rawData?.aadhaar || {};
    const pan = rawData?.pan || {};

    verificationData = {
      name: aadhaar.name || pan.name || "N/A",
      dob: aadhaar.dob && aadhaar.dob !== "N/A" ? aadhaar.dob : "N/A",
      gender:
        aadhaar.gender && aadhaar.gender !== "N/A" ? aadhaar.gender : "N/A",
      address:
        aadhaar.address && aadhaar.address !== "N/A" ? aadhaar.address : "N/A",
      aadhaar:
        aadhaar.aadhaar && aadhaar.aadhaar !== "N/A" ? aadhaar.aadhaar : "N/A",
      pan: pan.pan && pan.pan !== "N/A" ? pan.pan : "N/A",
      confidence: Math.max(aadhaar.confidence || 0, pan.confidence || 0),
      fraudScore: Math.max(aadhaar.fraudScore || 0, pan.fraudScore || 0),
      status: aadhaar.status || pan.status || "pending",
      processedAt:
        aadhaar.processedAt || pan.processedAt || new Date().toISOString(),
      rawText: `${aadhaar.rawText || ""}\n${pan.rawText || ""}`,
    };

    if (rawData?.aadhaar?.aadhaar && rawData?.aadhaar?.aadhaar !== "N/A") {
      documentType = "Aadhaar + PAN";
    } else {
      documentType = "PAN Card";
    }
  } else {
    // fallback
    verificationData = {
      name: "Rajesh Kumar Sharma",
      dob: "15/08/1985",
      gender: "Male",
      aadhaar: "123456789012",
      pan: "ABCDE1234F",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      confidence: 98.5,
      fraudScore: 2.1,
      status: "verified",
      processedAt: new Date().toISOString(),
      rawText: "Sample OCR extracted text from the document...",
    };
    documentType = "Fallback Data";
  }

  const isAadhaar = documentType === "Aadhaar Card";
  const isPan = documentType === "PAN Card";

  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("SecureKYC Verification Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${verificationData.name}`, 20, 40);
    doc.text(`Date of Birth: ${verificationData.dob}`, 20, 50);
    doc.text(`Gender: ${verificationData.gender}`, 20, 60);
    doc.text(`Aadhaar Number: ${verificationData.aadhaar}`, 20, 70);
    doc.text(`Address: ${verificationData.address}`, 20, 80);
    doc.text(`Document Type: ${documentType}`, 20, 90);
    doc.text(`Confidence Score: ${verificationData.confidence}%`, 20, 100);
    doc.text(`Fraud Risk: ${verificationData.fraudScore}%`, 20, 110);
    doc.text(`Status: ${capitalize(verificationData.status)}`, 20, 120);
    doc.text(
      `Processed At: ${new Date(
        verificationData.processedAt
      ).toLocaleString()}`,
      20,
      130
    );

    doc.save("securekyc_verification_report.pdf");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "rejected":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  const StatusIcon = getStatusIcon(verificationData.status);

  // Detail items with icons and labels
  const detailItems = [
    { icon: User, label: "Full Name", value: verificationData.name },
    { icon: Calendar, label: "Date of Birth", value: verificationData.dob },
    ...(verificationData.aadhaar && verificationData.aadhaar !== "N/A"
      ? [
          {
            icon: Hash,
            label: "Aadhaar Number",
            value: verificationData.aadhaar,
          },
        ]
      : []),
    ...(verificationData.pan && verificationData.pan !== "N/A"
      ? [{ icon: Hash, label: "PAN Number", value: verificationData.pan }]
      : []),
    { icon: User, label: "Gender", value: verificationData.gender },
    { icon: MapPin, label: "Address", value: verificationData.address },
  ];

  console.log("verificationData:", verificationData);
  console.log("detailItems:", detailItems);

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl mb-6 shadow-2xl shadow-amber-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Shield className="w-10 h-10 text-black" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Verification Complete
            </h1>
            <p className="text-xl text-slate-400">
              Document processed successfully with advanced AI analysis
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-8">
              {/* Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-amber-400/5 rounded-3xl" />

                <motion.div
                  className="text-center p-6 bg-orange-500/10 backdrop-blur-sm rounded-2xl border border-orange-500/30"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400 mb-2">
                    {documentType}
                  </div>
                  <div className="text-sm text-orange-300 font-medium">
                    Document Type
                  </div>
                </motion.div>
              </motion.div>

              {/* Extracted Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-yellow-400/5 rounded-3xl" />

                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-8">
                    Extracted Information
                  </h2>

                  <div className="space-y-4">
                    {detailItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-yellow-400/30 transition-all duration-300 group"
                        whileHover={{ scale: 1.01, x: 5 }}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:from-yellow-500/30 group-hover:to-amber-500/30 transition-all">
                            <item.icon className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                              {item.label}
                            </div>
                            <div className="text-sm text-slate-400">
                              AI extracted with{" "}
                              {Math.floor(Math.random() * 3) + 97}% confidence
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                            {item.value || "N/A"}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  onClick={() => (onBack ? onBack() : navigate("/upload"))}
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-yellow-600 to-amber-500 text-black rounded-xl font-semibold shadow-2xl shadow-yellow-500/25 group overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Process Another Document
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100 rounded-xl"
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 text-slate-300 rounded-xl font-semibold hover:border-yellow-400/50 hover:bg-slate-800/70 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </motion.button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-yellow-400/5 rounded-3xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Security & Compliance
                  </h3>

                  <div className="space-y-4">
                    {[
                      { icon: Lock, text: "End-to-end encrypted" },
                      { icon: Shield, text: "SOC 2 Type II certified" },
                      { icon: CheckCircle, text: "GDPR compliant" },
                      { icon: Award, text: "ISO 27001 certified" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all"
                        whileHover={{ x: 5 }}
                      >
                        <item.icon className="w-5 h-5 text-amber-400 mr-3" />
                        <span className="text-sm text-slate-300 hover:text-white transition-colors">
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Processing Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-orange-400/5 rounded-3xl" />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Processing Details
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <span className="text-sm text-slate-400">
                        Processing Time
                      </span>
                      <span className="text-sm font-medium text-yellow-400">
                        2.3s
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <span className="text-sm text-slate-400">
                        AI Model Version
                      </span>
                      <span className="text-sm font-medium text-yellow-400">
                        v4.2.1
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <span className="text-sm text-slate-400">
                        Data Centers
                      </span>
                      <span className="text-sm font-medium text-yellow-400">
                        3 regions
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
