// Enhanced Dashboard.jsx with Dark Mode Theme

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, User, Shield, Upload, FileText, Camera,
    ArrowLeft, CheckCircle, AlertTriangle, BarChart3,
    Home, Settings, Bell, Menu, X, Clock, Star, Zap, Lock,
    TrendingUp, Award, ChevronRight, Eye, Download, Users,
    Target, Globe, Smartphone, Activity, CreditCard, Search, Trash2,
    Plus, Filter, Calendar, Loader, RefreshCw, Save, Database,
    AlertCircle, BookOpen, HardDrive, FileCheck, Cpu, Layers,
    MapPin, Phone, Mail, UserCheck, Hash, Calendar as CalendarIcon
} from 'lucide-react';
import { authService } from '../utils/auth'; // Assuming authService path
import { ocrService } from '../utils/ocrService'; // Assuming ocrService path

// --- Dashboard Component ---

const Dashboard = () => {
    const navigate = useNavigate();

    // --- State Definitions ---
    // User & Auth State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_records: 0,
        aadhaar_count: 0,
        pan_count: 0,
        verified_count: 0,
        avg_confidence: 0
    });

    // UI State
    const [currentView, setCurrentView] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [expandedRecord, setExpandedRecord] = useState(null);

    // Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('aadhaar');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [extractionResult, setExtractionResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [saving, setSaving] = useState(false);

    // Refs to prevent effects firing multiple times
    const hasLoadedOnce = useRef(false);
    const loadingRef = useRef(false);

    // --- Data Fetching Callbacks ---

    // Load initial dashboard data (user info and stats)
    const loadDashboard = useCallback(async () => {
        if (loadingRef.current || hasLoadedOnce.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setError('');

            if (!authService.isAuthenticated()) {
                navigate('/login');
                return;
            }

            const storedUser = authService.getStoredUser();
            if (storedUser) {
                setUser(storedUser);
            }

            // Fetch current user details and stats in parallel
            const [currentUser, userStats] = await Promise.all([
                authService.getCurrentUser(),
                getStats()
            ]);

            setUser(currentUser);
            setStats(userStats);
            hasLoadedOnce.current = true;

        } catch (err) {
            console.error('Dashboard loading error:', err);
            setError(err.message);

            if (err.message.includes('token') || err.message.includes('auth')) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [navigate]);

    // Get user statistics from backend
    const getStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token found');

            const response = await fetch('http://localhost:5000/api/records/stats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.stats;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (err) {
            console.error('Stats fetch error:', err);
            return { total_records: 0, aadhaar_count: 0, pan_count: 0, verified_count: 0, avg_confidence: 0 };
        }
    }, []);

    // Fetch all records for user
    const fetchRecords = useCallback(async () => {
        setLoadingRecords(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token found');

            console.log('🔍 Fetching records...');
            const response = await fetch('http://localhost:5000/api/records', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Records fetched:', data);
                setRecords(data.records || []);
            } else {
                const errorData = await response.json();
                console.error('❌ Records fetch failed:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Failed to fetch records'}`);
            }
        } catch (err) {
            console.error('Failed to fetch records:', err);
            setError(`Failed to load records: ${err.message}`);
            setRecords([]);
        } finally {
            setLoadingRecords(false);
        }
    }, []);

    // --- Event Handlers ---

    // Save extracted data to database manually
    const saveToDatabase = async () => {
        if (!extractionResult) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:5000/api/records/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    extraction_result: extractionResult.extraction_result
                })
            });

            if (response.ok) {
                alert('✅ Record saved to database successfully!');
                const newStats = await getStats();
                setStats(newStats);
                if (currentView === 'records') {
                    await fetchRecords();
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save record');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert(`❌ Failed to save record: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Delete a specific record
    const deleteRecord = async (recordId) => {
        if (!window.confirm('⚠️ Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No access token found');

            console.log('🗑️ Deleting record:', recordId);
            const response = await fetch(`http://localhost:5000/api/records/${recordId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                console.log('✅ Record deleted successfully');
                setRecords(prev => prev.filter(record => record.id !== recordId));
                const newStats = await getStats();
                setStats(newStats);
                alert('✅ Record deleted successfully!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete record');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(`❌ Failed to delete record: ${err.message}`);
        }
    };

    // Download data as JSON file utility
    const downloadJSON = (data, filename) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- Lifecycle Effects ---
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        if (currentView === 'records') {
            console.log('📁 Switching to records view, fetching records...');
            fetchRecords();
        }
    }, [currentView, fetchRecords]);

    // --- File Input Handlers ---
    const handleFileSelect = (file) => {
        try {
            // Assuming ocrService.validateFile exists, otherwise implement simple validation here
            // ocrService.validateFile(file); 
            setSelectedFile(file);
            setUploadError('');
        } catch (err) {
            setUploadError(err.message);
            setSelectedFile(null);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };

    // File upload submission handler
    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            console.log('🔍 Starting OCR extraction...');
            const result = await ocrService.extractDocument(selectedFile, documentType, false); // Don't auto-save

            console.log('✅ OCR Result:', result);
            if (!result.extraction_result && !result.success) {
                throw new Error(result.error || result.details || 'OCR processing failed');
            }

            setExtractionResult(result);
            setCurrentView('results');
            setSelectedFile(null);
            setDocumentType('aadhaar');

        } catch (err) {
            console.error('❌ Upload error:', err);
            let errorMessage = err.message || 'Unknown error occurred';
            if (errorMessage.includes('Network Error')) {
                errorMessage = 'Network error. Please check connection and try again.';
            } else if (errorMessage.includes('422')) {
                errorMessage = 'Document processing failed. Ensure the document is clear and readable.';
            } else if (errorMessage.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
            }
            setUploadError(`❌ Extraction Failed: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    // --- Navigation Handlers ---
    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    const handleBack = () => {
        if (currentView === 'results') {
            setCurrentView('upload');
            setExtractionResult(null);
        } else if (currentView === 'upload' || currentView === 'records' || currentView === 'analytics') {
            setCurrentView('overview');
        } else {
            navigate(-1);
        }
    };

    // --- Render Logic ---

    // Navigation items configuration
    const navigationItems = [
        { id: 'overview', name: 'Dashboard', icon: Home },
        { id: 'upload', name: 'New Verification', icon: Upload },
        { id: 'records', name: 'View Records', icon: FileText },
        { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    ];

    // Loading Screen
    if (loading && !user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <Loader className="animate-spin rounded-full h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-100 mb-2">Loading Dashboard</h3>
                    <p className="text-gray-400">Please wait while we fetch your data...</p>
                </div>
            </div>
        );
    }

    // Error Screen
    if (error && !user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 border border-red-500 rounded-lg shadow-xl p-8 max-w-md mx-auto">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Connection Error</h3>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard Layout
    return (
        <div className="min-h-screen bg-gray-900 flex font-sans text-gray-100">
            {/* --- Sidebar --- */}
            <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0`}>
                {/* Sidebar Header */}
                <div className={`flex items-center justify-between p-4 h-20 border-b border-gray-800 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">VeriSecure</h1>
                                <p className="text-xs text-gray-400">KYC Portal</p>
                            </div>
                        </div>
                    )}
                     <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                                currentView === item.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            } ${sidebarCollapsed ? 'justify-center h-12' : 'h-auto'}`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!sidebarCollapsed && <span className="ml-3 font-medium text-sm">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                {/* User Profile & Logout Section */}
                <div className={`p-3 border-t border-gray-800 ${sidebarCollapsed ? 'space-y-2' : ''}`}>
                   {!sidebarCollapsed && user && (
                        <div className="p-3 mb-2 rounded-lg bg-gray-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400 flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                                </div>
                            </div>
                        </div>
                   )}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-900 hover:text-white rounded-lg transition-colors ${
                            sidebarCollapsed ? 'justify-center h-12' : ''
                        }`}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Bar */}
                <header className="bg-gray-900 shadow-sm border-b border-gray-800 px-6 py-4 h-20 flex items-center justify-between flex-shrink-0 z-10">
                    <div className="flex items-center space-x-4">
                        {(currentView !== 'overview') && (
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white capitalize">{currentView}</h1>
                            <p className="text-sm text-gray-400 mt-1 hidden md:block">
                                {currentView === 'overview' && 'Welcome to your KYC verification dashboard'}
                                {currentView === 'upload' && 'Upload documents for AI-powered data extraction'}
                                {currentView === 'results' && 'Review extracted data and save to database'}
                                {currentView === 'records' && 'Manage your processed document records'}
                                {currentView === 'analytics' && 'View analytics and insights'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                            <Settings className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 p-6 overflow-y-auto bg-gray-900">
                    
                    {/* --- View: Dashboard Overview --- */}
                    {currentView === 'overview' && (
                        <div className="space-y-8">
                            {/* Hero Section */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                                <div className="max-w-3xl">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Shield className="h-8 w-8 opacity-90" />
                                        <span className="px-3 py-1 bg-white bg-opacity-10 rounded-full text-sm font-medium border border-white border-opacity-20">
                                            Secure Verification Hub
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-3">Welcome back, {user?.name || 'Admin'}!</h2>
                                    <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                                        Streamline your KYC process with advanced AI document verification. Upload new documents or review existing records.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => setCurrentView('upload')}
                                            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow"
                                        >
                                            <Upload className="h-4 w-4 inline mr-2" />
                                            Start New Verification
                                        </button>
                                        <button
                                            onClick={() => setCurrentView('records')}
                                            className="border border-white border-opacity-50 text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                                        >
                                            <FileText className="h-4 w-4 inline mr-2" />
                                            Review Processed Records
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard icon={FileText} title="Documents Processed" value={stats.total_records} color="blue" />
                                <StatCard icon={CheckCircle} title="Successfully Verified" value={stats.verified_count} color="green" />
                                <StatCard icon={Star} title="Average Confidence" value={`${Math.round(stats.avg_confidence)}%`} color="yellow" />
                                <StatCard icon={AlertTriangle} title="Pending Review" value={stats.total_records - stats.verified_count} color="red" />
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FeatureCard icon={Globe} title="Document Authentication" color="indigo" description="Advanced OCR technology for accurate data extraction from Aadhaar and PAN cards." />
                                <FeatureCard icon={Lock} title="Secure Processing" color="green" description="Bank-grade security with encrypted data transmission and secure storage." />
                                <FeatureCard icon={Layers} title="Record Management" color="purple" description="Intuitive interface for managing processed documents and extracted data efficiently." />
                            </div>
                        </div>
                    )}

                    {/* --- View: Upload Document --- */}
                    {currentView === 'upload' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-400">
                                    <Upload className="h-8 w-8 text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Upload Document for Verification</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto">
                                    Select document type and upload an image (PNG, JPG) or PDF. Our AI will extract and verify the information.
                                </p>
                            </div>

                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                                <div className="p-8 space-y-8">
                                    {/* Document Type Selection */}
                                    <div>
                                        <label className="block text-lg font-bold text-white mb-4">
                                            1. Select Document Type
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <DocumentTypeSelector
                                                type="aadhaar"
                                                title="Aadhaar Card"
                                                description="Indian identity document"
                                                icon={CreditCard}
                                                selectedType={documentType}
                                                onChange={setDocumentType}
                                                disabled={uploading}
                                                color="blue"
                                            />
                                            <DocumentTypeSelector
                                                type="pan"
                                                title="PAN Card"
                                                description="Tax identification document"
                                                icon={FileText}
                                                selectedType={documentType}
                                                onChange={setDocumentType}
                                                disabled={uploading}
                                                color="purple"
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload Area */}
                                    <div>
                                        <label className="block text-lg font-bold text-white mb-4">
                                            2. Upload File
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 ${
                                                dragActive ? 'border-blue-500 bg-gray-700 scale-105' : 'border-gray-600 hover:border-gray-500'
                                            } ${selectedFile ? 'border-green-500 bg-green-900 bg-opacity-30' : ''}`}
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                        >
                                            {selectedFile ? (
                                                <div className="space-y-4 py-4">
                                                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white mb-2">File Ready</h3>
                                                        <div className="bg-gray-700 rounded-lg p-3 max-w-sm mx-auto border border-gray-600">
                                                            <p className="font-medium text-white break-all">{selectedFile.name}</p>
                                                            <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedFile(null)}
                                                        className="text-red-400 hover:text-red-300 font-medium text-sm"
                                                        disabled={uploading}
                                                    >
                                                        Remove File
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 py-4">
                                                    <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white mb-2">Drag and drop document here</h3>
                                                        <p className="text-gray-400 mb-4">or click to browse files</p>
                                                        <input type="file" accept="image/*,.pdf" onChange={handleFileInput} className="hidden" id="file-upload" disabled={uploading} />
                                                        <label htmlFor="file-upload" className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition-colors">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Choose File
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Supports PNG, JPG, JPEG, PDF (max 16MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {uploadError && (
                                        <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-medium text-red-200 mb-1">Upload Error</h4>
                                                    <p className="text-red-300 text-sm">{uploadError}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Upload Button Footer */}
                                <div className="p-6 bg-gray-800 bg-opacity-50 border-t border-gray-700 mt-6">
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center ${
                                            !selectedFile || uploading
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/30'
                                        }`}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5 mr-3" />
                                                Processing Document...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-5 w-5 mr-3" />
                                                Extract & Verify Data
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- View: Results --- */}
                    {currentView === 'results' && extractionResult && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="text-center">
                                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Processing Complete</h2>
                                <p className="text-gray-400">Review extracted data below and save to your records.</p>
                            </div>

                            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                                <div className="bg-green-900 bg-opacity-40 px-6 py-4 border-b border-green-700">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <Zap className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
                                            <div>
                                                <h3 className="text-lg font-bold text-white">AI Extraction Results</h3>
                                                <p className="text-green-300 text-sm">Document processed successfully.</p>_
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-gray-300 mb-1">Confidence Score</div>
                                            <div className="text-2xl font-bold text-green-400">
                                                {extractionResult.extraction_result?.confidence_score || 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Extracted Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            {Object.entries(extractionResult.extraction_result?.extracted_fields || {}).map(([key, value]) => {
                                                if (key === 'document_type') return null;
                                                return (
                                                    <DataField key={key} label={key} value={value} />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <button
                                            onClick={saveToDatabase}
                                            disabled={saving}
                                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center text-sm"
                                        >
                                            {saving ? ( <Loader className="animate-spin h-4 w-4 mr-2" /> ) : ( <Save className="h-4 w-4 mr-2" /> )}
                                            {saving ? 'Saving...' : 'Save to Database'}
                                        </button>
                                        <button
                                            onClick={() => setCurrentView('upload')}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center text-sm"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Process Another
                                        </button>
                                        <button
                                            onClick={() => setCurrentView('records')}
                                            className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-colors font-medium flex items-center justify-center text-sm"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            View All Records
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- View: Records Management --- */}
                    {currentView === 'records' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Records Management</h2>
                                    <p className="text-gray-400 mt-1">View and manage all processed documents ({records.length} total).</p>
                                </div>
                                {records.length > 0 && (
                                    <div className="flex space-x-3">
                                        <button className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 font-medium flex items-center text-sm transition-colors">
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filter
                                        </button>
                                        <button
                                            onClick={() => downloadJSON(records, `all-records-${Date.now()}.json`)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center text-sm transition-colors"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export All
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Records Display Logic */}
                            {loadingRecords ? (
                                <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                                    <Loader className="animate-spin h-8 w-8 text-blue-400 mx-auto mb-4" />
                                    <p className="text-gray-400">Loading your records...</p>
                                </div>
                            ) : error && currentView === 'records' && records.length === 0 ? (
                                <div className="text-center py-12 bg-red-900 bg-opacity-30 rounded-lg border border-red-700">
                                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-red-200 mb-2">Failed to Load Records</h3>
                                    <p className="text-red-300 mb-4">{error}</p>
                                    <button
                                        onClick={() => { setError(''); fetchRecords(); }}
                                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                                    >
                                        <RefreshCw className="h-4 w-4 inline mr-2" />
                                        Retry Loading
                                    </button>
                                </div>
                            ) : records.length === 0 ? (
                                <div className="text-center py-16 bg-gray-800 rounded-lg shadow border border-gray-700">
                                    <HardDrive className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
                                    <p className="text-gray-400 mb-6">You haven't processed any documents yet.</p>
                                    <button
                                        onClick={() => setCurrentView('upload')}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center mx-auto transition-colors"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload First Document
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((record) => (
                                        <RecordItem
                                            key={record.id}
                                            record={record}
                                            expandedRecord={expandedRecord}
                                            setExpandedRecord={setExpandedRecord}
                                            downloadJSON={downloadJSON}
                                            deleteRecord={deleteRecord}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- View: Analytics --- */}
                    {currentView === 'analytics' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center py-16 bg-gray-800 rounded-lg shadow border border-gray-700">
                                <BarChart3 className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h3>
                                <p className="text-gray-400 mb-6">Comprehensive analytics and reporting features are coming soon.</p>
                                <div className="bg-yellow-500 bg-opacity-20 text-yellow-200 px-6 py-3 rounded-lg font-medium inline-flex items-center text-sm border border-yellow-500 border-opacity-50">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Under Development
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Child Components ---

// Stat Card for Overview Page
const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
        blue: { bg: 'bg-blue-900', text: 'text-blue-300', iconBg: 'bg-blue-500' },
        green: { bg: 'bg-green-900', text: 'text-green-300', iconBg: 'bg-green-500' },
        yellow: { bg: 'bg-yellow-900', text: 'text-yellow-300', iconBg: 'bg-yellow-500' },
        red: { bg: 'bg-red-900', text: 'text-red-300', iconBg: 'bg-red-500' },
    };
    const theme = colors[color] || colors.blue;

    return (
        <div className={`p-5 rounded-xl shadow-lg border border-gray-800 ${theme.bg} bg-opacity-30`}>
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.iconBg}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className={`text-sm font-medium ${theme.text}`}>{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
};

// Feature Card for Overview Page
const FeatureCard = ({ icon: Icon, title, description, color }) => {
     const colors = {
        indigo: 'text-indigo-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
    };
    const themeColor = colors[color] || 'text-gray-400';

    return (
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300 hover:shadow-xl">
            <Icon className={`h-8 w-8 mb-4 ${themeColor}`} />
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

// Document Type Selector for Upload Form
const DocumentTypeSelector = ({ type, title, description, icon: Icon, selectedType, onChange, disabled, color }) => {
    const isSelected = selectedType === type;
    const colors = {
        blue: { border: 'border-blue-500', bg: 'bg-blue-900', iconBg: 'bg-blue-500', iconColor: 'text-blue-300' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-900', iconBg: 'bg-purple-500', iconColor: 'text-purple-300' },
    };
    const theme = colors[color] || colors.blue;

    return (
        <label className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected ? `${theme.border} ${theme.bg} bg-opacity-30 shadow-md` : 'border-gray-700 hover:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
                type="radio"
                value={type}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
                disabled={disabled}
            />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${isSelected ? theme.iconBg : 'bg-gray-700'}`}>
                <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : theme.iconColor}`} />
            </div>
            <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm text-gray-400">{description}</div>
            </div>
            {isSelected && <CheckCircle className="h-5 w-5 text-green-400 ml-auto flex-shrink-0" />}
        </label>
    );
};

// Record Item for Records List Page
const RecordItem = ({ record, expandedRecord, setExpandedRecord, downloadJSON, deleteRecord }) => {
    const isExpanded = expandedRecord === record.id;
    const docTypeInfo = {
        aadhaar: { icon: UserCheck, color: 'blue', label: 'Aadhaar Card' },
        pan: { icon: CreditCard, color: 'purple', label: 'PAN Card' }
    };
    const info = docTypeInfo[record.document_type] || { icon: FileCheck, color: 'gray', label: record.document_type || 'Document' };

    const colors = {
        blue: { bg: 'bg-blue-900', text: 'text-blue-300', border: 'border-blue-700' },
        purple: { bg: 'bg-purple-900', text: 'text-purple-300', border: 'border-purple-700' },
        gray: { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700' },
    };
    const theme = colors[info.color];

    return (
        <div className={`bg-gray-800 rounded-lg shadow border ${isExpanded ? theme.border : 'border-gray-700'} transition-all duration-300 overflow-hidden`}>
            {/* Record Header */}
            <div className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors ${isExpanded ? `${theme.bg} bg-opacity-20` : ''}`} onClick={() => setExpandedRecord(isExpanded ? null : record.id)}>
                <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.bg} bg-opacity-50`}>
                        <info.icon className={`h-5 w-5 ${theme.text}`} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate capitalize">
                            {record.extracted_fields?.name || info.label}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center space-x-4">
                            <span>ID: {record.extracted_fields?.pan_number || record.extracted_fields?.aadhaar_number || 'N/A'}</span>
                            <span className="hidden md:inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1.5" />{new Date(record.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <span className={`hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full ${theme.bg} bg-opacity-80 text-white`}>
                        {record.confidence_score ? `${Math.round(record.confidence_score)}%` : 'N/A'}
                    </span>
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-800 bg-opacity-50">
                    <div className="p-6 space-y-6">
                        <h4 className="text-md font-bold text-white border-b border-gray-700 pb-2 mb-4">Extracted Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            {Object.entries(record.extracted_fields || {}).map(([key, value]) => (
                                <DataField key={key} label={key} value={value} />
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-700 flex flex-wrap gap-3 justify-end">
                             <button
                                onClick={() => downloadJSON(record, `record-${record.id}.json`)}
                                className="text-blue-400 hover:text-blue-300 bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg font-medium flex items-center text-sm transition-colors"
                                title="Download JSON"
                            >
                                <Download className="h-4 w-4 mr-2" /> Download
                            </button>
                            <button
                                onClick={() => deleteRecord(record.id)}
                                className="text-red-400 hover:text-red-300 bg-red-900 hover:bg-red-800 px-4 py-2 rounded-lg font-medium flex items-center text-sm transition-colors"
                                title="Delete Record"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Data Field for displaying key-value pairs
const DataField = ({ label, value }) => {
    // Format label: "date_of_birth" -> "Date Of Birth"
    const formattedLabel = label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    return (
        <div className="border border-gray-700 rounded-lg p-3 bg-gray-900 transition-colors hover:bg-gray-700">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{formattedLabel}</div>
            <div className="text-sm text-white font-medium break-words">
                {value || <span className="text-gray-500 italic">Not detected</span>}
            </div>
        </div>
    );
};

export default Dashboard;