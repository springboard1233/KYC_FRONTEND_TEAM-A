import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Lock,
  Award,
  Users,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description:
        "Enterprise-level encryption and compliance with financial industry standards including PCI DSS and ISO 27001.",
      color: "from-yellow-500 to-amber-600",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description:
        "Advanced OCR technology processes documents in under 3 seconds with 99.7% accuracy rate.",
      color: "from-amber-500 to-yellow-600",
    },
    {
      icon: Award,
      title: "Regulatory Compliance",
      description:
        "Fully compliant with KYC, AML, and GDPR regulations. Trusted by 500+ financial institutions.",
      color: "from-yellow-600 to-amber-500",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Secure Document Upload",
      description:
        "Upload your identity documents through our encrypted, HTTPS-secured platform with end-to-end encryption.",
      icon: FileCheck,
    },
    {
      step: "02",
      title: "AI-Powered Analysis",
      description:
        "Our advanced AI engine extracts and validates information while detecting fraudulent documents in real-time.",
      icon: Zap,
    },
    {
      step: "03",
      title: "Instant Verification",
      description:
        "Receive immediate verification results with detailed compliance reports and secure data storage.",
      icon: CheckCircle,
    },
  ];

  const stats = [
    { number: "99.7%", label: "Accuracy Rate" },
    { number: "500+", label: "Banks Trust Us" },
    { number: "2.5M+", label: "Verifications" },
    { number: "<3s", label: "Processing Time" },
  ];

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-medium mb-6 backdrop-blur-sm">
                <Shield className="w-4 h-4 mr-2" />
                Trusted by 500+ Financial Institutions
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Enterprise-Grade
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Identity Verification
                </span>
              </h1>

              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Secure, compliant, and intelligent KYC verification platform
                designed for financial institutions. Advanced fraud detection
                with{" "}
                <span className="font-semibold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  99.7% accuracy
                </span>{" "}
                and instant processing.
              </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 hover:border-yellow-500/30 transition-all duration-300">
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => navigate("/login")}
                className="relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-500 text-black rounded-xl font-semibold text-lg shadow-2xl shadow-yellow-500/25 overflow-hidden group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center">
                  Start Verification
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <button
                onClick={() => window.open("/demo/demo.mp4", "_blank")}
                className="px-8 py-4 border-2 border-slate-700 text-slate-300 rounded-xl font-semibold text-lg hover:border-yellow-500/50 hover:bg-slate-900/50 hover:text-white transition-all duration-300"
              >
                View Demo
              </button>
            </motion.div>

            {/* Security Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center items-center space-x-8 mt-12 text-sm text-slate-400"
            >
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                ISO 27001 Certified
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                PCI DSS Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                GDPR Ready
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Financial Institutions Choose Us
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Built specifically for banks, credit unions, and financial
                services with enterprise-grade security and compliance.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-yellow-500/30 transition-all duration-500 group hover:shadow-2xl hover:shadow-yellow-500/10"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-black mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>

                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-600/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-600/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-900 to-black opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Secure Verification Process
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Our streamlined process ensures maximum security while
                maintaining user experience excellence.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center group"
              >
                <div className="relative mb-8">
                  <motion.div
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-600 to-amber-500 rounded-3xl flex items-center justify-center text-black text-2xl font-bold shadow-2xl shadow-yellow-500/25 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.step}
                  </motion.div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full flex items-center justify-center z-20 shadow-lg">
                    <step.icon className="w-5 h-5 text-black" />
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-yellow-600 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
                  {step.title}
                </h3>

                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {step.description}
                </p>

                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-yellow-400/50 to-amber-400/50 transform -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/20 via-amber-900/20 to-yellow-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900/30 backdrop-blur-xl rounded-3xl p-12 border border-slate-800"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Secure Your KYC Process?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Join hundreds of financial institutions that trust our platform
              for secure, compliant identity verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={() => navigate("/login")}
                className="relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-500 text-black rounded-xl font-semibold text-lg shadow-2xl shadow-yellow-500/25 overflow-hidden group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <button className="px-8 py-4 border-2 border-slate-700 text-slate-300 rounded-xl font-semibold text-lg hover:border-yellow-500/50 hover:bg-slate-900/50 hover:text-white transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-slate-300 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-white font-bold text-lg">SecureKYC</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Enterprise-grade identity verification platform trusted by
                financial institutions worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  KYC Verification
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  AML Compliance
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Document Authentication
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Fraud Detection
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  About Us
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Security
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Compliance
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Contact
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Privacy Policy
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Terms of Service
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  Cookie Policy
                </li>
                <li className="hover:text-yellow-400 transition-colors cursor-pointer">
                  GDPR
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} SecureKYC. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm">
              <span className="flex items-center text-slate-400">
                <Shield className="w-4 h-4 mr-1" />
                SOC 2 Certified
              </span>
              <span className="flex items-center text-slate-400">
                <Lock className="w-4 h-4 mr-1" />
                256-bit Encryption
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
