import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Shield,
  Upload,
  Brain,
  CheckCircle,
  Clock,
  Lock,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  const features = [
    {
      icon: Upload,
      title: "Easy Document Upload",
      description: "Upload Aadhaar, PAN, or Driving License documents with simple drag-and-drop interface.",
    },
    {
      icon: Shield,
      title: "Secure Verification",
      description: "Bank-grade security with end-to-end encryption for all your sensitive documents.",
    },
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description: "Advanced AI algorithms detect fraud and verify document authenticity in real-time.",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Get verification results in under 30 seconds with our optimized AI pipeline.",
    },
    {
      icon: Lock,
      title: "100% Secure",
      description: "ISO 27001 certified security with GDPR compliance and data protection.",
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join 50,000+ users who trust SecureKYC for their verification needs.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 gradient-mesh overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 gradient-animated opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Secure <span className="gradient-hero bg-clip-text text-transparent">KYC Verification</span> Made Simple
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                  AI-powered document verification platform that processes Aadhaar, PAN, and Driving License documents with military-grade security and lightning-fast results.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-smooth px-8 py-3 text-lg">
                    Start Verification
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="#features">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">30s Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">99.9% Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">ISO Certified</span>
                </div>
              </div>
            </div>

            <div className="relative float-animation">
              <div className="gradient-card rounded-2xl p-8 shadow-elegant relative overflow-hidden">
                <div className="absolute inset-0 gradient-animated opacity-20"></div>
                <img
                  src={heroImage}
                  alt="KYC Verification Platform"
                  className="w-full h-auto rounded-lg shadow-lg relative z-10"
                />
              </div>
              {/* Floating decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/20 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-muted overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Powerful Features for Secure Verification
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of document verification with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card shadow-elegant border-0 hover:shadow-xl transition-smooth">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="gradient-primary p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full gradient-mesh opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Why Choose SecureKYC?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Built for the modern world with cutting-edge technology and uncompromising security standards.
                </p>
              </div>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="gradient-secondary p-2 rounded-lg flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="gradient-primary border-0 text-center p-6">
                <CardContent className="p-0 space-y-2">
                  <div className="text-3xl font-bold text-primary-foreground">50K+</div>
                  <div className="text-primary-foreground/80">Verified Users</div>
                </CardContent>
              </Card>
              <Card className="gradient-secondary border-0 text-center p-6">
                <CardContent className="p-0 space-y-2">
                  <div className="text-3xl font-bold text-secondary-foreground">99.9%</div>
                  <div className="text-secondary-foreground/80">Accuracy Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-success border-0 text-center p-6">
                <CardContent className="p-0 space-y-2">
                  <div className="text-3xl font-bold text-success-foreground">30s</div>
                  <div className="text-success-foreground/80">Avg Processing</div>
                </CardContent>
              </Card>
              <Card className="bg-warning border-0 text-center p-6">
                <CardContent className="p-0 space-y-2">
                  <div className="text-3xl font-bold text-warning-foreground">24/7</div>
                  <div className="text-warning-foreground/80">Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 gradient-hero">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Get Verified?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of users who trust SecureKYC for fast, secure, and reliable document verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 transition-smooth px-8 py-3 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;