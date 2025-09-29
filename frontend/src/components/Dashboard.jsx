// FILE: frontend/src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Loader, Info, X } from 'lucide-react';
import { authService } from '../utils/auth';
import { recordsService } from '../utils/recordsService';
import { adminService } from '../utils/adminService';
import Sidebar from './Sidebar';

// Lazy load view components for better performance
const DocumentUpload = lazy(() => import('./DocumentUpload'));
const RecordsList = lazy(() => import('./RecordsList'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const DashboardOverview = lazy(() => import('./DashboardOverview'));
const AdminFraudReview = lazy(() => import('./AdminFraudReview'));
const ExtractionResults = lazy(() => import('./ExtractionResults'));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard'));
const StatusBadge = lazy(() => import('./StatusBadge'));

// Reusable Components
const NotificationToast = ({ notification, onDismiss }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);
  const typeClasses = { info: 'bg-blue-500/80 border-blue-400', error: 'bg-red-500/80 border-red-400', success: 'bg-green-500/80 border-green-400' };
  return (
    <div role="alert" aria-live="assertive" className={`flex items-start p-4 rounded-lg shadow-2xl backdrop-blur-lg border text-white transition-all duration-300 ${typeClasses[notification.type] || typeClasses.info} ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" /><p className="flex-grow text-sm">{notification.message}</p>
      <button onClick={() => setShow(false)} aria-label="Dismiss" className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
    </div>
  );
};
const LoadingSpinner = () => <div className="flex justify-center items-center h-full w-full p-12"><Loader className="animate-spin h-12 w-12 text-blue-400" /></div>;
const Header = ({ title, onToggleSidebar }) => (
    <header className="sticky top-0 z-30 bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/50 p-4 flex items-center justify-between">
        <button onClick={onToggleSidebar} className="lg:hidden text-gray-400 p-2 -ml-2" aria-label="Toggle sidebar"><Menu className="h-6 w-6" /></button>
        <h2 className="text-2xl font-bold text-white capitalize tracking-wide">{title.replace('_', ' ')}</h2>
        <div className="w-6 lg:hidden" />
    </header>
);

// Custom Hooks for State Management
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
  }, []);
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  return { notifications, addNotification, dismissNotification };
}

function useDashboardData(user, addNotification, onAuthError) {
  const [state, setState] = useState({ stats: {}, records: [], loading: true, error: '' });
  const fetchData = useCallback(async () => {
    if (!user) return;
    setState(s => ({ ...s, loading: true }));
    try {
      const [statsData, recordsData] = await Promise.all([recordsService.getStats(), recordsService.getRecords()]);
      setState({ stats: statsData, records: recordsData.records, loading: false, error: '' });
    } catch (err) {
      const errorMessage = `Failed to load dashboard: ${err.message}`;
      setState(s => ({ ...s, loading: false, error: errorMessage }));
      addNotification(errorMessage, 'error');
      if (String(err.message).includes('401')) onAuthError();
    }
  }, [user, addNotification, onAuthError]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { ...state, refetch: fetchData, setRecords: (records) => setState(s => ({...s, records})), setStats: (stats) => setState(s => ({...s, stats})) };
}

function useAdminData(user, addNotification) {
    const [state, setState] = useState({ adminQueue: [], loadingAdmin: false });
    const fetchAdminData = useCallback(async () => {
        if (user?.role !== 'admin') return;
        setState(s => ({ ...s, loadingAdmin: true }));
        try {
            const queueData = await adminService.getQueue();
            setState({ adminQueue: queueData, loadingAdmin: false });
        } catch (err) {
            addNotification(`Failed to load admin data: ${err.message}`, 'error');
            setState(s => ({ ...s, loadingAdmin: false }));
        }
    }, [user, addNotification]);
    return { ...state, fetchAdminData };
}

// MAIN DASHBOARD COMPONENT
const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => authService.getStoredUser());
    const [currentView, setCurrentView] = useState('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [extractionResult, setExtractionResult] = useState(null);
    const [recordToReview, setRecordToReview] = useState(null);

    const { notifications, addNotification, dismissNotification } = useNotifications();
    const handleLogout = useCallback(() => { authService.logout(); setUser(null); navigate('/login'); }, [navigate]);
    const dashboardData = useDashboardData(user, addNotification, handleLogout);
    const adminData = useAdminData(user, addNotification);
    
    useEffect(() => { if (!authService.isAuthenticated()) { navigate('/login'); } }, [navigate]);
    useEffect(() => {
        const adminViews = ['admin', 'analytics', 'compliance'];
        if (adminViews.includes(currentView) && user?.role !== 'admin') {
            addNotification('You do not have permission to view this page.', 'error');
            setCurrentView('overview');
        } else if (currentView === 'admin') {
            adminData.fetchAdminData();
        }
    }, [currentView, user, addNotification, adminData.fetchAdminData]);

    const handleUploadSuccess = useCallback((newRecord) => {
        dashboardData.setRecords(prevRecords => [newRecord, ...prevRecords]);
        dashboardData.setStats(prevStats => ({...prevStats, total_records: (prevStats.total_records || 0) + 1 }));
        setExtractionResult(newRecord);
        setCurrentView('results');
    }, [dashboardData]);
    
    const handleViewRecord = (record) => {
        if (!record) return;
        if (record.status === "pending" && user.role !== "admin") {
            setExtractionResult(record);
            setCurrentView('results');
        } else {
            setRecordToReview(record);
        }
    };

    const viewComponents = useMemo(() => ({
        overview: <DashboardOverview user={user} stats={dashboardData.stats} records={dashboardData.records} setCurrentView={setCurrentView} StatusBadgeComponent={StatusBadge} onViewRecord={handleViewRecord} />,
        upload: <DocumentUpload onUploadSuccess={handleUploadSuccess} addNotification={addNotification} />,
        records: <RecordsList records={dashboardData.records} StatusBadgeComponent={StatusBadge} onViewRecord={handleViewRecord} addNotification={addNotification} fetchDashboardData={dashboardData.refetch} />,
        results: <ExtractionResults extractionResult={extractionResult} setCurrentView={setCurrentView} />,
        admin: <AdminPanel adminQueue={adminData.adminQueue} loading={adminData.loadingAdmin} onRefreshQueue={adminData.fetchAdminData} onActionComplete={dashboardData.refetch} onViewRecord={handleViewRecord} />,
        analytics: <AnalyticsDashboard stats={dashboardData.stats} />,
        compliance: <ComplianceDashboard addNotification={addNotification} onViewDetails={handleViewRecord} />,
    }), [user, dashboardData, adminData, extractionResult, handleUploadSuccess, addNotification]);
    
    if (!user) return null;
    const CurrentViewComponent = viewComponents[currentView] || viewComponents.overview;

    return (
        <div className="min-h-screen font-sans bg-gray-900 text-gray-200">
            <div aria-live="polite" className="fixed top-6 right-6 z-[100] w-full max-w-sm space-y-3">
                {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={dismissNotification} />)}
            </div>
            {recordToReview && (<Suspense fallback={<div />}><AdminFraudReview selectedRecord={recordToReview} onClose={() => setRecordToReview(null)} onReviewDecision={() => { dashboardData.refetch(); adminData.fetchAdminData(); }} /></Suspense>)}
            <Sidebar user={user} currentView={currentView} onNavigate={(view) => { setCurrentView(view); setMobileSidebarOpen(false); }} onLogout={handleLogout} isCollapsed={isSidebarCollapsed} onCollapse={setIsSidebarCollapsed} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
            <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header title={currentView} onToggleSidebar={() => setMobileSidebarOpen(o => !o)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Suspense fallback={<LoadingSpinner />}>
                        {dashboardData.loading && dashboardData.records.length === 0 ? <LoadingSpinner /> : CurrentViewComponent}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;