import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">SecureKYC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered document verification and KYC solutions for businesses worldwide.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@securekyc.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Document Verification</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Identity Verification</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Fraud Detection</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">API Integration</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">About Us</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Careers</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Security</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Terms of Service</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Compliance</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-smooth">Data Protection</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SecureKYC. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            Powered by AI • ISO 27001 Certified • GDPR Compliant
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;