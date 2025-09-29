// CHANGELOG: Revamped into a comprehensive dashboard with KPI cards, lazy-loaded charts, and a more dynamic, hierarchical layout.
import React, { lazy, Suspense, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, CheckSquare, Layers, AlertTriangle, Calendar } from 'lucide-react';

// Lazy load chart components for better initial performance
const DocumentTypesChart = lazy(() => import('./Charts/DocumentTypesChart'));
const FraudTrendsChart = lazy(() => import('./Charts/FraudTrendsChart'));
const RiskCategoriesChart = lazy(() => import('./Charts/RiskCategoriesChart'));
const DocumentStatusChart = lazy(() => import('./Charts/DocumentStatusChart'));

// --- REUSABLE SUB-COMPONENTS ---

const KpiCard = memo(({ title, value, icon: Icon, color }) => (
  <motion.div 
    className={`bg-gray-800/60 p-5 rounded-xl border border-gray-700/80 flex items-start justify-between`}
    whileHover={{ scale: 1.03, backgroundColor: 'rgba(31, 41, 55, 0.8)' }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-${color}-500/10`}>
      <Icon className={`h-6 w-6 text-${color}-400`} />
    </div>
  </motion.div>
));

const ChartCard = memo(({ title, children }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/60 h-full min-h-[400px]">
    <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
    <div className="h-[calc(100%-32px)]">
      {children}
    </div>
  </div>
));

const SkeletonLoader = () => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/60 h-full min-h-[400px] animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-[calc(100%-32px)] bg-gray-700/50 rounded-lg"></div>
    </div>
);

// --- MAIN COMPONENT ---

const AnalyticsDashboard = ({ stats = {}, fraudTrends = [], fraudPatterns = [] }) => {
    const kpiData = useMemo(() => [
        { title: 'Total Records', value: stats.total_records || 0, icon: Layers, color: 'blue' },
        { title: 'Verified', value: stats.verified_count || 0, icon: CheckSquare, color: 'green' },
        { title: 'High Risk', value: stats.high_risk_count || 0, icon: AlertTriangle, color: 'red' },
        { title: 'Avg. Confidence', value: `${(stats.average_confidence_score || 0).toFixed(1)}%`, icon: PieChart, color: 'purple' },
    ], [stats]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center tracking-tight">
                        <BarChart3 className="h-8 w-8 mr-3 text-purple-400" />
                        Fraud & Risk Analytics
                    </h2>
                    <p className="text-gray-400 mt-1">An overview of document processing and risk trends.</p>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-800/70 rounded-lg border border-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <select className="bg-transparent text-sm text-white focus:outline-none">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>All Time</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>

            <Suspense fallback={<SkeletonLoader />}>
                <ChartCard title="Fraud & Confidence Trends Over Time">
                    <FraudTrendsChart data={fraudTrends} />
                </ChartCard>
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Suspense fallback={<SkeletonLoader />}>
                    <ChartCard title="Risk Categories Breakdown">
                        <RiskCategoriesChart data={stats} />
                    </ChartCard>
                </Suspense>
                <Suspense fallback={<SkeletonLoader />}>
                    <ChartCard title="Document Status Distribution">
                        <DocumentStatusChart data={stats} />
                    </ChartCard>
                </Suspense>
                <Suspense fallback={<SkeletonLoader />}>
                    <ChartCard title="Processed Document Types">
                        <DocumentTypesChart data={stats} />
                    </ChartCard>
                </Suspense>
            </div>
            
            {fraudPatterns.length > 0 && (
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/60">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Detected Fraud Patterns</h3>
                    <div className="space-y-3">
                        {fraudPatterns.map((pattern, index) => (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-lg flex items-start gap-4 border border-transparent hover:border-red-500/50 transition-colors">
                                <div className="p-2 bg-red-500/10 rounded-full mt-1">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{pattern.name}</p>
                                    <p className="text-sm text-gray-400">{pattern.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AnalyticsDashboard;
