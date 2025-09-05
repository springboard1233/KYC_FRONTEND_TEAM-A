import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Plus,
} from "lucide-react";

const Dashboard = () => {
  const [documents] = useState([
    {
      id: 1,
      type: "Aadhaar Card",
      status: "verified",
      uploadDate: "2024-01-15",
      confidence: 98.5,
    },
    {
      id: 2,
      type: "PAN Card",
      status: "processing",
      uploadDate: "2024-01-20",
      confidence: null,
    },
    {
      id: 3,
      type: "Driving License",
      status: "pending",
      uploadDate: "2024-01-22",
      confidence: null,
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-success-foreground">Verified</Badge>;
      case "processing":
        return <Badge className="bg-warning text-warning-foreground">Processing</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="gradient-primary p-3 rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Manage your document verification</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="gradient-card border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="gradient-primary p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Documents</p>
                    <p className="text-2xl font-bold text-foreground">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-success p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold text-foreground">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-warning p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold text-foreground">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="gradient-secondary p-2 rounded-lg">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                    <p className="text-2xl font-bold text-foreground">98.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Documents List */}
            <div className="lg:col-span-2">
              <Card className="gradient-card border-0 shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground">My Documents</CardTitle>
                  <Link to="/upload">
                    <Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-smooth">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload New
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-smooth"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(doc.status)}
                        <div>
                          <h4 className="font-medium text-foreground">{doc.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {doc.confidence && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {doc.confidence}% confidence
                            </p>
                            <Progress value={doc.confidence} className="w-20 h-2" />
                          </div>
                        )}
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="gradient-card border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/upload" className="block">
                    <Button className="w-full justify-start gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-smooth">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </Link>
                  <Link to="/profile" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link to="/history" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="gradient-primary border-0 text-primary-foreground">
                <CardContent className="p-6 text-center space-y-3">
                  <Shield className="h-8 w-8 mx-auto" />
                  <h3 className="font-semibold">Secure & Protected</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Your documents are encrypted and stored securely with bank-grade security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;