
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, Loader, Info, X } from 'lucide-react';
import { authService } from '../utils/auth';
import { recordsService } from '../utils/recordsService';
import { adminService } from '../utils/adminService';
import Sidebar from './Sidebar';

// Lazy load view components
const DocumentUpload = lazy(() => import('./DocumentUpload'));
const RecordsList = lazy(() => import('./RecordsList'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const DashboardOverview = lazy(() => import('./DashboardOverview'));
const AdminFraudReview = lazy(() => import('./AdminFraudReview'));
const ExtractionResults = lazy(() => import('./ExtractionResults'));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard'));
const StatusBadge = lazy(() => import('./StatusBadge'));
const ResultsView = lazy(() => import('./ResultsView'));


const NotificationToast = ({ notification, onDismiss }) => {
  useEffect(() => {
  const timer = setTimeout(() => onDismiss(notification.id), 5000);
  return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);
  const typeClasses = { info: 'bg-blue-500/80', error: 'bg-red-500/80', success: 'bg-green-500/80', warning: 'bg-yellow-500/80' };
  return (
  <motion.div role="alert" aria-live="assertive" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
    className={`flex items-start p-4 rounded-lg shadow-2xl backdrop-blur-lg border border-white/20 text-white ${typeClasses[notification.type] || typeClasses.info}`}>
    <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" /><p className="flex-grow text-sm">{notification.message}</p>
    <button onClick={() => onDismiss(notification.id)} aria-label="Dismiss" className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
  </motion.div>
  );
};
const LoadingSpinner = () => <div className="flex justify-center items-center h-full w-full p-12"><Loader className="animate-spin h-12 w-12 text-blue-400" /></div>;
const Header = ({ title, onToggleSidebar }) => (
  <header className="sticky top-0 z-30 bg-gray-900/60 backdrop-blur-xl border-b border-gray-700/50 p-4 flex items-center justify-between">
    <button onClick={onToggleSidebar} className="lg:hidden text-gray-400 p-2 -ml-2" aria-label="Toggle sidebar"><Menu className="h-6 w-6" /></button>
    <h2 className="text-2xl font-bold text-white capitalize tracking-wide">{title.replace(/_/g, ' ')}</h2>
    <div className="w-6 lg:hidden" />
  </header>
);

// Custom Hooks for State Management
function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const addNotification = useCallback((message, type = 'info') => setNotifications(prev => [{ id: Date.now(), message, type }, ...prev]), []);
  const dismissNotification = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
  return { notifications, addNotification, dismissNotification };
}

function useDashboardData(user, addNotification) {
  const [state, setState] = useState({ stats: {}, records: [], loading: true });
  const fetchData = useCallback(async () => {
  if (!user) return;
  setState(s => ({ ...s, loading: true }));
  try {
    const [statsData, recordsData] = await Promise.all([recordsService.getStats(), recordsService.getRecords()]);
    setState({ stats: statsData, records: recordsData.records, loading: false });
  } catch (err) {
    addNotification(`Failed to load dashboard: ${err.message}`, 'error');
  }
  }, [user, addNotification]);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { ...state, refetch: fetchData, setRecords: (records) => setState(s => ({...s, records})) };
}

function useAdminData(user, addNotification) {
  const [state, setState] = useState({ adminQueue: [], loadingAdmin: true });
  const fetchAdminData = useCallback(async () => {
    if (user?.role !== 'admin') return;
    setState(s => ({ ...s, loadingAdmin: true }));
    try {
      setState({ adminQueue: await adminService.getQueue(), loadingAdmin: false });
    } catch (err) {
      addNotification(`Failed to load admin data: ${err.message}`, 'error');
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
  const [recordToReview, setRecordToReview] = useState(null);

  const { notifications, addNotification, dismissNotification } = useNotifications();
  const handleLogout = useCallback(() => { authService.logout(); navigate('/login'); }, [navigate]);
  const dashboardData = useDashboardData(user, addNotification);
  const adminData = useAdminData(user, addNotification);
    
  useEffect(() => { if (!user) { navigate('/login'); } }, [user, navigate]);
  useEffect(() => {
    const adminViews = ['admin', 'analytics', 'compliance'];
    if (adminViews.includes(currentView) && user?.role !== 'admin') {
      addNotification('Access denied. Admin rights required.', 'error');
      setCurrentView('overview');
    } else if (currentView === 'admin') {
      adminData.fetchAdminData();
    }
  }, [currentView, user, addNotification, adminData.fetchAdminData]);

  const handleUploadSuccess = useCallback((newRecord) => {
    dashboardData.refetch(); // Refetch all data for consistency
    setRecordToReview(newRecord); // Use the review modal to show results
    setCurrentView('records'); // Navigate to records list to see the new entry
    addNotification('Document uploaded and is being processed!', 'success');
  }, [dashboardData, addNotification]);
    
  // NEW: Function to handle the admin's decision from the review modal
  const handleAdminDecision = async (recordId, action, comment) => {
    try {
      await adminService.updateRecordStatus(recordId, action, comment);
      addNotification(`Record successfully ${action}.`, 'success');
      setRecordToReview(null); // Close the modal
      adminData.fetchAdminData(); // Refresh the admin queue
      dashboardData.refetch(); // Refresh user records and stats
    } catch (err) {
      addNotification(`Failed to process decision: ${err.message}`, 'error');
    }
  };

  const viewComponents = useMemo(() => ({
    overview: <DashboardOverview user={user} stats={dashboardData.stats} records={dashboardData.records} setCurrentView={setCurrentView} StatusBadgeComponent={StatusBadge} onViewRecord={setRecordToReview} />,
    upload: <DocumentUpload onUploadSuccess={handleUploadSuccess} addNotification={addNotification} />,
    records: <RecordsList records={dashboardData.records} StatusBadgeComponent={StatusBadge} onViewRecord={setRecordToReview} addNotification={addNotification} fetchDashboardData={dashboardData.refetch} setCurrentView={setCurrentView} />,
    admin: <AdminPanel adminQueue={adminData.adminQueue} loading={adminData.loadingAdmin} onRefreshQueue={adminData.fetchAdminData} onViewRecord={setRecordToReview} addNotification={addNotification} />,
    analytics: <AnalyticsDashboard stats={dashboardData.stats} />,
    compliance: <ComplianceDashboard addNotification={addNotification} onViewDetails={(recordId) => recordsService.getRecordById(recordId).then(setRecordToReview)} />,
  }), [user, dashboardData, adminData, handleUploadSuccess, addNotification]);
    
  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen font-sans bg-gray-900 text-gray-200">
      <div aria-live="polite" className="fixed top-6 right-6 z-[100] w-full max-w-sm space-y-3">
        {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={dismissNotification} />)}
      </div>
            
      <AnimatePresence>
        {recordToReview && (
          <Suspense fallback={<div />}>
            <AdminFraudReview 
              selectedRecord={recordToReview} 
              onClose={() => setRecordToReview(null)} 
              onReviewDecision={handleAdminDecision} // Pass the handler function
            />
          </Suspense>
        )}
      </AnimatePresence>

      <Sidebar user={user} currentView={currentView} onNavigate={(view) => { setCurrentView(view); setMobileSidebarOpen(false); }} onLogout={handleLogout} isCollapsed={isSidebarCollapsed} onCollapse={setIsSidebarCollapsed} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
            
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header title={currentView} onToggleSidebar={() => setMobileSidebarOpen(o => !o)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<LoadingSpinner />}>
            {dashboardData.loading && dashboardData.records.length === 0 ? <LoadingSpinner /> : (viewComponents[currentView] || viewComponents.overview)}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;