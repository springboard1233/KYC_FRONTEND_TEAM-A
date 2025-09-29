// CHANGELOG: Corrected a ReferenceError by restoring the main component definition that was accidentally omitted.
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Upload, FileText, BarChart3, Shield, LogOut, Brain, ChevronLeft, ChevronRight, User as UserIcon, X } from 'lucide-react';

const navigationItems = [
  { id: 'overview', name: 'Dashboard', icon: Home },
  { id: 'upload', name: 'AI Upload', icon: Upload },
  { id: 'records', name: 'My Records', icon: FileText },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, adminOnly: true },
  { id: 'admin', name: 'Admin Panel', icon: Shield, adminOnly: true },
  { id: 'compliance', name: 'Compliance', icon: Shield, adminOnly: true },
];

const NavItem = memo(({ item, isActive, isCollapsed, onClick }) => (
    <button onClick={onClick} aria-label={item.name} aria-current={isActive ? 'page' : undefined} className={`w-full text-left rounded-lg flex items-center transition-all duration-200 group relative ${isActive ? 'bg-blue-600/40 text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'} ${isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5'}`}>
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-gray-400 group-hover:text-white'}`} />
        <AnimatePresence>
            {!isCollapsed && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto', transition: { delay: 0.1, duration: 0.2 } }} exit={{ opacity: 0, width: 0 }} className="ml-3 font-medium overflow-hidden whitespace-nowrap">{item.name}</motion.span>}
        </AnimatePresence>
        {isCollapsed && <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{item.name}</div>}
    </button>
));

const UserProfile = memo(({ user, handleLogout, isCollapsed }) => (
    <div className={`p-4 border-t border-gray-700/50 ${isCollapsed ? 'space-y-4' : ''}`}>
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-blue-300 font-bold flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5"/>}
            </div>
            {!isCollapsed && (
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
            )}
        </div>
         <button onClick={handleLogout} className={`w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors ${isCollapsed ? 'p-2' : 'px-3 py-2'}`}>
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Logout</span>}
        </button>
    </div>
));


// --- MAIN SIDEBAR COMPONENT (Restored) ---

const Sidebar = ({ user, currentView, onNavigate, onLogout, isCollapsed, onCollapse, isMobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onMobileClose} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className={`flex items-center justify-between border-b border-gray-700/50 flex-shrink-0 ${isCollapsed ? 'p-4 h-[69px]' : 'p-5'}`}>
              <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg shadow-md"><Brain className="h-6 w-6 text-white" /></div>
                  {!isCollapsed && <h1 className="text-xl font-bold text-white tracking-tight ml-3">AI-KYC System</h1>}
              </div>
              <button onClick={onMobileClose} className="lg:hidden p-1 text-gray-400 hover:text-white"><X className="h-5 w-5"/></button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map(item => {
                  if (item.adminOnly && user?.role !== 'admin') return null;
                  return <NavItem key={item.id} item={item} isActive={currentView === item.id} isCollapsed={isCollapsed} onClick={() => onNavigate(item.id)} />;
              })}
          </nav>

          <div className="mt-auto">
              <UserProfile user={user} handleLogout={onLogout} isCollapsed={isCollapsed} />
              <div className="p-2 hidden lg:block">
                  <button onClick={() => onCollapse(!isCollapsed)} className="w-full p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors">
                      {isCollapsed ? <ChevronRight className="h-5 w-5 mx-auto" /> : <ChevronLeft className="h-5 w-5 mx-auto" />}
                  </button>
              </div>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;

