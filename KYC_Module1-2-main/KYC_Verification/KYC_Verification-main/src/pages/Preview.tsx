import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import {
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Preview = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock extracted data from AI processing
  const extractedData = {
    documentType: "Aadhaar Card",
    confidence: 97.8,
    status: "verified",
    extractedInfo: {
      name: "Rahul Kumar Singh",
      dateOfBirth: "15/08/1990",
      gender: "Male",
      address: "123 MG Road, Sector 15, Gurgaon, Haryana - 122001",
      aadhaarNumber: "XXXX XXXX 1234",
      fatherName: "Suresh Kumar Singh",
    },
    verificationChecks: [
      { check: "Document Authenticity", status: "passed", confidence: 98.5 },
      { check: "Template Matching", status: "passed", confidence: 96.2 },
      { check: "Security Features", status: "passed", confidence: 99.1 },
      { check: "Fraud Detection", status: "passed", confidence: 97.3 },
    ],
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    // Simulate final verification
    setTimeout(() => {
      toast({
        title: "Verification Complete!",
        description: "Your document has been successfully verified and saved.",
      });
      setIsConfirming(false);
      navigate("/review");
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-success text-success-foreground">Passed</Badge>;
      case "failed":
        return <Badge className="bg-destructive text-destructive-foreground">Failed</Badge>;
      case "warning":
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Document Preview</h1>
            <p className="text-muted-foreground mt-2">
              Review the extracted information and verification results
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Info */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{extractedData.documentType}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Badge className="bg-success text-success-foreground">
                        {extractedData.confidence}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium text-foreground">{extractedData.extractedInfo.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="font-medium text-foreground">{extractedData.extractedInfo.dateOfBirth}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gender</p>
                          <p className="font-medium text-foreground">{extractedData.extractedInfo.gender}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                          <p className="font-medium text-foreground">{extractedData.extractedInfo.aadhaarNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Father's Name</p>
                          <p className="font-medium text-foreground">{extractedData.extractedInfo.fatherName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium text-foreground">{extractedData.extractedInfo.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Results */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Verification Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {extractedData.verificationChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium text-foreground">{check.check}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{check.confidence}%</p>
                          <Progress value={check.confidence} className="w-16 h-1" />
                        </div>
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overall Status */}
              <Card className="gradient-primary border-0 text-primary-foreground">
                <CardContent className="p-6 text-center space-y-3">
                  <CheckCircle className="h-12 w-12 mx-auto" />
                  <h3 className="text-xl font-bold">Verification Successful</h3>
                  <p className="text-primary-foreground/90">
                    Document has passed all security checks with high confidence.
                  </p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-2xl font-bold">{extractedData.confidence}%</p>
                    <p className="text-sm text-primary-foreground/80">Overall Confidence</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="gradient-card shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-foreground">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-smooth"
                  >
                    {isConfirming ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        Confirm & Save
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate("/upload")}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Upload Another
                  </Button>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="bg-muted border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Secure Processing</p>
                      <p>
                        All verification is done using encrypted AI models. 
                        Your document is not stored on our servers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;