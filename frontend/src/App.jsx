
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './utils/auth';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Login from './components/Login';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
          <p className="mb-4">Please try refreshing the page or contact support if the issue persists.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute = ({ children, role }) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getStoredUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login', { replace: true });
        } else if (role && user?.role !== role) {
            console.log(`User role ${user?.role} does not match required role ${role}`);
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, role, navigate]);

    if (!isAuthenticated) {
        return null; // Return null while redirecting
    }

    if (role && user?.role !== role) {
        return null; // Return null while redirecting
    }

    return children;
};

// Home component
function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if already authenticated
        if (authService.isAuthenticated()) {
            console.log('User already authenticated, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
        } else {
            console.log('User not authenticated, redirecting to login');
            navigate('/login', { replace: true });
        }
        
        // Set loading to false after a short delay to prevent flashing
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading...</p>
            </div>
        );
    }

    return null; // Return null as we're redirecting anyway
}

// Main App component
function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Add a catch-all route to redirect unknown paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
}

export default App;