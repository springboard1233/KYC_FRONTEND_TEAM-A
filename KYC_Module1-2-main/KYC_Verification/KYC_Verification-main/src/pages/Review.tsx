import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import {
  Download,
  CheckCircle,
  FileText,
  Share2,
  Eye,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Review = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Mock verification report data
  const verificationReport = {
    id: "VR-2024-001234",
    documentType: "Aadhaar Card",
    holderName: "Rahul Kumar Singh",
    verificationDate: "2024-01-22",
    verificationTime: "14:30:25",
    status: "verified",
    confidence: 97.8,
    expiryDate: "2025-01-22",
    checksPerformed: [
      "Document Authenticity",
      "Template Matching", 
      "Security Features",
      "Fraud Detection",
      "Data Validation"
    ],
    summary: {
      totalChecks: 5,
      passed: 5,
      failed: 0,
      warnings: 0
    }
  };

  const handleDownload = async (format: string) => {
    setIsDownloading(true);
    
    try {
      if (format === 'pdf') {
        // Create PDF content
        const pdfContent = `
Verification Report - ${verificationReport.id}

Document Type: ${verificationReport.documentType}
Holder Name: ${verificationReport.holderName}
Verification Date: ${verificationReport.verificationDate}
Verification Time: ${verificationReport.verificationTime}
Status: ${verificationReport.status}
Confidence: ${verificationReport.confidence}%

Verification Summary:
- Total Checks: ${verificationReport.summary.totalChecks}
- Passed: ${verificationReport.summary.passed}
- Failed: ${verificationReport.summary.failed}
- Warnings: ${verificationReport.summary.warnings}

Checks Performed:
${verificationReport.checksPerformed.map(check => `✓ ${check}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
Valid Until: ${verificationReport.expiryDate}
        `;
        
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `verification-report-${verificationReport.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } else if (format === 'json') {
        // Create JSON content
        const jsonContent = JSON.stringify(verificationReport, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `verification-report-${verificationReport.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download Complete",
        description: `Verification report downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    // Mock share functionality
    navigator.clipboard.writeText(`Verification Report ID: ${verificationReport.id}`);
    toast({
      title: "Report ID Copied",
      description: "Verification report ID has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Verification Complete</h1>
            <p className="text-muted-foreground mt-2">
              Your document has been successfully verified and is ready for download
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Report */}
            <div className="lg:col-span-2 space-y-6">
              {/* Report Header */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">Verification Report</CardTitle>
                    <Badge className="bg-success text-success-foreground">
                      {verificationReport.status.charAt(0).toUpperCase() + verificationReport.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Report ID: {verificationReport.id}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Document Type</p>
                        <p className="font-medium text-foreground">{verificationReport.documentType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Document Holder</p>
                        <p className="font-medium text-foreground">{verificationReport.holderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Confidence</p>
                        <p className="font-medium text-success">{verificationReport.confidence}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Verification Date</p>
                          <p className="font-medium text-foreground">{verificationReport.verificationDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Verification Time</p>
                          <p className="font-medium text-foreground">{verificationReport.verificationTime}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valid Until</p>
                        <p className="font-medium text-foreground">{verificationReport.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Verification Summary */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Verification Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                        <p className="text-2xl font-bold text-success">{verificationReport.summary.passed}</p>
                        <p className="text-sm text-muted-foreground">Passed</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">{verificationReport.summary.failed}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">{verificationReport.summary.warnings}</p>
                        <p className="text-sm text-muted-foreground">Warnings</p>
                      </div>
                    </div>
                  </div>

                  {/* Checks Performed */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Checks Performed</h3>
                    <div className="space-y-2">
                      {verificationReport.checksPerformed.map((check, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-foreground">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Download Options */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-foreground">Download Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleDownload("pdf")}
                    disabled={isDownloading}
                    className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-smooth"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button
                    onClick={() => handleDownload("json")}
                    disabled={isDownloading}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Report ID
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-foreground">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/upload" className="block">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Verify Another Document
                    </Button>
                  </Link>

                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Original Document
                  </Button>
                </CardContent>
              </Card>

              {/* Report Info */}
              <Card className="bg-muted border border-border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Report Information</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Reports are valid for 1 year from verification date</p>
                      <p>• Can be shared with authorized third parties</p>
                      <p>• Digital signature ensures authenticity</p>
                      <p>• Compliant with data protection regulations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="gradient-secondary border-0 text-secondary-foreground">
                <CardContent className="p-4 text-center space-y-2">
                  <h4 className="font-medium">Need Help?</h4>
                  <p className="text-xs text-secondary-foreground/80">
                    Contact our support team if you have questions about your verification report.
                  </p>
                  <Button size="sm" className="bg-white text-secondary hover:bg-white/90">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Get Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;